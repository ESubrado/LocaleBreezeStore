"use client";

import { useMemo, useState } from "react";

import AdminTablePagination from "@/components/AdminTablePagination";
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
  products,
}: {
  products: AdminProduct[];
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return products.slice(start, start + PAGE_SIZE);
  }, [currentPage, products]);

  return (
    <div className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Products</h3>
        <span className="text-xs font-medium text-slate-400">
          {formatProductCount(products.length)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1160px] text-left text-sm">
          <thead className="bg-white/5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Inventory</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
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
                    {formatInventory(product.stockQuantity)}
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
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
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
    </div>
  );
}
