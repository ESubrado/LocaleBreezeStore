import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerConfig } from "@/lib/supabase";

/** Supabase JSON values used by the untyped product fields. */
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Database-shaped product row returned by the admin query. */
type AdminProductRow = {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  category: string;
  description: string;
  format: string;
  fulfillment_type: string;
  price_amount: number | string;
  currency: string;
  image_url?: string | null;
  image_urls?: Json | null;
  image_alt: string;
  image_position: string | null;
  tags: Json | null;
  stock_quantity: number | null;
  quantity: number | null;
  low_stock_threshold: number | null;
  reorder_point: number | null;
  reorder_quantity: number | null;
  is_featured: boolean;
  is_sample: boolean;
  is_active: boolean;
  catalog_id: number | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
};

/** Client-safe product model consumed by the admin products table and dialogs. */
export type AdminProduct = {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  category: string;
  description: string;
  format: string;
  fulfillmentType: string;
  price: string;
  priceAmount: number;
  currency: string;
  imageUrl: string | null;
  imageUrls: string[];
  imagePaths: string[];
  imagePreviewUrls: string[];
  imageAlt: string;
  imagePosition: string | null;
  tags: string[];
  legacyStockQuantity: number | null;
  stockQuantity: number | null;
  quantity: number | null;
  lowStockThreshold: number | null;
  reorderPoint: number | null;
  reorderQuantity: number | null;
  isFeatured: boolean;
  isSample: boolean;
  isActive: boolean;
  catalogId: number | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** Full column selection used when the image_urls migration is available. */
const adminProductColumns = `
  id,
  slug,
  sku,
  name,
  category,
  description,
  format,
  fulfillment_type,
  price_amount,
  currency,
  image_url,
  image_urls,
  image_alt,
  image_position,
  tags,
  stock_quantity,
  quantity,
  low_stock_threshold,
  reorder_point,
  reorder_quantity,
  is_featured,
  is_sample,
  is_active,
  catalog_id,
  display_order,
  created_at,
  updated_at
`;

/** Fallback column selection for databases without image_urls yet. */
const legacyAdminProductColumns = `
  id,
  slug,
  sku,
  name,
  category,
  description,
  format,
  fulfillment_type,
  price_amount,
  currency,
  image_url,
  image_alt,
  image_position,
  tags,
  stock_quantity,
  quantity,
  low_stock_threshold,
  reorder_point,
  reorder_quantity,
  is_featured,
  is_sample,
  is_active,
  catalog_id,
  display_order,
  created_at,
  updated_at
`;

/** Normalizes Supabase JSON values or legacy JSON strings into text arrays. */
function toStringArray(value: Json | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }

  if (typeof value !== "string" || value.length === 0) {
    return [];
  }

  try {
    return toStringArray(JSON.parse(value) as Json);
  } catch {
    return [value];
  }
}

/** Detects URLs and local paths that should not be placed under storage folders. */
function isAbsoluteImageUrl(value: string) {
  return value.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

/** Produces a readable bucket-relative image path for the admin table. */
function getProductImagePath(slug: string, imageUrl: string) {
  if (isAbsoluteImageUrl(imageUrl)) {
    return imageUrl;
  }

  const normalizedImageUrl = imageUrl.trim().replace(/^\.?\//, "");

  return ["product-images", slug, ...normalizedImageUrl.split("/")].join("/");
}

function getProductImagePreviewUrl(slug: string, imageUrl: string) {
  // Admin dialogs run in the browser, so convert storage filenames into public
  // URLs here while keeping the raw names for database updates.
  if (isAbsoluteImageUrl(imageUrl)) {
    return imageUrl;
  }

  const normalizedImageUrl = imageUrl.trim().replace(/^\.?\//, "");
  const objectPath = [slug, ...normalizedImageUrl.split("/")]
    .map(encodeURIComponent)
    .join("/");
  const { supabaseUrl } = getSupabaseServerConfig();

  return `${supabaseUrl}/storage/v1/object/public/product-images/${objectPath}`;
}

/** Formats a stored amount using its product currency with a safe fallback. */
function formatPrice(amount: number | string, currency: string) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${currency.toUpperCase()} ${amount}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      currency,
      style: "currency",
    }).format(numericAmount);
  } catch {
    return `${currency.toUpperCase()} ${numericAmount.toFixed(2)}`;
  }
}

/** Maps database naming and JSON fields to the client-safe admin product model. */
function mapAdminProductRow(row: AdminProductRow): AdminProduct {
  /** Gallery values as stored in the current image_urls column. */
  const imageUrls = toStringArray(row.image_urls);
  /** Gallery with a legacy primary-image fallback when image_urls is absent. */
  const storedImageUrls = imageUrls.length > 0
    ? imageUrls
    : row.image_url
      ? [row.image_url]
      : [];
  /** Bucket-relative paths shown in the product table's Images column. */
  const imagePaths = storedImageUrls.map((imageUrl) =>
    getProductImagePath(row.slug, imageUrl),
  );
  /** Browser-accessible URLs used to preview existing images in the edit form. */
  const imagePreviewUrls = storedImageUrls.map((imageUrl) =>
    getProductImagePreviewUrl(row.slug, imageUrl),
  );

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    category: row.category,
    description: row.description,
    format: row.format,
    fulfillmentType: row.fulfillment_type,
    price: formatPrice(row.price_amount, row.currency),
    priceAmount: Number(row.price_amount),
    currency: row.currency,
    imageUrl: row.image_url ?? null,
    imageUrls,
    imagePaths,
    imagePreviewUrls,
    imageAlt: row.image_alt,
    imagePosition: row.image_position,
    tags: toStringArray(row.tags),
    legacyStockQuantity: row.stock_quantity,
    stockQuantity: row.quantity ?? row.stock_quantity,
    quantity: row.quantity,
    lowStockThreshold: row.low_stock_threshold,
    reorderPoint: row.reorder_point,
    reorderQuantity: row.reorder_quantity,
    isFeatured: row.is_featured,
    isSample: row.is_sample,
    isActive: row.is_active,
    catalogId: row.catalog_id,
    displayOrder: row.display_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Loads products for the admin table, including legacy schema compatibility. */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  /** Server client used to load product records for the protected admin page. */
  const supabase = await createServerSupabaseClient();

  /** Preferred query including the modern gallery column. */
  const productResult = await supabase
    .from("products")
    .select(adminProductColumns)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  /** Query data, potentially replaced by the legacy-schema fallback below. */
  let data: unknown = productResult.data;
  /** Query error, potentially replaced by the legacy-schema fallback below. */
  let error: { message: string } | null = productResult.error;

  if (error && error.message.includes("image_urls")) {
    /** Compatible query for installations that have not added image_urls yet. */
    const legacyProductResult = await supabase
      .from("products")
      .select(legacyAdminProductColumns)
      .order("display_order", { ascending: true })
      .order("id", { ascending: true });

    data = legacyProductResult.data;
    error = legacyProductResult.error;
  }

  if (error) {
    throw new Error(`Unable to load admin products from Supabase: ${error.message}`);
  }

  return ((data ?? []) as AdminProductRow[]).map(mapAdminProductRow);
}
