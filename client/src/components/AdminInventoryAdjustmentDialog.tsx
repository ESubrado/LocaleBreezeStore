"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import type { AdminProduct } from "@/lib/adminProducts";

type InventoryAction = "add" | "deduct" | "set";

type AdminInventoryAdjustmentDialogProps = {
  product: AdminProduct;
  onClose: () => void;
};

const inputClassName =
  "mt-1.5 h-10 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";
const textAreaClassName =
  "mt-1.5 min-h-24 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";

function getActionCopy(action: InventoryAction) {
  if (action === "add") {
    return {
      description: "Record an incoming restock and increase the current quantity.",
      label: "Quantity to add",
      title: "Add stock",
    };
  }

  if (action === "deduct") {
    return {
      description: "Record a loss, count correction, or other stock reduction.",
      label: "Quantity to deduct",
      title: "Deduct stock",
    };
  }

  return {
    description: "Set the exact count. The difference is recorded as an adjustment.",
    label: "New stock quantity",
    title: "Set stock quantity",
  };
}

function getProjectedQuantity(
  currentQuantity: number,
  action: InventoryAction,
  enteredQuantity: string,
) {
  const quantity = Number(enteredQuantity);

  if (!Number.isInteger(quantity) || quantity < 0) {
    return null;
  }

  if (action === "add") {
    return currentQuantity + quantity;
  }

  if (action === "deduct") {
    return currentQuantity - quantity;
  }

  return quantity;
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

  return "Unable to adjust stock (" + response.status + ").";
}

export default function AdminInventoryAdjustmentDialog({
  product,
  onClose,
}: AdminInventoryAdjustmentDialogProps) {
  const router = useRouter();
  const [action, setAction] = useState<InventoryAction>("add");
  const [quantity, setQuantity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const currentQuantity = product.stockQuantity ?? 0;
  const actionCopy = getActionCopy(action);
  const projectedQuantity = useMemo(
    () => getProjectedQuantity(currentQuantity, action, quantity),
    [action, currentQuantity, quantity],
  );

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

    const parsedQuantity = Number(quantity);
    const note = new FormData(event.currentTarget).get("note");

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setError("Quantity must be a non-negative whole number.");
      return;
    }

    if (action !== "set" && parsedQuantity === 0) {
      setError("Add and deduct quantities must be greater than zero.");
      return;
    }

    if (action === "deduct" && parsedQuantity > currentQuantity) {
      setError("You cannot deduct more stock than is currently available.");
      return;
    }

    if (action === "set" && parsedQuantity === currentQuantity) {
      setError("The stock quantity is already set to that amount.");
      return;
    }

    if (typeof note !== "string" || note.trim().length === 0) {
      setError("Add a note explaining this stock change.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(
        "/api/admin/products/" + product.id + "/inventory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            note: note.trim(),
            quantity: parsedQuantity,
          }),
        },
      );
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getResponseError(response, body));
      }

      router.refresh();
      onClose();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to adjust stock.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return createPortal(
    <motion.div
      aria-labelledby="stock-adjustment-title"
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
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50"
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-blue-400">
              Inventory
            </p>
            <h3
              id="stock-adjustment-title"
              className="mt-1 text-lg font-semibold text-white"
            >
              Adjust stock
            </h3>
            <p className="mt-1 text-sm text-slate-400">{product.name}</p>
          </div>
          <Button
            aria-label="Close stock adjustment"
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

        <form className="px-5 py-5 sm:px-6" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <span className="text-xs font-medium text-slate-500">
                Current quantity
              </span>
              <p className="mt-1 text-2xl font-semibold text-white">
                {product.stockQuantity === null
                  ? "Not tracked (starts at 0)"
                  : currentQuantity}
              </p>
            </div>
            <div
              className={
                projectedQuantity !== null && projectedQuantity < 0
                  ? "rounded-lg border border-red-500/30 bg-red-500/10 p-3"
                  : "rounded-lg border border-blue-500/30 bg-blue-500/10 p-3"
              }
            >
              <span className="text-xs font-medium text-slate-400">
                Projected quantity
              </span>
              <p
                className={
                  projectedQuantity !== null && projectedQuantity < 0
                    ? "mt-1 text-2xl font-semibold text-red-200"
                    : "mt-1 text-2xl font-semibold text-white"
                }
              >
                {projectedQuantity ?? "—"}
              </p>
            </div>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-white">
              Adjustment type
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(["add", "deduct", "set"] as InventoryAction[]).map(
                (option) => {
                  const optionCopy = getActionCopy(option);
                  const isSelected = action === option;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={
                        isSelected
                          ? "rounded-lg border border-blue-400 bg-blue-500/15 px-3 py-3 text-left ring-1 ring-blue-400/30"
                          : "rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
                      }
                      key={option}
                      onClick={() => {
                        setAction(option);
                        setError("");
                      }}
                      type="button"
                    >
                      <span className="block text-sm font-semibold text-white">
                        {optionCopy.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-400">
                        {optionCopy.description}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </fieldset>

          <label className="mt-5 block text-sm font-medium text-slate-200">
            {actionCopy.label}
            <input
              className={inputClassName}
              inputMode="numeric"
              min={0}
              onChange={(event) => {
                setQuantity(event.target.value);
                setError("");
              }}
              placeholder="0"
              required
              step="1"
              type="number"
              value={quantity}
            />
          </label>

          <label className="mt-5 block text-sm font-medium text-slate-200">
            Adjustment note
            <textarea
              className={textAreaClassName}
              name="note"
              placeholder="Explain why this stock change is needed."
              required
            />
            <span className="mt-1.5 block text-xs leading-5 text-slate-500">
              Every completed adjustment creates an inventory history record.
            </span>
          </label>

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
              {isSaving ? "Updating stock" : actionCopy.title}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
