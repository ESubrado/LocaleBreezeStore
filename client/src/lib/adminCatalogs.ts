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

function mapAdminCatalogRow(row: AdminCatalogRow): AdminCatalog {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    sampleItemCount: row.sample_item_count ?? 0,
    examples: toStringArray(row.examples),
    displayOrder: row.display_order ?? 0,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminCatalogs(): Promise<AdminCatalog[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("catalogs")
    .select(adminCatalogColumns)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Unable to load admin catalogs from Supabase: ${error.message}`);
  }

  return ((data ?? []) as AdminCatalogRow[]).map(mapAdminCatalogRow);
}
