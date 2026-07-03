import "server-only";

import { getSupabaseClient, getSupabaseServerConfig } from "@/lib/supabase";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type CatalogRow = {
  id: number;
  slug: string;
  title: string;
  description: string;
  sample_item_count: number | null;
  image_alt: string;
  image_position: string | null;
  examples: Json | null;
  display_order: number | null;
};

type ProductRow = {
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
  is_featured: boolean;
  is_sample: boolean;
  catalog_id: number | null;
  display_order: number | null;
};

export type ProductCatalog = {
  id: number;
  slug: string;
  title: string;
  description: string;
  count: string;
  imageAlt: string;
  imagePosition: string;
  examples: string[];
};

export type Product = {
  id: number;
  slug: string;
  sku?: string;
  name: string;
  category: string;
  description: string;
  format: string;
  fulfillmentType: string;
  price: string;
  imageUrl: string;
  imageUrls: string[];
  imageAlt: string;
  imagePosition?: string;
  tags: string[];
  stockQuantity: number | null;
  isFeatured: boolean;
  isSample: boolean;
  catalogId: number | null;
};

export type ProductCatalogPageData = {
  catalogImage: string;
  catalogs: ProductCatalog[];
  products: Product[];
  stats: {
    sampleProducts: number;
    catalogGroups: number;
    digitalFormats: number;
  };
};

type ProductQueryOptions = {
  featuredOnly?: boolean;
  limit?: number;
};

const catalogImage = "/locale-breeze-general-store-hero.png";
const productImagesBucket = "product-images";
const productImageCount = 8;

const catalogColumns = `
  id,
  slug,
  title,
  description,
  sample_item_count,
  image_alt,
  image_position,
  examples,
  display_order
`;

const productColumns = `
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
  is_featured,
  is_sample,
  catalog_id,
  display_order
`;

const legacyProductColumns = `
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
  is_featured,
  is_sample,
  catalog_id,
  display_order
`;

const baseProductColumns = `
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
  image_alt,
  image_position,
  tags,
  stock_quantity,
  is_featured,
  is_sample,
  catalog_id,
  display_order
`;

function toStringArray(value: Json | null | undefined): string[] {
  // Supabase returns jsonb arrays as normal JavaScript arrays; this guard keeps
  // the UI safe if the database has nulls, mixed values, or an accidental string.
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }

  if (typeof value !== "string" || value.length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Json;
    return toStringArray(parsed);
  } catch {
    return [value];
  }
}

function isAbsoluteImageUrl(value: string) {
  return value.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function resolveProductImageUrl(slug: string, imageUrl: string) {
  const normalizedImageUrl = imageUrl.trim().replace(/^\.?\//, "");

  if (isAbsoluteImageUrl(imageUrl)) {
    return imageUrl;
  }

  const { supabaseUrl } = getSupabaseServerConfig();
  const objectPath = [slug, ...normalizedImageUrl.split("/")]
    .map(encodeURIComponent)
    .join("/");

  return `${supabaseUrl}/storage/v1/object/public/${productImagesBucket}/${objectPath}`;
}

function getDefaultProductImageUrls(slug: string) {
  return Array.from(
    { length: productImageCount },
    (_, index) => resolveProductImageUrl(slug, `${index + 1}.png`),
  );
}

function isMissingProductImageUrlsColumn(message: string) {
  return message.includes("image_urls");
}

function isMissingProductImageUrlColumn(message: string) {
  return message.includes("image_url");
}

function formatCatalogCount(sampleItemCount: number | null) {
  const count = sampleItemCount ?? 0;
  const label = count === 1 ? "sample item" : "sample items";

  return `${count} ${label}`;
}

function formatPrice(amount: number | string, currency: string) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${currency.toUpperCase()} ${amount}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(numericAmount);
  } catch {
    return `${currency.toUpperCase()} ${numericAmount.toFixed(2)}`;
  }
}

function mapCatalogRow(row: CatalogRow): ProductCatalog {
  // This converts database snake_case columns into the camelCase shape the
  // existing React components already understand.
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    count: formatCatalogCount(row.sample_item_count),
    imageAlt: row.image_alt,
    imagePosition: row.image_position ?? "center",
    examples: toStringArray(row.examples),
  };
}

function mapProductRow(row: ProductRow): Product {
  const imageUrls = toStringArray(row.image_urls).map((imageUrl) =>
    resolveProductImageUrl(row.slug, imageUrl),
  );
  const resolvedImageUrls =
    imageUrls.length > 0 ? imageUrls : getDefaultProductImageUrls(row.slug);
  const imageUrl =
    resolvedImageUrls[0] ??
    (row.image_url
      ? resolveProductImageUrl(row.slug, row.image_url)
      : catalogImage);

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku ?? undefined,
    name: row.name,
    category: row.category,
    description: row.description,
    format: row.format,
    fulfillmentType: row.fulfillment_type,
    price: formatPrice(row.price_amount, row.currency),
    imageUrl,
    imageUrls: resolvedImageUrls,
    imageAlt: row.image_alt,
    imagePosition: row.image_position ?? undefined,
    tags: toStringArray(row.tags),
    stockQuantity: row.stock_quantity,
    isFeatured: row.is_featured,
    isSample: row.is_sample,
    catalogId: row.catalog_id,
  };
}

function getProductStats(products: Product[], catalogs: ProductCatalog[]) {
  const digitalFormats = new Set(
    products
      .filter((product) => product.category === "Digital")
      .map((product) => product.format),
  ).size;

  return {
    sampleProducts: products.filter((product) => product.isSample).length,
    catalogGroups: catalogs.length,
    digitalFormats,
  };
}

function raiseSupabaseError(tableName: string, message: string): never {
  throw new Error(`Unable to load ${tableName} from Supabase: ${message}`);
}

export async function getProductCatalogs(): Promise<ProductCatalog[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("catalogs")
    .select(catalogColumns)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    raiseSupabaseError("catalogs", error.message);
  }

  return ((data ?? []) as CatalogRow[]).map(mapCatalogRow);
}

export async function getProducts({
  featuredOnly = false,
  limit,
}: ProductQueryOptions = {}): Promise<Product[]> {
  const supabase = getSupabaseClient();

  // Start with all public products, then optionally add filters. Building the
  // query this way keeps every product list consistent about active rows/order.
  let query = supabase
    .from("products")
    .select(productColumns)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const productResult = await query;
  let data: unknown = productResult.data;
  let error: { message: string } | null = productResult.error;

  if (error && isMissingProductImageUrlsColumn(error.message)) {
    let legacyQuery = supabase
      .from("products")
      .select(legacyProductColumns)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("id", { ascending: true });

    if (featuredOnly) {
      legacyQuery = legacyQuery.eq("is_featured", true);
    }

    if (limit) {
      legacyQuery = legacyQuery.limit(limit);
    }

    const legacyProductResult = await legacyQuery;
    data = legacyProductResult.data;
    error = legacyProductResult.error;
  }

  if (error && isMissingProductImageUrlColumn(error.message)) {
    let baseQuery = supabase
      .from("products")
      .select(baseProductColumns)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("id", { ascending: true });

    if (featuredOnly) {
      baseQuery = baseQuery.eq("is_featured", true);
    }

    if (limit) {
      baseQuery = baseQuery.limit(limit);
    }

    const baseProductResult = await baseQuery;
    data = baseProductResult.data;
    error = baseProductResult.error;
  }

  if (error) {
    raiseSupabaseError("products", error.message);
  }

  return ((data ?? []) as ProductRow[]).map(mapProductRow);
}

export async function getFeaturedProducts(limit = 5): Promise<Product[]> {
  const featuredProducts = await getProducts({ featuredOnly: true, limit });

  // If no rows are marked featured yet, the homepage still has useful products
  // while you are filling out the new database.
  if (featuredProducts.length > 0) {
    return featuredProducts;
  }

  return getProducts({ limit });
}

export async function getProductById(
  id: number,
): Promise<Product | undefined> {
  const supabase = getSupabaseClient();

  const productResult = await supabase
    .from("products")
    .select(productColumns)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  let data: unknown = productResult.data;
  let error: { message: string } | null = productResult.error;

  if (error && isMissingProductImageUrlsColumn(error.message)) {
    const legacyProductResult = await supabase
      .from("products")
      .select(legacyProductColumns)
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    data = legacyProductResult.data;
    error = legacyProductResult.error;
  }

  if (error && isMissingProductImageUrlColumn(error.message)) {
    const baseProductResult = await supabase
      .from("products")
      .select(baseProductColumns)
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    data = baseProductResult.data;
    error = baseProductResult.error;
  }

  if (error) {
    raiseSupabaseError("products", error.message);
  }

  return data ? mapProductRow(data as ProductRow) : undefined;
}

export async function getProductCatalogPageData(): Promise<ProductCatalogPageData> {
  const [catalogs, products] = await Promise.all([
    getProductCatalogs(),
    getProducts(),
  ]);

  return {
    catalogImage,
    catalogs,
    products,
    stats: getProductStats(products, catalogs),
  };
}
