import "server-only";

import { getSupabaseClient } from "@/lib/supabase";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type AdminCatalogRow = {
  id: number;
  slug: string;
  title: string;
  description: string;
  sample_item_count: number | null;
  image_url?: string | null;
  examples: Json | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminCatalog = {
  id: number;
  slug: string;
  title: string;
  description: string;
  sampleItemCount: number;
  imageUrl: string | null;
  imagePath: string | null;
  examples: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const adminCatalogColumns = `
  id,
  slug,
  title,
  description,
  sample_item_count,
  image_url,
  examples,
  display_order,
  is_active,
  created_at,
  updated_at
`;

const legacyAdminCatalogColumns = `
  id,
  slug,
  title,
  description,
  sample_item_count,
  examples,
  display_order,
  is_active,
  created_at,
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
    const parsed = JSON.parse(value) as Json;
    return toStringArray(parsed);
  } catch {
    return [value];
  }
}

function isAbsoluteImageUrl(value: string) {
  return value.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function getCatalogImagePath(slug: string, imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return null;
  }

  if (isAbsoluteImageUrl(imageUrl)) {
    return imageUrl;
  }

  const normalizedImageUrl = imageUrl.trim().replace(/^\.?\//, "");

  return ["catalog-images", slug, ...normalizedImageUrl.split("/")].join("/");
}

function mapAdminCatalogRow(row: AdminCatalogRow): AdminCatalog {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    sampleItemCount: row.sample_item_count ?? 0,
    imageUrl: row.image_url ?? null,
    imagePath: getCatalogImagePath(row.slug, row.image_url),
    examples: toStringArray(row.examples),
    displayOrder: row.display_order ?? 0,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminCatalogs(): Promise<AdminCatalog[]> {
  const supabase = getSupabaseClient();

  const catalogResult = await supabase
    .from("catalogs")
    .select(adminCatalogColumns)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  let data: unknown = catalogResult.data;
  let error: { message: string } | null = catalogResult.error;

  if (error && error.message.includes("image_url")) {
    const legacyCatalogResult = await supabase
      .from("catalogs")
      .select(legacyAdminCatalogColumns)
      .order("display_order", { ascending: true })
      .order("id", { ascending: true });

    data = legacyCatalogResult.data;
    error = legacyCatalogResult.error;
  }

  if (error) {
    throw new Error(`Unable to load admin catalogs from Supabase: ${error.message}`);
  }

  return ((data ?? []) as AdminCatalogRow[]).map(mapAdminCatalogRow);
}
