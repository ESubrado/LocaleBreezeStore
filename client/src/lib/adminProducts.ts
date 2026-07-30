import "server-only";

import { getSupabaseClient } from "@/lib/supabase";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
  updated_at: string;
};

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
  imagePaths: string[];
  tags: string[];
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  reorderPoint: number | null;
  reorderQuantity: number | null;
  isFeatured: boolean;
  isSample: boolean;
  isActive: boolean;
  catalogId: number | null;
  displayOrder: number;
  updatedAt: string;
};

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
  updated_at
`;

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
  updated_at
`;

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

function isAbsoluteImageUrl(value: string) {
  return value.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function getProductImagePath(slug: string, imageUrl: string) {
  if (isAbsoluteImageUrl(imageUrl)) {
    return imageUrl;
  }

  const normalizedImageUrl = imageUrl.trim().replace(/^\.?\//, "");

  return ["product-images", slug, ...normalizedImageUrl.split("/")].join("/");
}

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

function mapAdminProductRow(row: AdminProductRow): AdminProduct {
  const imageUrls = toStringArray(row.image_urls);
  const imagePaths = (imageUrls.length > 0
    ? imageUrls
    : row.image_url
      ? [row.image_url]
      : []
  ).map((imageUrl) => getProductImagePath(row.slug, imageUrl));

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
    imagePaths,
    tags: toStringArray(row.tags),
    stockQuantity: row.quantity ?? row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
    reorderPoint: row.reorder_point,
    reorderQuantity: row.reorder_quantity,
    isFeatured: row.is_featured,
    isSample: row.is_sample,
    isActive: row.is_active,
    catalogId: row.catalog_id,
    displayOrder: row.display_order ?? 0,
    updatedAt: row.updated_at,
  };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = getSupabaseClient();

  const productResult = await supabase
    .from("products")
    .select(adminProductColumns)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  let data: unknown = productResult.data;
  let error: { message: string } | null = productResult.error;

  if (error && error.message.includes("image_urls")) {
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
