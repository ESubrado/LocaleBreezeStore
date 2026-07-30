"use client";

import { type FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  getMetadataOptionValues,
  type AdminMetadataOption,
} from "@/lib/metadata";
import type { AdminCatalog } from "@/lib/adminCatalogs";

type AdminCatalogEditDialogProps = {
  catalog: AdminCatalog;
  metadataOptions: AdminMetadataOption[];
  onClose: () => void;
};

type CatalogUpdatePayload = {
  title: string;
  description: string;
  sample_item_count: number;
  image_url: string;
  image_alt: string;
  image_position: string;
  examples: string[];
  display_order: number;
  is_active: boolean;
};

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

function getNonNegativeInteger(formData: FormData, field: string) {
  const value = Number(getRequiredText(formData, field));

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(field + " must be a non-negative whole number.");
  }

  return value;
}

function getList(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return [];
  }

  return [
    ...new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
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

  return "Unable to save the catalog (" + response.status + ").";
}

export default function AdminCatalogEditDialog({
  catalog,
  metadataOptions,
  onClose,
}: AdminCatalogEditDialogProps) {
  const router = useRouter();
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const payload: CatalogUpdatePayload = {
        title: getRequiredText(formData, "title"),
        description: getRequiredText(formData, "description"),
        sample_item_count: getNonNegativeInteger(formData, "sampleItemCount"),
        image_url: getRequiredText(formData, "imageUrl"),
        image_alt: getRequiredText(formData, "imageAlt"),
        image_position: getRequiredText(formData, "imagePosition"),
        examples: getList(formData, "examples"),
        display_order: getNonNegativeInteger(formData, "displayOrder"),
        is_active: formData.get("isActive") === "on",
      };

      setIsSaving(true);
      const response = await fetch("/api/admin/catalogs/" + catalog.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          : "Unable to save the catalog.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return createPortal(
    <motion.div
      aria-labelledby="edit-catalog-title"
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
        className="flex max-h-[calc(100svh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 sm:max-h-[calc(100svh-3rem)]"
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-blue-400">
              Catalog editor
            </p>
            <h3
              className="mt-1 text-lg font-semibold text-white"
              id="edit-catalog-title"
            >
              Edit {catalog.title}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              The catalog slug cannot be changed here.
            </p>
          </div>
          <Button
            aria-label="Close catalog editor"
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
                Catalog details
              </legend>
              <ReadOnlyField label="Catalog ID" value={String(catalog.id)} />
              <ReadOnlyField label="Slug" value={catalog.slug} />
              <TextField defaultValue={catalog.title} label="Title" name="title" required />
              <TextAreaField
                defaultValue={catalog.description}
                label="Description"
                name="description"
                required
              />
              <TextAreaField
                defaultValue={catalog.examples.join(", ")}
                description="Separate examples with commas or new lines."
                label="Examples"
                name="examples"
              />
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
              <legend className="px-1 text-sm font-semibold text-white">
                Media and publishing
              </legend>
              <TextField
                defaultValue={catalog.imageUrl ?? ""}
                label="Image filename or URL"
                name="imageUrl"
                required
              />
              <TextField
                defaultValue={catalog.imageAlt}
                label="Image alt text"
                name="imageAlt"
                required
              />
              <SelectField
                defaultValue={catalog.imagePosition ?? ""}
                description="Configured in the Catalog metadata table."
                label="Image position"
                name="imagePosition"
                options={getMetadataOptionValues(
                  metadataOptions,
                  "catalog",
                  "image_position",
                  catalog.imagePosition ? [catalog.imagePosition] : [],
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  defaultValue={String(catalog.sampleItemCount)}
                  label="Sample item count"
                  min={0}
                  name="sampleItemCount"
                  required
                  type="number"
                />
                <TextField
                  defaultValue={String(catalog.displayOrder)}
                  label="Display order"
                  min={0}
                  name="displayOrder"
                  required
                  type="number"
                />
              </div>
              <CheckboxField
                defaultChecked={catalog.isActive}
                label="Active"
                name="isActive"
              />
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
            <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="mt-1.5 flex min-h-9 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm text-slate-400">
        {value}
      </div>
    </div>
  );
}

function TextField({
  defaultValue,
  label,
  min,
  name,
  required,
  type = "text",
}: {
  defaultValue: string;
  label: string;
  min?: number;
  name: string;
  required?: boolean;
  type?: "number" | "text";
}) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      {label}
      <input
        className={inputClassName}
        defaultValue={defaultValue}
        min={min}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function SelectField({
  defaultValue,
  description,
  label,
  name,
  options,
}: {
  defaultValue: string;
  description: string;
  label: string;
  name: string;
  options: AdminMetadataOption[];
}) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      {label}
      <select className={inputClassName} defaultValue={defaultValue} name={name} required>
        <option disabled value="">
          Select an image position
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.value}
            {!option.isActive ? " (inactive)" : ""}
          </option>
        ))}
      </select>
      <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
    </label>
  );
}

function TextAreaField({
  defaultValue,
  description,
  label,
  name,
  required,
}: {
  defaultValue: string;
  description?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
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
