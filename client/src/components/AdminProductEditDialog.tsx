"use client";

import { type FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import AdminProductImageManager, {
  createExistingProductImage,
  type ProductImage,
  validateProductImages,
} from "@/components/AdminProductImageManager";
import { Button } from "@/components/ui/button";
import {
  getMetadataOptionValues,
  type AdminMetadataOption,
} from "@/lib/metadata";
import type { AdminProduct } from "@/lib/adminProducts";

/** Inputs required to edit an existing product record. */
type AdminProductEditDialogProps = {
  metadataOptions: AdminMetadataOption[];
  product: AdminProduct;
  onClose: () => void;
};

/** JSON fields submitted with the ordered gallery when updating a product. */
type ProductUpdatePayload = {
  sku: string | null;
  name: string;
  category: string;
  description: string;
  format: string;
  fulfillment_type: string;
  price_amount: number;
  currency: string;
  image_url: string;
  image_urls: string[];
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

/** Shared styling for one-line inputs in the edit form. */
const inputClassName =
  "mt-1.5 h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-70";
/** Shared styling for multiline inputs in the edit form. */
const textAreaClassName =
  "mt-1.5 min-h-24 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-70";
/** Shared styling for record details that are intentionally not editable. */
const readOnlyClassName =
  "mt-1.5 flex min-h-9 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm text-slate-400";

/** Formats an API timestamp or provides a safe display fallback. */
function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleString();
}

/** Presents nullable inventory values consistently in the record summary. */
function formatInventory(value: number | null) {
  return value === null ? "Not tracked" : String(value);
}

/** Reads a required trimmed text field from the submitted form. */
function getRequiredText(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(field + " is required.");
  }

  return value.trim();
}

/** Reads optional text and normalizes an empty value to null for the API. */
function getOptionalText(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

/** Parses and validates the non-negative product price. */
function getPrice(formData: FormData) {
  const value = Number(getRequiredText(formData, "priceAmount"));

  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Price must be a non-negative number.");
  }

  return value;
}

/** Parses an optional non-negative whole-number form field. */
function getOptionalInteger(formData: FormData, field: string) {
  const value = getOptionalText(formData, field);

  if (value === null) {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw new Error(field + " must be a non-negative whole number.");
  }

  return numberValue;
}

/** Requires an integer field after applying the optional integer parser. */
function getRequiredInteger(formData: FormData, field: string) {
  const value = getOptionalInteger(formData, field);

  if (value === null) {
    throw new Error(field + " is required.");
  }

  return value;
}

/** Converts selected multi-select values into a unique list for the API. */
function getSelectedList(formData: FormData, field: string) {
  return [
    ...new Set(
      formData
        .getAll(field)
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

/** Prefers a server-provided error message over a generic HTTP fallback. */
function getApiError(response: Response, body: unknown) {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }

  return "Unable to save the product (" + response.status + ").";
}

export default function AdminProductEditDialog({
  metadataOptions,
  product,
  onClose,
}: AdminProductEditDialogProps) {
  /** Refreshes the server-rendered product table after a successful update. */
  const router = useRouter();
  const [images, setImages] = useState<ProductImage[]>(() => {
    // Products created before image_urls existed may only have image_url, so
    // retain that legacy fallback when building the editable gallery.
    const currentImages =
      product.imageUrls.length > 0
        ? product.imageUrls
        : product.imageUrl
          ? [product.imageUrl]
          : [];

    return currentImages.map((imageUrl, index) =>
      createExistingProductImage(imageUrl, product.imagePreviewUrls[index]),
    );
  });
  /** Prevents duplicate submissions and changes while saving. */
  const [isSaving, setIsSaving] = useState(false);
  /** Displays client validation or server failures in the dialog. */
  const [error, setError] = useState("");

  useEffect(() => {
    /** Closes the dialog from the keyboard unless a save is already underway. */
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  /** Serializes product fields and the mixed image gallery into multipart data. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      validateProductImages(images);
      /** Captures editable text, number, select, and checkbox values. */
      const formData = new FormData(event.currentTarget);
      /** Stored image names that remain part of the edited gallery. */
      const existingImageUrls = images.flatMap((image) =>
        image.kind === "existing" ? [image.name] : [],
      );
      /** Normalized fields validated by the product update endpoint. */
      const payload: ProductUpdatePayload = {
        sku: getOptionalText(formData, "sku"),
        name: getRequiredText(formData, "name"),
        category: getRequiredText(formData, "category"),
        description: getRequiredText(formData, "description"),
        format: getRequiredText(formData, "format"),
        fulfillment_type: getRequiredText(formData, "fulfillmentType"),
        price_amount: getPrice(formData),
        currency: getRequiredText(formData, "currency").toUpperCase(),
        image_url:
          images[0]?.kind === "existing"
            ? images[0].name
            : product.imageUrl || "new-product-image",
        image_urls: existingImageUrls,
        image_alt: getRequiredText(formData, "imageAlt"),
        image_position: getOptionalText(formData, "imagePosition"),
        tags: getSelectedList(formData, "tags"),
        low_stock_threshold: getOptionalInteger(
          formData,
          "lowStockThreshold",
        ),
        reorder_point: getOptionalInteger(formData, "reorderPoint"),
        reorder_quantity: getOptionalInteger(formData, "reorderQuantity"),
        is_featured: formData.get("isFeatured") === "on",
        is_sample: formData.get("isSample") === "on",
        is_active: formData.get("isActive") === "on",
        catalog_id: getOptionalInteger(formData, "catalogId"),
        display_order: getRequiredInteger(formData, "displayOrder"),
      };

      // Multipart data carries new files while imageOrder preserves the mixed
      // existing/new gallery order after additions, removals, and reordering.
      const requestBody = new FormData();

      requestBody.set("product", JSON.stringify(payload));
      requestBody.set(
        "imageOrder",
        JSON.stringify(
          images.map((image) =>
            image.kind === "existing"
              ? { kind: "existing", name: image.name }
              : { id: image.id, kind: "new" },
          ),
        ),
      );
      images.forEach((image) => {
        if (image.kind === "new") {
          requestBody.append("newImageIds", image.id);
          requestBody.append("images", image.file);
        }
      });

      setIsSaving(true);
      const response = await fetch("/api/admin/products/" + product.id, {
        method: "PATCH",
        body: requestBody,
      });
      const responseBody: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getApiError(response, responseBody));
      }

      router.refresh();
      onClose();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to save the product.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return createPortal(
    <motion.div
      aria-labelledby="edit-product-title"
      aria-modal="true"
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      role="dialog"
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-[calc(100svh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 sm:max-h-[calc(100svh-3rem)]"
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-blue-400">
              Product editor
            </p>
            <h3
              id="edit-product-title"
              className="mt-1 text-lg font-semibold text-white"
            >
              Edit {product.name}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Save changes to update the storefront product record.
            </p>
          </div>
          <Button
            aria-label="Close product editor"
            className="text-white hover:bg-white/10 hover:text-white"
            disabled={isSaving}
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X />
          </Button>
        </div>

        <form
          className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6"
          onSubmit={handleSubmit}
        >
          <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-white">Record details</h4>
              <span className="text-xs text-slate-500">
                These fields cannot be changed here.
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ReadOnlyField label="Product ID" value={String(product.id)} />
              <ReadOnlyField label="Slug" value={product.slug} />
              <ReadOnlyField
                label="Current quantity"
                value={formatInventory(product.quantity)}
              />
              <ReadOnlyField
                label="Legacy stock quantity"
                value={formatInventory(product.legacyStockQuantity)}
              />
              <ReadOnlyField label="Created" value={formatDate(product.createdAt)} />
              <ReadOnlyField label="Last updated" value={formatDate(product.updatedAt)} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Stock balances are read-only because inventory changes are recorded
              as movements.
            </p>
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
              <legend className="px-1 text-sm font-semibold text-white">
                Product details
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  defaultValue={product.name}
                  label="Name"
                  name="name"
                  required
                />
                <TextField
                  defaultValue={product.sku ?? ""}
                  label="SKU"
                  name="sku"
                />
                <SelectField
                  defaultValue={product.category}
                  label="Category"
                  name="category"
                  options={getMetadataOptionValues(
                    metadataOptions,
                    "product",
                    "category",
                    [product.category],
                  )}
                  required
                />
                <SelectField
                  defaultValue={product.format}
                  label="Format"
                  name="format"
                  options={getMetadataOptionValues(
                    metadataOptions,
                    "product",
                    "format",
                    [product.format],
                  )}
                  required
                />
                <SelectField
                  defaultValue={product.fulfillmentType}
                  label="Fulfillment type"
                  name="fulfillmentType"
                  options={getMetadataOptionValues(
                    metadataOptions,
                    "product",
                    "fulfillment_type",
                    [product.fulfillmentType],
                  )}
                  required
                />
                <TextField
                  defaultValue={String(product.catalogId ?? "")}
                  inputMode="numeric"
                  label="Catalog ID"
                  min={1}
                  name="catalogId"
                  type="number"
                />
              </div>
              <TextAreaField
                defaultValue={product.description}
                label="Description"
                name="description"
                required
              />
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
              <legend className="px-1 text-sm font-semibold text-white">
                Price and publishing
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  defaultValue={String(product.priceAmount)}
                  label="Price"
                  min={0}
                  name="priceAmount"
                  required
                  step="0.01"
                  type="number"
                />
                <SelectField
                  defaultValue={product.currency}
                  label="Currency"
                  name="currency"
                  options={getMetadataOptionValues(
                    metadataOptions,
                    "product",
                    "currency",
                    [product.currency],
                  )}
                  required
                />
                <TextField
                  defaultValue={String(product.displayOrder)}
                  label="Display order"
                  min={0}
                  name="displayOrder"
                  required
                  type="number"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <CheckboxField
                  defaultChecked={product.isActive}
                  label="Active"
                  name="isActive"
                />
                <CheckboxField
                  defaultChecked={product.isFeatured}
                  label="Featured"
                  name="isFeatured"
                />
                <CheckboxField
                  defaultChecked={product.isSample}
                  label="Sample"
                  name="isSample"
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
              <legend className="px-1 text-sm font-semibold text-white">
                Media and tags
              </legend>
              <AdminProductImageManager
                disabled={isSaving}
                images={images}
                onChange={setImages}
              />
              <TextField
                defaultValue={product.imageAlt}
                label="Image alt text"
                name="imageAlt"
                required
              />
              <SelectField
                defaultValue={product.imagePosition ?? ""}
                description="Configured in the Product metadata table."
                label="Image position"
                name="imagePosition"
                optional
                options={getMetadataOptionValues(
                  metadataOptions,
                  "product",
                  "image_position",
                  product.imagePosition ? [product.imagePosition] : [],
                )}
              />
              <MultiSelectField
                defaultValues={product.tags}
                description="Hold Ctrl (Windows) or Command (Mac) to select multiple tags."
                label="Tags"
                name="tags"
                options={getMetadataOptionValues(
                  metadataOptions,
                  "product",
                  "tag",
                  product.tags,
                )}
              />
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
              <legend className="px-1 text-sm font-semibold text-white">
                Inventory rules
              </legend>
              <p className="text-sm leading-6 text-slate-400">
                These thresholds guide stock status. They do not alter the
                current stock balance.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                  defaultValue={String(product.lowStockThreshold ?? "")}
                  label="Low-stock threshold"
                  min={0}
                  name="lowStockThreshold"
                  type="number"
                />
                <TextField
                  defaultValue={String(product.reorderPoint ?? "")}
                  label="Reorder point"
                  min={0}
                  name="reorderPoint"
                  type="number"
                />
                <TextField
                  defaultValue={String(product.reorderQuantity ?? "")}
                  label="Reorder quantity"
                  min={0}
                  name="reorderQuantity"
                  type="number"
                />
              </div>
            </fieldset>
          </div>

          {error && (
            <p
              aria-live="polite"
              className="mt-5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <Button
              disabled={isSaving}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-500"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? <LoaderCircle className="animate-spin" /> : null}
              {isSaving ? "Saving changes" : "Save changes"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/** Displays immutable product metadata in the edit dialog's record summary. */
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className={readOnlyClassName}>{value}</div>
    </div>
  );
}

/** Props for a standard one-line edit field. */
type TextFieldProps = {
  defaultValue: string;
  description?: string;
  inputMode?: "numeric";
  label: string;
  maxLength?: number;
  min?: number;
  name: string;
  required?: boolean;
  step?: string;
  type?: "number" | "text";
};

/** Renders a labeled text or numeric field with optional helper text. */
function TextField({
  defaultValue,
  description,
  inputMode,
  label,
  maxLength,
  min,
  name,
  required,
  step,
  type = "text",
}: TextFieldProps) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      {label}
      <input
        className={inputClassName}
        defaultValue={defaultValue}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min}
        name={name}
        required={required}
        step={step}
        type={type}
      />
      {description ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      ) : null}
    </label>
  );
}

/** Props for a metadata-backed select field. */
type SelectFieldProps = {
  defaultValue: string;
  description?: string;
  label: string;
  name: string;
  optional?: boolean;
  options: AdminMetadataOption[];
  required?: boolean;
};

/** Renders a selectable product metadata value with its current default. */
function SelectField({
  defaultValue,
  description,
  label,
  name,
  optional,
  options,
  required,
}: SelectFieldProps) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      {label}
      <select
        className={inputClassName}
        defaultValue={defaultValue}
        name={name}
        required={required}
      >
        {optional ? <option value="">No selection</option> : null}
        {options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.value}
            {!option.isActive ? " (inactive)" : ""}
          </option>
        ))}
      </select>
      {description ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      ) : null}
    </label>
  );
}

/** Props for the tags multi-select control. */
type MultiSelectFieldProps = {
  defaultValues: string[];
  description?: string;
  label: string;
  name: string;
  options: AdminMetadataOption[];
};

/** Renders a multiple-value metadata selector for the product's tags. */
function MultiSelectField({
  defaultValues,
  description,
  label,
  name,
  options,
}: MultiSelectFieldProps) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      {label}
      <select
        className="mt-1.5 min-h-28 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        defaultValue={defaultValues}
        multiple
        name={name}
      >
        {options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.value}
            {!option.isActive ? " (inactive)" : ""}
          </option>
        ))}
      </select>
      {description ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      ) : null}
    </label>
  );
}

/** Props for a multiline edit field. */
type TextAreaFieldProps = {
  defaultValue: string;
  description?: string;
  label: string;
  name: string;
  required?: boolean;
};

/** Renders a labeled multiline field with optional supporting copy. */
function TextAreaField({
  defaultValue,
  description,
  label,
  name,
  required,
}: TextAreaFieldProps) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      {label}
      <textarea
        className={textAreaClassName}
        defaultValue={defaultValue}
        name={name}
        required={required}
      />
      {description ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      ) : null}
    </label>
  );
}

/** Renders a styled boolean product setting. */
function CheckboxField({
  defaultChecked,
  label,
  name,
}: {
  defaultChecked: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-slate-200">
      <input
        className="size-4 accent-blue-500"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      {label}
    </label>
  );
}
