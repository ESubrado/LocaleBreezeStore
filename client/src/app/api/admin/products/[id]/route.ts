import { NextResponse } from "next/server";

import { assertActiveMetadataValues } from "@/lib/adminMetadata";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Validated non-image fields accepted by the product update endpoint. */
type ProductUpdate = {
  sku: string | null;
  name: string;
  category: string;
  description: string;
  format: string;
  fulfillment_type: string;
  price_amount: number;
  currency: string;
  image_url: string;
  image_urls: string[];
  image_alt: string;
  image_position: string | null;
  tags: string[];
  low_stock_threshold: number | null;
  reorder_point: number | null;
  reorder_quantity: number | null;
  is_featured: boolean;
  is_sample: boolean;
  is_active: boolean;
  catalog_id: number | null;
  display_order: number;
};

/** A persisted storage name or a new client file ID in the requested gallery. */
type ImageOrderItem =
  | { kind: "existing"; name: string }
  | { id: string; kind: "new" };

/** Supabase bucket containing product gallery files. */
const productImagesBucket = "product-images";
/** Per-image upload limit, matching the browser image manager. */
const maximumImageBytes = 5 * 1024 * 1024;
/** Supported upload MIME types and their canonical storage extensions. */
const supportedImageTypes = new Map([
  ["image/avif", "avif"],
  ["image/gif", "gif"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

/** Reads a required, length-limited trimmed string from an untrusted payload. */
function getRequiredString(
  payload: Record<string, unknown>,
  field: string,
  maxLength: number,
) {
  const value = payload[field];

  if (typeof value !== "string") {
    throw new Error(field + " must be text.");
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(field + " is required.");
  }

  if (normalizedValue.length > maxLength) {
    throw new Error(field + " must be " + maxLength + " characters or fewer.");
  }

  return normalizedValue;
}

/** Reads optional text and normalizes empty values to null. */
function getOptionalString(
  payload: Record<string, unknown>,
  field: string,
  maxLength: number,
) {
  const value = payload[field];

  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(field + " must be text.");
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length > maxLength) {
    throw new Error(field + " must be " + maxLength + " characters or fewer.");
  }

  return normalizedValue || null;
}

/** Validates a required or optional non-negative whole-number payload field. */
function getNonNegativeInteger(
  payload: Record<string, unknown>,
  field: string,
  optional = false,
) {
  const value = payload[field];

  if (optional && (value === null || value === undefined || value === "")) {
    return null;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(field + " must be a non-negative whole number.");
  }

  return value;
}

/** Validates that a payload field is a real boolean. */
function getBoolean(payload: Record<string, unknown>, field: string) {
  const value = payload[field];

  if (typeof value !== "boolean") {
    throw new Error(field + " must be true or false.");
  }

  return value;
}

/** Validates and de-duplicates a list of non-empty strings. */
function getStringArray(payload: Record<string, unknown>, field: string) {
  const value = payload[field];

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(field + " must be a list of text values.");
  }

  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

/** Converts untrusted JSON into validated editable product fields. */
function parseProductUpdate(payload: unknown): ProductUpdate {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("A product update payload is required.");
  }

  const values = payload as Record<string, unknown>;
  const priceAmount = values.price_amount;
  const catalogId = values.catalog_id;

  if (
    typeof priceAmount !== "number" ||
    !Number.isFinite(priceAmount) ||
    priceAmount < 0
  ) {
    throw new Error("price_amount must be a non-negative number.");
  }

  if (
    catalogId !== null &&
    (!Number.isInteger(catalogId) ||
      typeof catalogId !== "number" ||
      catalogId < 1)
  ) {
    throw new Error("catalog_id must be a positive whole number or null.");
  }

  const displayOrder = getNonNegativeInteger(values, "display_order");

  if (displayOrder === null) {
    throw new Error("display_order is required.");
  }

  return {
    sku: getOptionalString(values, "sku", 80),
    name: getRequiredString(values, "name", 180),
    category: getRequiredString(values, "category", 120),
    description: getRequiredString(values, "description", 10000),
    format: getRequiredString(values, "format", 80),
    fulfillment_type: getRequiredString(values, "fulfillment_type", 80),
    price_amount: priceAmount,
    currency: getRequiredString(values, "currency", 3).toUpperCase(),
    image_url: getRequiredString(values, "image_url", 2000),
    image_urls: getStringArray(values, "image_urls"),
    image_alt: getRequiredString(values, "image_alt", 1000),
    image_position: getOptionalString(values, "image_position", 40),
    tags: getStringArray(values, "tags"),
    low_stock_threshold: getNonNegativeInteger(
      values,
      "low_stock_threshold",
      true,
    ),
    reorder_point: getNonNegativeInteger(values, "reorder_point", true),
    reorder_quantity: getNonNegativeInteger(values, "reorder_quantity", true),
    is_featured: getBoolean(values, "is_featured"),
    is_sample: getBoolean(values, "is_sample"),
    is_active: getBoolean(values, "is_active"),
    catalog_id: catalogId,
    display_order: displayOrder,
  };
}

/** Parses the product JSON field embedded in a multipart edit request. */
function getMultipartProductUpdate(formData: FormData) {
  const value = formData.get("product");

  if (typeof value !== "string") {
    throw new Error("The product data is missing.");
  }

  try {
    return parseProductUpdate(JSON.parse(value) as unknown);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("The product data is invalid.");
    }

    throw error;
  }
}

function getImageOrder(formData: FormData): ImageOrderItem[] {
  // The client sends references to persisted images and IDs for new file
  // uploads. Validate both before changing the product record or storage.
  const value = formData.get("imageOrder");

  if (typeof value !== "string") {
    throw new Error("The image order is missing.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    throw new Error("The image order is invalid.");
  }

  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 10) {
    throw new Error("Select between 1 and 10 product images.");
  }

  const imageOrder: ImageOrderItem[] = [];
  const imageIds = new Set<string>();
  const imageNames = new Set<string>();

  for (const item of parsed) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("The image order is invalid.");
    }

    const value = item as Record<string, unknown>;

    if (value.kind === "existing" && typeof value.name === "string") {
      const name = value.name.trim();

      if (!name || imageNames.has(name)) {
        throw new Error("The image order contains duplicate or invalid images.");
      }

      imageNames.add(name);
      imageOrder.push({ kind: "existing", name });
      continue;
    }

    if (value.kind === "new" && typeof value.id === "string") {
      const id = value.id.trim();

      if (!id || imageIds.has(id)) {
        throw new Error("The image order contains duplicate or invalid images.");
      }

      imageIds.add(id);
      imageOrder.push({ id, kind: "new" });
      continue;
    }

    throw new Error("The image order is invalid.");
  }

  return imageOrder;
}

/** Validates optional new files included with a product image update. */
function getImageFiles(formData: FormData) {
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  for (const file of files) {
    if (!supportedImageTypes.has(file.type)) {
      throw new Error(
        file.name + " is not a supported image. Use AVIF, GIF, JPEG, PNG, or WebP.",
      );
    }

    if (file.size > maximumImageBytes) {
      throw new Error(file.name + " must be 5 MB or smaller.");
    }
  }

  return files;
}

/** Associates each new image ID in the gallery order with its uploaded file. */
function getNewImageFiles(formData: FormData, imageOrder: ImageOrderItem[]) {
  const files = getImageFiles(formData);
  const ids = formData
    .getAll("newImageIds")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim());
  const newImageIds = imageOrder.flatMap((item) =>
    item.kind === "new" ? [item.id] : [],
  );

  if (files.length !== ids.length || ids.length !== newImageIds.length) {
    throw new Error("The new product images are invalid.");
  }

  if (
    new Set(ids).size !== ids.length ||
    ids.some((id) => !newImageIds.includes(id))
  ) {
    throw new Error("The new product images are invalid.");
  }

  return new Map(ids.map((id, index) => [id, files[index]]));
}

/** Creates a collision-resistant storage name for a newly added image. */
function getStorageFileName(file: File) {
  const extension = supportedImageTypes.get(file.type);

  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  return `${crypto.randomUUID()}.${extension}`;
}

/** Reads the gallery while preserving a legacy primary-image-only fallback. */
function getCurrentImageUrls(imageUrls: unknown, imageUrl: unknown) {
  // image_url is retained as a fallback for rows that predate image_urls.
  if (Array.isArray(imageUrls)) {
    const values = imageUrls.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );

    if (values.length > 0) {
      return values;
    }
  }

  return typeof imageUrl === "string" && imageUrl.trim().length > 0
    ? [imageUrl]
    : [];
}

/** Identifies relative values that belong to the managed Supabase bucket. */
function isStorageImageName(imageUrl: string) {
  return !imageUrl.startsWith("/") && !/^[a-z][a-z0-9+.-]*:/i.test(imageUrl);
}

/** Updates product fields and reconciles its gallery with Supabase Storage. */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  /** Route parameter supplied by Next.js for the product being edited. */
  const { id } = await context.params;
  /** Numeric product identifier used for database lookups and mutations. */
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  /** Authenticated server client used for metadata, database, and storage work. */
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  /** Validated non-image fields from the submitted request. */
  let update: ProductUpdate;
  /** Multipart data is present only when the shared image manager submits edits. */
  let formData: FormData | null = null;
  /** Requested order containing both persisted and newly added images. */
  let imageOrder: ImageOrderItem[] = [];
  /** Maps client-side IDs to the files that need uploading. */
  let newImageFiles = new Map<string, File>();

  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      formData = await request.formData();
      update = getMultipartProductUpdate(formData);
      imageOrder = getImageOrder(formData);
      newImageFiles = getNewImageFiles(formData, imageOrder);
    } else {
      update = parseProductUpdate(await request.json());
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The product data is invalid.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await assertActiveMetadataValues(supabase, "product", {
      category: [update.category],
      format: [update.format],
      fulfillment_type: [update.fulfillment_type],
      currency: [update.currency],
      ...(update.image_position
        ? { image_position: [update.image_position] }
        : {}),
      tag: update.tags,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Select configured metadata values before saving.",
      },
      { status: 400 },
    );
  }

  if (!formData) {
    const { data, error } = await supabase
      .from("products")
      .update(update)
      .eq("id", productId)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Unable to update product: " + error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ id: data.id });
  }

  const { data: currentProduct, error: currentProductError } = await supabase
    .from("products")
    .select("id, slug, image_url, image_urls")
    .eq("id", productId)
    .maybeSingle();

  if (currentProductError) {
    return NextResponse.json(
      { error: "Unable to load product images: " + currentProductError.message },
      { status: 500 },
    );
  }

  if (!currentProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  /** Images currently recorded for this product before applying the edit. */
  const currentImageUrls = getCurrentImageUrls(
    currentProduct.image_urls,
    currentProduct.image_url,
  );
  /** Enables membership checks that prevent retaining another product's image. */
  const currentImageUrlSet = new Set(currentImageUrls);

  if (
    imageOrder.some(
      (image) =>
        image.kind === "existing" && !currentImageUrlSet.has(image.name),
    )
  ) {
    return NextResponse.json(
      { error: "One or more product images are no longer available." },
      { status: 400 },
    );
  }

  /** Generated storage names keyed by their client-side new-image IDs. */
  const newStorageNames = new Map<string, string>();

  try {
    newImageFiles.forEach((file, imageId) => {
      newStorageNames.set(imageId, getStorageFileName(file));
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to prepare product images.",
      },
      { status: 400 },
    );
  }

  /** Final stored gallery order, used for both image_url and image_urls. */
  const nextImageUrls = imageOrder.map((image) =>
    image.kind === "existing" ? image.name : newStorageNames.get(image.id) ?? "",
  );

  if (nextImageUrls.some((imageUrl) => !imageUrl)) {
    return NextResponse.json(
      { error: "One or more new product images are missing." },
      { status: 400 },
    );
  }

  /** Uploaded files retained so a failed update can be rolled back. */
  const uploadedPaths: string[] = [];

  try {
    // Upload first so the database is never updated to point at a file that
    // does not exist. Uploaded files are removed again if a later step fails.
    for (const [imageId, file] of newImageFiles) {
      const storageName = newStorageNames.get(imageId);

      if (!storageName) {
        throw new Error("Unable to prepare product images.");
      }

      const objectPath = `${currentProduct.slug}/${storageName}`;
      const { error } = await supabase.storage
        .from(productImagesBucket)
        .upload(objectPath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw new Error("Unable to upload " + file.name + ": " + error.message);
      }

      uploadedPaths.push(objectPath);
    }
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(productImagesBucket).remove(uploadedPaths);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to upload product images.",
      },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      ...update,
      image_url: nextImageUrls[0],
      image_urls: nextImageUrls,
    })
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(productImagesBucket).remove(uploadedPaths);
    }

    if (!data && !error) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to update product: " +
          (error?.message ?? "Unknown database error."),
      },
      { status: 500 },
    );
  }

  /** Superseded managed files to delete after the database update succeeds. */
  const removedStoragePaths = [
    ...new Set(
      currentImageUrls
        .filter(
          (imageUrl) =>
            !nextImageUrls.includes(imageUrl) && isStorageImageName(imageUrl),
        )
        .map(
          (imageUrl) =>
            `${currentProduct.slug}/${imageUrl.trim().replace(/^\.?\//, "")}`,
        ),
    ),
  ];

  if (removedStoragePaths.length > 0) {
    // Remove only files no longer referenced after the database update. Public
    // URLs and local paths are not managed by this storage bucket.
    const { error: removeError } = await supabase.storage
      .from(productImagesBucket)
      .remove(removedStoragePaths);

    if (removeError) {
      return NextResponse.json({
        id: data.id,
        warning: "Product updated, but removed image files could not be deleted.",
      });
    }
  }

  return NextResponse.json({ id: data.id });
}

/** Deletes a product unless database references require retaining its audit trail. */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  /** Route parameter supplied by Next.js for the product being deleted. */
  const { id } = await context.params;
  /** Numeric product identifier used for the deletion query. */
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  /** Authenticated server client used to perform the guarded deletion. */
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    return NextResponse.json(
      {
        error:
          "This product has inventory history and cannot be deleted. Mark it inactive instead to preserve the audit trail.",
      },
      { status: 409 },
    );
  }

  if (error) {
    return NextResponse.json(
      { error: "Unable to delete product: " + error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}
