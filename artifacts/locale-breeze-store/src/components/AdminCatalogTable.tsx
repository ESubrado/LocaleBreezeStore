"use client";

import { useMemo, useState } from "react";

import AdminTablePagination from "@/components/AdminTablePagination";
import type { AdminCatalog } from "@/lib/adminCatalogs";

const PAGE_SIZE = 5;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleString();
}

function formatCatalogCount(count: number) {
  return `${count} ${count === 1 ? "entry" : "entries"}`;
}

export default function AdminCatalogTable({
  catalogs,
}: {
  catalogs: AdminCatalog[];
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(catalogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleCatalogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return catalogs.slice(start, start + PAGE_SIZE);
  }, [catalogs, currentPage]);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Catalog</h3>
        <span className="text-xs font-medium text-muted-foreground">
          {formatCatalogCount(catalogs.length)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-muted text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Catalog</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Samples</th>
              <th className="px-4 py-3">Examples</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleCatalogs.length > 0 ? (
              visibleCatalogs.map((catalog) => (
                <tr key={catalog.id} className="align-top">
                  <td className="max-w-sm px-4 py-4">
                    <span className="block font-semibold text-foreground">
                      {catalog.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted-foreground">
                      {catalog.description}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <code className="rounded-sm bg-muted px-2 py-1 text-xs font-medium text-foreground">
                      {catalog.slug}
                    </code>
                  </td>
                  <td className="px-4 py-4">
                    {catalog.imagePath ? (
                      <code
                        className="block max-w-[12rem] truncate rounded-sm bg-muted px-2 py-1 text-xs font-medium text-foreground"
                        title={catalog.imagePath}
                      >
                        {catalog.imagePath}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">Default</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {catalog.displayOrder}
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {catalog.sampleItemCount}
                  </td>
                  <td className="max-w-xs px-4 py-4 text-foreground">
                    {catalog.examples.length > 0
                      ? catalog.examples.join(", ")
                      : "None"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        catalog.isActive
                          ? "inline-flex rounded-sm bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
                          : "inline-flex rounded-sm bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {catalog.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {formatDate(catalog.updatedAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No catalog rows available.
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
        totalCount={catalogs.length}
      />
    </div>
  );
}
