import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type AdminMetadataOption,
  type MetadataEntity,
  type MetadataFieldKey,
} from "@/lib/metadata";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MetadataOptionRow = {
  id: number;
  entity_type: MetadataEntity;
  field_key: MetadataFieldKey;
  value: string;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

const metadataColumns = `
  id,
  entity_type,
  field_key,
  value,
  display_order,
  is_active,
  updated_at
`;

function mapMetadataOption(row: MetadataOptionRow): AdminMetadataOption {
  return {
    id: row.id,
    entityType: row.entity_type,
    fieldKey: row.field_key,
    value: row.value,
    displayOrder: row.display_order,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  };
}

function isMissingMetadataTable(error: { code?: string; message: string }) {
  return error.code === "42P01" || error.message.includes("metadata_options");
}

export async function getAdminMetadataOptions(): Promise<AdminMetadataOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("metadata_options")
    .select(metadataColumns)
    .order("entity_type", { ascending: true })
    .order("field_key", { ascending: true })
    .order("display_order", { ascending: true })
    .order("value", { ascending: true });

  if (error && isMissingMetadataTable(error)) {
    return [];
  }

  if (error) {
    throw new Error(
      `Unable to load metadata options from Supabase: ${error.message}`,
    );
  }

  return ((data ?? []) as MetadataOptionRow[]).map(mapMetadataOption);
}

export async function assertActiveMetadataValues(
  supabase: SupabaseClient,
  entityType: MetadataEntity,
  selections: Partial<Record<MetadataFieldKey, string[]>>,
) {
  const expectedValues = Object.entries(selections).flatMap(
    ([fieldKey, values]) =>
      (values ?? []).filter(Boolean).map((value) => ({ fieldKey, value })),
  );

  if (expectedValues.length === 0) {
    return;
  }

  const { data, error } = await supabase
    .from("metadata_options")
    .select("field_key, value")
    .eq("entity_type", entityType)
    .eq("is_active", true);

  if (error) {
    throw new Error(
      "Metadata options are not available. Run client/seed/metadata.sql in Supabase before editing records.",
    );
  }

  const activeValues = new Set(
    ((data ?? []) as Pick<MetadataOptionRow, "field_key" | "value">[]).map(
      (option) => option.field_key + "\u0000" + option.value,
    ),
  );
  const missingValue = expectedValues.find(
    ({ fieldKey, value }) => !activeValues.has(fieldKey + "\u0000" + value),
  );

  if (missingValue) {
    throw new Error(
      `Select a configured ${missingValue.fieldKey.replace(/_/g, " ")} value before saving.`,
    );
  }
}
