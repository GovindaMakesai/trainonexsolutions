import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  pages: number;
  onPage: (page: number) => void;
};

export function Pagination({ page, pages, onPage }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <p className="text-sm text-muted">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-2 text-sm disabled:opacity-40"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-2 text-sm disabled:opacity-40"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
