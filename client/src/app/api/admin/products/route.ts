import { NextResponse } from "next/server";

import { assertActiveMetadataValues } from "@/lib/adminMetadata";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ProductCreate = {
  sku: string | null;
  name: string;
  category: string;
  description: string;
  format: string;
  fulfillment_type: string;
  price_amount: number;
  currency: string;
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

const productImagesBucket = "product-images";
const maximumImageBytes = 5 * 1024 * 1024;
const supportedImageTypes = new Map([
  ["image/avif", "avif"],
  ["image/gif", "gif"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

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

function getBoolean(payload: Record<string, unknown>, field: string) {
  const value = payload[field];

  if (typeof value !== "boolean") {
    throw new Error(field + " must be true or false.");
  }

  return value;
}

function getStringArray(payload: Record<string, unknown>, field: string) {
  const value = payload[field];

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(field + " must be a list of text values.");
  }

  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

function parseProductCreate(payload: unknown): ProductCreate {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("A product payload is required.");
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

function getImageFiles(formData: FormData) {
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    throw new Error("Select at least one product image.");
  }

  if (files.length > 10) {
    throw new Error("A product can have at most 10 images.");
  }

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

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);

  return slug || "product";
}

async function findAvailableSlug(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  name: string,
) {
  const baseSlug = slugify(name);

  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error("Unable to prepare the product slug: " + error.message);
    }

    if (!data) {
      return candidate;
    }
  }

  throw new Error("Unable to create a unique product slug. Try a more specific name.");
}

function getProductPayload(formData: FormData) {
  const value = formData.get("product");

  if (typeof value !== "string") {
    throw new Error("The product data is missing.");
  }

  try {
    return parseProductCreate(JSON.parse(value) as unknown);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("The product data is invalid.");
    }

    throw error;
  }
}

function getStorageFileName(file: File, position: number) {
  const extension = supportedImageTypes.get(file.type);

  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  return `${String(position + 1).padStart(2, "0")}-${crypto.randomUUID()}.${extension}`;
}

function getCreateError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error
  ) {
    const code = error.code;
    const message = error.message;

    if (code === "23505") {
      if (typeof message === "string" && message.includes("slug")) {
        return "A product with this name already exists. Try a more specific name.";
      }

      return "A product with this SKU already exists. Choose a different SKU.";
    }

    if (code === "23503") {
      return "The selected catalog no longer exists.";
    }
  }

  return error instanceof Error ? error.message : "Unable to create the product.";
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  let product: ProductCreate;
  let files: File[];

  try {
    const formData = await request.formData();
    product = getProductPayload(formData);
    files = getImageFiles(formData);
  } catch (error) {
    return NextResponse.json(
      { error: getCreateError(error) },
      { status: 400 },
    );
  }

  try {
    await assertActiveMetadataValues(supabase, "product", {
      category: [product.category],
      format: [product.format],
      fulfillment_type: [product.fulfillment_type],
      currency: [product.currency],
      ...(product.image_position
        ? { image_position: [product.image_position] }
        : {}),
      tag: product.tags,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getCreateError(error) },
      { status: 400 },
    );
  }

  let slug: string;

  try {
    slug = await findAvailableSlug(supabase, product.name);
  } catch (error) {
    return NextResponse.json(
      { error: getCreateError(error) },
      { status: 500 },
    );
  }

  const storageNames = files.map(getStorageFileName);
  const { data: insertedProduct, error: insertError } = await supabase
    .from("products")
    .insert({
      ...product,
      slug,
      image_url: storageNames[0],
      image_urls: storageNames,
    })
    .select("id, slug")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: getCreateError(insertError) },
      { status: 400 },
    );
  }

  const uploadedPaths: string[] = [];

  try {
    for (const [index, file] of files.entries()) {
      const objectPath = `${slug}/${storageNames[index]}`;
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

    await supabase.from("products").delete().eq("id", insertedProduct.id);

    return NextResponse.json(
      { error: getCreateError(error) },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: insertedProduct.id, slug: insertedProduct.slug }, { status: 201 });
}
