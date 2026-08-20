"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";

import AdminInventoryAdjustmentDialog from "@/components/AdminInventoryAdjustmentDialog";
import AdminProductCreateDialog from "@/components/AdminProductCreateDialog";
import AdminProductDeleteDialog from "@/components/AdminProductDeleteDialog";
import AdminProductEditDialog from "@/components/AdminProductEditDialog";
import AdminTablePagination from "@/components/AdminTablePagination";
import { Button } from "@/components/ui/button";
import type { AdminMetadataOption } from "@/lib/metadata";
import type { AdminProduct } from "@/lib/adminProducts";

const PAGE_SIZE = 5;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleString();
}

function formatProductCount(count: number) {
  return `${count} ${count === 1 ? "product" : "products"}`;
}

function formatInventory(value: number | null) {
  return value === null ? "Not tracked" : value;
}

export default function AdminProductsTable({
  metadataOptions,
  products,
}: {
  metadataOptions: AdminMetadataOption[];
  products: AdminProduct[];
}) {
  const [page, setPage] = useState(1);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [stockProduct, setStockProduct] = useState<AdminProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<AdminProduct | null>(
    null,
  );
  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return products.slice(start, start + PAGE_SIZE);
  }, [currentPage, products]);
  const nextDisplayOrder =
    products.length > 0
      ? Math.max(...products.map((product) => product.displayOrder)) + 1
      : 0;

  return (
    <div className="overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Products</h3>
          <span className="text-xs font-medium text-slate-400">
            {formatProductCount(products.length)}
          </span>
        </div>
        <Button
          className="border-blue-500/30 bg-blue-500/10 text-blue-100 hover:bg-blue-500/20 hover:text-white"
          onClick={() => setIsCreatingProduct(true)}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus />
          New product
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs font-semibold uppercase tracking-normal text-slate-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Inventory</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <tr key={product.id} className="align-top">
                  <td className="max-w-sm px-4 py-4">
                    <span className="block font-semibold text-foreground">
                      {product.name}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">
                      #{product.id} - {product.slug} - Order{" "}
                      {product.displayOrder}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-6 text-slate-400">
                      {product.description}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {product.sku ? (
                      <code className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-slate-200">
                        {product.sku}
                      </code>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {product.imagePaths.length > 0 ? (
                      <>
                        <code
                          className="block max-w-[12rem] truncate rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-slate-200"
                          title={product.imagePaths[0]}
                        >
                          {product.imagePaths[0]}
                        </code>
                        {product.imagePaths.length > 1 && (
                          <span className="mt-1 block text-xs text-slate-500">
                            {product.imagePaths.length} images
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-500">Default</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    <span className="block font-medium text-slate-200">
                      {product.category}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {product.format} - {product.fulfillmentType}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Catalog {product.catalogId ?? "None"}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-foreground">
                    {product.price}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    <span className="block">
                      {formatInventory(product.stockQuantity)}
                    </span>
                    {product.stockQuantity !== null ? (
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Low at {product.lowStockThreshold ?? "default"} · Reorder
                        at {product.reorderPoint ?? "not set"} · Refill{" "}
                        {product.reorderQuantity ?? "not set"}
                      </span>
                    ) : null}
                  </td>
                  <td className="max-w-xs px-4 py-4 text-slate-300">
                    {product.tags.length > 0 ? product.tags.join(", ") : "None"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {product.isFeatured && (
                        <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300">
                          Featured
                        </span>
                      )}
                      {product.isSample && (
                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-400">
                          Sample
                        </span>
                      )}
                      {!product.isFeatured && !product.isSample && (
                        <span className="text-sm text-slate-500">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        product.isActive
                          ? "inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-300"
                          : "inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-400"
                      }
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {formatDate(product.updatedAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {product.fulfillmentType === "shipping" ? (
                        <Button
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:text-white"
                          onClick={() => setStockProduct(product)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Package />
                          Stock
                        </Button>
                      ) : null}
                      <Button
                        className="border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:text-white"
                        onClick={() => setEditingProduct(product)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Pencil />
                        Edit
                      </Button>
                      <Button
                        className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-100"
                        onClick={() => setDeletingProduct(product)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No product rows available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminTablePagination
        onNextPage={() => setPage((value) => Math.min(value + 1, pageCount))}
        onPreviousPage={() => setPage((value) => Math.max(value - 1, 1))}
        page={currentPage}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        totalCount={products.length}
      />

      <AnimatePresence>
        {isCreatingProduct ? (
          <AdminProductCreateDialog
            defaultDisplayOrder={nextDisplayOrder}
            key="create-product"
            metadataOptions={metadataOptions}
            onClose={() => setIsCreatingProduct(false)}
          />
        ) : null}
        {editingProduct ? (
          <AdminProductEditDialog
            key={"edit-" + editingProduct.id}
            metadataOptions={metadataOptions}
            onClose={() => setEditingProduct(null)}
            product={editingProduct}
          />
        ) : null}
        {stockProduct ? (
          <AdminInventoryAdjustmentDialog
            key={"stock-" + stockProduct.id}
            onClose={() => setStockProduct(null)}
            product={stockProduct}
          />
        ) : null}
        {deletingProduct ? (
          <AdminProductDeleteDialog
            key={"delete-" + deletingProduct.id}
            onClose={() => setDeletingProduct(null)}
            product={deletingProduct}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
