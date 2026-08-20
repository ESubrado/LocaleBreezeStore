"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, LoaderCircle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import type { AdminProduct } from "@/lib/adminProducts";

/** Product and close callback required by the destructive-action dialog. */
type AdminProductDeleteDialogProps = {
  product: AdminProduct;
  onClose: () => void;
};

/** Returns an API error message when available, otherwise uses the status code. */
function getResponseError(response: Response, body: unknown) {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }

  return "Unable to delete the product (" + response.status + ").";
}

export default function AdminProductDeleteDialog({
  product,
  onClose,
}: AdminProductDeleteDialogProps) {
  /** Refreshes product data once the deletion request succeeds. */
  const router = useRouter();
  /** Keeps destructive controls unavailable while the delete request is active. */
  const [isDeleting, setIsDeleting] = useState(false);
  /** Displays deletion failures without closing the confirmation dialog. */
  const [error, setError] = useState("");

  useEffect(() => {
    /** Lets users dismiss the dialog only while no delete request is running. */
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onClose]);

  /** Deletes the selected product, then refreshes the server-rendered table. */
  async function handleDelete() {
    setError("");
    setIsDeleting(true);

    try {
      /** DELETE response used to determine whether the product was removed. */
      const response = await fetch("/api/admin/products/" + product.id, {
        method: "DELETE",
      });
      /** Optional structured API error body. */
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getResponseError(response, body));
      }

      router.refresh();
      onClose();
    } catch (deletionError) {
      setError(
        deletionError instanceof Error
          ? deletionError.message
          : "Unable to delete the product.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return createPortal(
    <motion.div
      aria-labelledby="delete-product-title"
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
        className="w-full max-w-lg overflow-hidden rounded-xl border border-red-500/25 bg-slate-900 shadow-2xl shadow-black/50"
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-300">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-red-300">
                Permanent action
              </p>
              <h3
                id="delete-product-title"
                className="mt-1 text-lg font-semibold text-white"
              >
                Delete product?
              </h3>
            </div>
          </div>
          <Button
            aria-label="Close delete confirmation"
            className="text-white hover:bg-white/10 hover:text-white"
            disabled={isDeleting}
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X />
          </Button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p className="text-sm leading-6 text-slate-300">
            You are about to permanently delete{" "}
            <span className="font-semibold text-white">{product.name}</span>.
            This cannot be undone.
          </p>

          <dl className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">Product ID</dt>
              <dd className="mt-1 font-medium text-slate-200">{product.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">SKU</dt>
              <dd className="mt-1 font-medium text-slate-200">
                {product.sku ?? "None"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-slate-500">Slug</dt>
              <dd className="mt-1 break-all font-medium text-slate-200">
                {product.slug}
              </dd>
            </div>
          </dl>

          <p className="mt-4 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm leading-6 text-amber-100">
            Products with inventory movement history cannot be deleted. Mark
            those products inactive instead to keep their audit trail.
          </p>

          {error ? (
            <p
              aria-live="polite"
              className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              disabled={isDeleting}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-500"
              disabled={isDeleting}
              onClick={handleDelete}
              type="button"
              variant="destructive"
            >
              {isDeleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
              {isDeleting ? "Deleting product" : "Delete product"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
