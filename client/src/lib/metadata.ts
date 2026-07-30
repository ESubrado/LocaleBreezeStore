export const metadataEntities = ["catalog", "product"] as const;

export type MetadataEntity = (typeof metadataEntities)[number];

export const metadataFields = {
  catalog: [
    {
      key: "image_position",
      label: "Image position",
    },
  ],
  product: [
    {
      key: "category",
      label: "Category",
    },
    {
      key: "format",
      label: "Format",
    },
    {
      key: "fulfillment_type",
      label: "Fulfillment type",
    },
    {
      key: "currency",
      label: "Currency",
    },
    {
      key: "image_position",
      label: "Image position",
    },
    {
      key: "tag",
      label: "Tag",
    },
  ],
} as const;

export type MetadataFieldKey =
  (typeof metadataFields)[MetadataEntity][number]["key"];

export type AdminMetadataOption = {
  id: number;
  entityType: MetadataEntity;
  fieldKey: MetadataFieldKey;
  value: string;
  displayOrder: number;
  isActive: boolean;
  updatedAt: string;
};

export function isMetadataEntity(value: string): value is MetadataEntity {
  return metadataEntities.includes(value as MetadataEntity);
}

export function isMetadataFieldKey(
  entityType: MetadataEntity,
  value: string,
): value is MetadataFieldKey {
  return metadataFields[entityType].some((field) => field.key === value);
}

export function getMetadataFieldLabel(
  entityType: MetadataEntity,
  fieldKey: MetadataFieldKey,
) {
  return (
    metadataFields[entityType].find((field) => field.key === fieldKey)?.label ??
    fieldKey
  );
}

export function getMetadataOptionValues(
  options: AdminMetadataOption[],
  entityType: MetadataEntity,
  fieldKey: MetadataFieldKey,
  selectedValues: string[] = [],
) {
  const selectedValueSet = new Set(selectedValues.filter(Boolean));

  return options.filter(
    (option) =>
      option.entityType === entityType &&
      option.fieldKey === fieldKey &&
      (option.isActive || selectedValueSet.has(option.value)),
  );
}
