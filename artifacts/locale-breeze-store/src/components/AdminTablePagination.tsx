"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminTablePagination({
  page,
  pageCount,
  pageSize,
  totalCount,
  onNextPage,
  onPreviousPage,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {start}-{end} of {totalCount}
      </p>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Go to previous page"
            disabled={page <= 1}
            onClick={onPreviousPage}
            size="sm"
            type="button"
            variant="outline"
          >
            <ChevronLeft />
            Previous
          </Button>
          <Button
            aria-label="Go to next page"
            disabled={page >= pageCount}
            onClick={onNextPage}
            size="sm"
            type="button"
            variant="outline"
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
