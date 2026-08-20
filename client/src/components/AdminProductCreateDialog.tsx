"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  getMetadataOptionValues,
  type AdminMetadataOption,
} from "@/lib/metadata";

type AdminProductCreateDialogProps = {
  defaultDisplayOrder: number;
  metadataOptions: AdminMetadataOption[];
  onClose: () => void;
};

type ProductCreatePayload = {
  sku: string | null;
  name: string;
  category: string;
  description: string;
  format: string;
  fulfillment_type: string;
  price_amount: number;
  currency: string;
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

type SelectedImage = {
  file: File;
  id: string;
  previewUrl: string;
};

const maximumImageBytes = 5 * 1024 * 1024;
const supportedImageTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const inputClassName =
  "mt-1.5 h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-70";
const textAreaClassName =
  "mt-1.5 min-h-24 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-70";

function getRequiredText(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(field + " is required.");
  }

  return value.trim();
}

function getOptionalText(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getPrice(formData: FormData) {
  const value = Number(getRequiredText(formData, "priceAmount"));

  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Price must be a non-negative number.");
  }

  return value;
}

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

function getRequiredInteger(formData: FormData, field: string) {
  const value = getOptionalInteger(formData, field);

  if (value === null) {
    throw new Error(field + " is required.");
  }

  return value;
}

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

function getApiError(response: Response, body: unknown) {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }

  return "Unable to create the product (" + response.status + ").";
}

function validateFiles(files: File[]) {
  if (files.length === 0) {
    throw new Error("Select at least one product image.");
  }

  if (files.length > 10) {
    throw new Error("A product can have at most 10 images.");
  }

  for (const file of files) {
    if (!supportedImageTypes.has(file.type)) {
      throw new Error(
        file.name + " is not supported. Use AVIF, GIF, JPEG, PNG, or WebP.",
      );
    }

    if (file.size > maximumImageBytes) {
      throw new Error(file.name + " must be 5 MB or smaller.");
    }
  }
}

export default function AdminProductCreateDialog({
  defaultDisplayOrder,
  metadataOptions,
  onClose,
}: AdminProductCreateDialogProps) {
  const router = useRouter();
  const previewUrls = useRef(new Set<string>());
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  useEffect(() => {
    const urls = previewUrls.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function addImages(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);

    try {
      validateFiles([...images.map((image) => image.file), ...files]);
      const nextImages = files.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        previewUrls.current.add(previewUrl);

        return {
          file,
          id: crypto.randomUUID(),
          previewUrl,
        };
      });

      setImages((currentImages) => [...currentImages, ...nextImages]);
      setError("");
    } catch (fileError) {
      setError(
        fileError instanceof Error
          ? fileError.message
          : "Unable to add the selected images.",
      );
    }
  }

  function removeImage(id: string) {
    setImages((currentImages) => {
      const image = currentImages.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.previewUrl);
        previewUrls.current.delete(image.previewUrl);
      }

      return currentImages.filter((item) => item.id !== id);
    });
  }

  function moveImage(id: string, direction: -1 | 1) {
    setImages((currentImages) => {
      const currentIndex = currentImages.findIndex((image) => image.id === id);
      const nextIndex = currentIndex + direction;

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= currentImages.length
      ) {
        return currentImages;
      }

      const reorderedImages = [...currentImages];
      const [image] = reorderedImages.splice(currentIndex, 1);
      reorderedImages.splice(nextIndex, 0, image);

      return reorderedImages;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      validateFiles(images.map((image) => image.file));
      const formData = new FormData(event.currentTarget);
      const product: ProductCreatePayload = {
        sku: getOptionalText(formData, "sku"),
        name: getRequiredText(formData, "name"),
        category: getRequiredText(formData, "category"),
        description: getRequiredText(formData, "description"),
        format: getRequiredText(formData, "format"),
        fulfillment_type: getRequiredText(formData, "fulfillmentType"),
        price_amount: getPrice(formData),
        currency: getRequiredText(formData, "currency").toUpperCase(),
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
      const requestBody = new FormData();

      requestBody.set("product", JSON.stringify(product));
      images.forEach((image) => requestBody.append("images", image.file));

      setIsSaving(true);
      const response = await fetch("/api/admin/products", {
        method: "POST",
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
          : "Unable to create the product.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return createPortal(
    <motion.div
      aria-labelledby="create-product-title"
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
              id="create-product-title"
              className="mt-1 text-lg font-semibold text-white"
            >
              Create product
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Add a product, upload its images, and publish it when ready.
            </p>
          </div>
          <Button
            aria-label="Close product creator"
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
          <div className="grid gap-5 lg:grid-cols-2">
            <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
              <legend className="px-1 text-sm font-semibold text-white">
                Product details
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Name" name="name" required />
                <TextField label="SKU" name="sku" />
                <SelectField
                  label="Category"
                  name="category"
                  options={getMetadataOptionValues(
                    metadataOptions,
                    "product",
                    "category",
                  )}
                  required
                />
                <SelectField
                  label="Format"
                  name="format"
                  options={getMetadataOptionValues(
                    metadataOptions,
                    "product",
                    "format",
                  )}
                  required
                />
                <SelectField
                  label="Fulfillment type"
                  name="fulfillmentType"
                  options={getMetadataOptionValues(
                    metadataOptions,
                    "product",
                    "fulfillment_type",
                  )}
                  required
                />
                <TextField
                  inputMode="numeric"
                  label="Catalog ID"
                  min={1}
                  name="catalogId"
                  type="number"
                />
              </div>
              <TextAreaField label="Description" name="description" required />
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
              <legend className="px-1 text-sm font-semibold text-white">
                Price and publishing
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  defaultValue="0"
                  label="Price"
                  min={0}
                  name="priceAmount"
                  required
                  step="0.01"
                  type="number"
                />
                <SelectField
                  label="Currency"
                  name="currency"
                  options={getMetadataOptionValues(
                    metadataOptions,
                    "product",
                    "currency",
                  )}
                  required
                />
                <TextField
                  defaultValue={String(defaultDisplayOrder)}
                  label="Display order"
                  min={0}
                  name="displayOrder"
                  required
                  type="number"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <CheckboxField defaultChecked label="Active" name="isActive" />
                <CheckboxField label="Featured" name="isFeatured" />
                <CheckboxField defaultChecked label="Sample" name="isSample" />
              </div>
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
              <legend className="px-1 text-sm font-semibold text-white">
                Media and tags
              </legend>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-300">
                      Product images
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Upload up to 10 AVIF, GIF, JPEG, PNG, or WebP files (5 MB
                      each). The first image is the primary storefront image.
                    </p>
                  </div>
                  <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20">
                    <ImagePlus className="size-4" />
                    Choose images
                    <input
                      accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={isSaving || images.length >= 10}
                      multiple
                      onChange={(event) => {
                        addImages(event.currentTarget.files);
                        event.currentTarget.value = "";
                      }}
                      type="file"
                    />
                  </label>
                </div>

                {images.length > 0 ? (
                  <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                    {images.map((image, index) => (
                      <li
                        key={image.id}
                        className="overflow-hidden rounded-md border border-white/10 bg-slate-950/50"
                      >
                        <img
                          alt=""
                          className="h-32 w-full object-cover"
                          src={image.previewUrl}
                        />
                        <div className="flex items-center gap-2 p-2">
                          <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
                            {index === 0 ? "Primary · " : ""}
                            {image.file.name}
                          </span>
                          <Button
                            aria-label={`Move ${image.file.name} earlier`}
                            disabled={isSaving || index === 0}
                            onClick={() => moveImage(image.id, -1)}
                            size="icon-xs"
                            type="button"
                            variant="ghost"
                          >
                            <ArrowLeft />
                          </Button>
                          <Button
                            aria-label={`Move ${image.file.name} later`}
                            disabled={isSaving || index === images.length - 1}
                            onClick={() => moveImage(image.id, 1)}
                            size="icon-xs"
                            type="button"
                            variant="ghost"
                          >
                            <ArrowRight />
                          </Button>
                          <Button
                            aria-label={`Remove ${image.file.name}`}
                            className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                            disabled={isSaving}
                            onClick={() => removeImage(image.id)}
                            size="icon-xs"
                            type="button"
                            variant="ghost"
                          >
                            <X />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-4 rounded-md border border-dashed border-white/15 px-3 py-5 text-center text-sm text-slate-500">
                    No images selected yet.
                  </p>
                )}
              </div>
              <TextField label="Image alt text" name="imageAlt" required />
              <SelectField
                description="Configured in the Product metadata table."
                label="Image position"
                name="imagePosition"
                optional
                options={getMetadataOptionValues(
                  metadataOptions,
                  "product",
                  "image_position",
                )}
              />
              <MultiSelectField
                description="Hold Ctrl (Windows) or Command (Mac) to select multiple tags."
                label="Tags"
                name="tags"
                options={getMetadataOptionValues(
                  metadataOptions,
                  "product",
                  "tag",
                )}
              />
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
              <legend className="px-1 text-sm font-semibold text-white">
                Inventory rules
              </legend>
              <p className="text-sm leading-6 text-slate-400">
                These thresholds guide stock status. Set the stock balance after
                creating a shippable product using its Stock action.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                  label="Low-stock threshold"
                  min={0}
                  name="lowStockThreshold"
                  type="number"
                />
                <TextField
                  label="Reorder point"
                  min={0}
                  name="reorderPoint"
                  type="number"
                />
                <TextField
                  label="Reorder quantity"
                  min={0}
                  name="reorderQuantity"
                  type="number"
                />
              </div>
            </fieldset>
          </div>

          {error ? (
            <p
              aria-live="polite"
              className="mt-5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </p>
          ) : null}

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
              {isSaving ? "Creating product" : "Create product"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

type TextFieldProps = {
  defaultValue?: string;
  description?: string;
  inputMode?: "numeric";
  label: string;
  min?: number;
  name: string;
  required?: boolean;
  step?: string;
  type?: "number" | "text";
};

function TextField({
  defaultValue,
  description,
  inputMode,
  label,
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

type SelectFieldProps = {
  description?: string;
  label: string;
  name: string;
  optional?: boolean;
  options: AdminMetadataOption[];
  required?: boolean;
};

function SelectField({
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
      <select className={inputClassName} defaultValue="" name={name} required={required}>
        <option disabled={!optional} value="">
          {optional ? "No selection" : "Select an option"}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.value}
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

function MultiSelectField({
  description,
  label,
  name,
  options,
}: {
  description?: string;
  label: string;
  name: string;
  options: AdminMetadataOption[];
}) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      {label}
      <select
        className="mt-1.5 min-h-28 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        multiple
        name={name}
      >
        {options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.value}
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

function TextAreaField({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      {label}
      <textarea className={textAreaClassName} name={name} required={required} />
    </label>
  );
}

function CheckboxField({
  defaultChecked = false,
  label,
  name,
}: {
  defaultChecked?: boolean;
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
