import { getSupabaseClient } from "@/lib/supabase";

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
  stock_quantity: number | null;
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
  stockQuantity: number | null;
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
  stock_quantity,
  is_featured,
  is_sample,
  is_active,
  catalog_id,
  display_order,
  updated_at
`;

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
    stockQuantity: row.stock_quantity,
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

  const { data, error } = await supabase
    .from("products")
    .select(adminProductColumns)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Unable to load admin products from Supabase: ${error.message}`);
  }

  return ((data ?? []) as AdminProductRow[]).map(mapAdminProductRow);
}
