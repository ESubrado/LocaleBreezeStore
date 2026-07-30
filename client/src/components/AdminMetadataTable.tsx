"use client";

import { useState } from "react";
import { LoaderCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  getMetadataFieldLabel,
  metadataFields,
  type AdminMetadataOption,
  type MetadataEntity,
  type MetadataFieldKey,
} from "@/lib/metadata";

type MetadataDraft = {
  fieldKey: MetadataFieldKey;
  value: string;
  displayOrder: string;
  isActive: boolean;
};

const inputClassName =
  "h-8 w-full rounded-md border border-white/10 bg-slate-950/60 px-2 text-sm text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";

function getDefaultDraft(
  entityType: MetadataEntity,
  displayOrder: number,
): MetadataDraft {
  return {
    fieldKey: metadataFields[entityType][0].key,
    value: "",
    displayOrder: String(displayOrder),
    isActive: true,
  };
}

function getResponseError(response: Response, body: unknown) {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }

  return "Unable to save metadata (" + response.status + ").";
}

function formatOptionCount(count: number) {
  return `${count} ${count === 1 ? "value" : "values"}`;
}

export default function AdminMetadataTable({
  entityType,
  options,
}: {
  entityType: MetadataEntity;
  options: AdminMetadataOption[];
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<MetadataDraft>(() =>
    getDefaultDraft(entityType, options.length + 1),
  );
  const [error, setError] = useState("");

  function updateDraft(values: Partial<MetadataDraft>) {
    setDraft((currentDraft) => ({ ...currentDraft, ...values }));
  }

  function startAdding() {
    setError("");
    setEditingId(null);
    setDraft(getDefaultDraft(entityType, options.length + 1));
    setIsAdding(true);
  }

  function startEditing(option: AdminMetadataOption) {
    setError("");
    setIsAdding(false);
    setEditingId(option.id);
    setDraft({
      fieldKey: option.fieldKey,
      value: option.value,
      displayOrder: String(option.displayOrder),
      isActive: option.isActive,
    });
  }

  function cancelEditing() {
    setError("");
    setIsAdding(false);
    setEditingId(null);
    setDraft(getDefaultDraft(entityType, options.length + 1));
  }

  async function saveOption(method: "POST" | "PATCH", id?: number) {
    const displayOrder = Number(draft.displayOrder);

    if (draft.value.trim().length === 0) {
      setError("Metadata value is required.");
      return;
    }

    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      setError("Display order must be a non-negative whole number.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(
        id === undefined ? "/api/admin/metadata" : "/api/admin/metadata/" + id,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity_type: entityType,
            field_key: draft.fieldKey,
            value: draft.value.trim(),
            display_order: displayOrder,
            is_active: draft.isActive,
          }),
        },
      );
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getResponseError(response, body));
      }

      cancelEditing();
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save metadata.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function removeOption(option: AdminMetadataOption) {
    const confirmed = window.confirm(
      `Remove “${option.value}” from ${getMetadataFieldLabel(
        entityType,
        option.fieldKey,
      )}? This is only possible when no existing record uses it.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/metadata/" + option.id, {
        method: "DELETE",
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getResponseError(response, body));
      }

      router.refresh();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove metadata.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold capitalize text-foreground">
            {entityType} metadata
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Values available when editing {entityType === "catalog" ? "catalogs" : "products"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400">
            {formatOptionCount(options.length)}
          </span>
          <Button
            className="border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:text-white"
            disabled={isSaving || isAdding}
            onClick={startAdding}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus />
            Add value
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[38rem] text-left text-sm">
          <thead className="bg-white/5 text-xs font-semibold uppercase tracking-normal text-slate-400">
            <tr>
              <th className="px-4 py-3">Field</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isAdding ? (
              <MetadataOptionFormRow
                draft={draft}
                entityType={entityType}
                isSaving={isSaving}
                onCancel={cancelEditing}
                onChange={updateDraft}
                onSave={() => saveOption("POST")}
              />
            ) : null}
            {options.length > 0 ? (
              options.map((option) =>
                editingId === option.id ? (
                  <MetadataOptionFormRow
                    key={option.id}
                    draft={draft}
                    entityType={entityType}
                    isSaving={isSaving}
                    onCancel={cancelEditing}
                    onChange={updateDraft}
                    onSave={() => saveOption("PATCH", option.id)}
                  />
                ) : (
                  <tr key={option.id}>
                    <td className="px-4 py-3 text-slate-300">
                      {getMetadataFieldLabel(entityType, option.fieldKey)}
                    </td>
                    <td className="max-w-56 px-4 py-3 font-medium text-foreground">
                      <span className="block truncate" title={option.value}>
                        {option.value}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {option.displayOrder}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          option.isActive
                            ? "inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-300"
                            : "inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-400"
                        }
                      >
                        {option.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          className="border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:text-white"
                          disabled={isSaving || editingId !== null}
                          onClick={() => startEditing(option)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Pencil />
                          Edit
                        </Button>
                        <Button
                          className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-100"
                          disabled={isSaving || editingId !== null}
                          onClick={() => removeOption(option)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Trash2 />
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ),
              )
            ) : !isAdding ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={5}>
                  No metadata values configured.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {error ? (
        <p
          aria-live="polite"
          className="m-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}

function MetadataOptionFormRow({
  draft,
  entityType,
  isSaving,
  onCancel,
  onChange,
  onSave,
}: {
  draft: MetadataDraft;
  entityType: MetadataEntity;
  isSaving: boolean;
  onCancel: () => void;
  onChange: (values: Partial<MetadataDraft>) => void;
  onSave: () => void;
}) {
  return (
    <tr className="bg-blue-500/[0.04]">
      <td className="px-4 py-3">
        <select
          aria-label="Metadata field"
          className={inputClassName}
          disabled={isSaving}
          onChange={(event) =>
            onChange({ fieldKey: event.target.value as MetadataFieldKey })
          }
          value={draft.fieldKey}
        >
          {metadataFields[entityType].map((field) => (
            <option key={field.key} value={field.key}>
              {field.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          aria-label="Metadata value"
          className={inputClassName}
          disabled={isSaving}
          maxLength={120}
          onChange={(event) => onChange({ value: event.target.value })}
          value={draft.value}
        />
      </td>
      <td className="px-4 py-3">
        <input
          aria-label="Display order"
          className={inputClassName}
          disabled={isSaving}
          min={0}
          onChange={(event) => onChange({ displayOrder: event.target.value })}
          type="number"
          value={draft.displayOrder}
        />
      </td>
      <td className="px-4 py-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            checked={draft.isActive}
            className="size-4 accent-blue-500"
            disabled={isSaving}
            onChange={(event) => onChange({ isActive: event.target.checked })}
            type="checkbox"
          />
          Active
        </label>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Button
            className="text-white hover:bg-white/10 hover:text-white"
            disabled={isSaving}
            onClick={onCancel}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X />
            <span className="sr-only">Cancel</span>
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-500"
            disabled={isSaving}
            onClick={onSave}
            size="sm"
            type="button"
          >
            {isSaving ? <LoaderCircle className="animate-spin" /> : <Save />}
            Save
          </Button>
        </div>
      </td>
    </tr>
  );
}
