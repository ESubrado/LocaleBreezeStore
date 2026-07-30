import {
  isMetadataEntity,
  isMetadataFieldKey,
  type MetadataEntity,
  type MetadataFieldKey,
} from "@/lib/metadata";

export type MetadataOptionUpdate = {
  entity_type: MetadataEntity;
  field_key: MetadataFieldKey;
  value: string;
  display_order: number;
  is_active: boolean;
};

export function parseMetadataOptionUpdate(
  payload: unknown,
): MetadataOptionUpdate {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Metadata option details are required.");
  }

  const values = payload as Record<string, unknown>;
  const entityType = values.entity_type;
  const fieldKey = values.field_key;
  const value = values.value;
  const displayOrder = values.display_order;
  const isActive = values.is_active;

  if (typeof entityType !== "string" || !isMetadataEntity(entityType)) {
    throw new Error("Choose a catalog or product metadata group.");
  }

  if (
    typeof fieldKey !== "string" ||
    !isMetadataFieldKey(entityType, fieldKey)
  ) {
    throw new Error("Choose a valid metadata field.");
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Metadata value is required.");
  }

  if (value.trim().length > 120) {
    throw new Error("Metadata value must be 120 characters or fewer.");
  }

  if (
    typeof displayOrder !== "number" ||
    !Number.isInteger(displayOrder) ||
    displayOrder < 0
  ) {
    throw new Error("Display order must be a non-negative whole number.");
  }

  if (typeof isActive !== "boolean") {
    throw new Error("Metadata status must be active or inactive.");
  }

  return {
    entity_type: entityType,
    field_key: fieldKey,
    value: value.trim(),
    display_order: displayOrder,
    is_active: isActive,
  };
}
