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
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Products</h3>
        <span className="text-xs font-medium text-muted-foreground">
          {formatProductCount(products.length)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1160px] text-left text-sm">
          <thead className="bg-muted text-xs font-semibold uppercase tracking-normal text-muted-foreground">
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
          <tbody className="divide-y divide-border">
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <tr key={product.id} className="align-top">
                  <td className="max-w-sm px-4 py-4">
                    <span className="block font-semibold text-foreground">
                      {product.name}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-muted-foreground">
                      #{product.id} - {product.slug} - Order{" "}
                      {product.displayOrder}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted-foreground">
                      {product.description}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {product.sku ? (
                      <code className="rounded-sm bg-muted px-2 py-1 text-xs font-medium text-foreground">
                        {product.sku}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    <span className="block font-medium text-foreground">
                      {product.category}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {product.format} - {product.fulfillmentType}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Catalog {product.catalogId ?? "None"}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-foreground">
                    {product.price}
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {formatInventory(product.stockQuantity)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {product.isFeatured && (
                        <span className="inline-flex rounded-sm bg-chart-5/10 px-2 py-1 text-xs font-semibold text-chart-5">
                          Featured
                        </span>
                      )}
                      {product.isSample && (
                        <span className="inline-flex rounded-sm bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                          Sample
                        </span>
                      )}
                      {!product.isFeatured && !product.isSample && (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        product.isActive
                          ? "inline-flex rounded-sm bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
                          : "inline-flex rounded-sm bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {formatDate(product.updatedAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
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
