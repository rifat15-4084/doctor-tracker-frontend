'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function buildPages(page: number, totalPages: number): (number | 'gap')[] {
  const pages: (number | 'gap')[] = [];
  const window = 1;

  for (let index = 1; index <= totalPages; index += 1) {
    const isEdge = index === 1 || index === totalPages;
    const isNear = Math.abs(index - page) <= window;

    if (isEdge || isNear) {
      pages.push(index);
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap');
    }
  }

  return pages;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: PaginationProps) {
  if (total === 0) return null;

  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const from = (safePage - 1) * limit + 1;
  const to = Math.min(safePage * limit, total);
  const pages = buildPages(safePage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row',
        className,
      )}
    >
      <p className="text-xs text-subtle">
        Showing <span className="text-muted">{formatNumber(from)}</span>–
        <span className="text-muted">{formatNumber(to)}</span> of{' '}
        <span className="text-muted">{formatNumber(total)}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          aria-label="Previous page"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          leftIcon={<ChevronLeft className="h-3.5 w-3.5" aria-hidden />}
        >
          <span className="hidden sm:inline">Prev</span>
        </Button>

        <div className="mx-1 hidden items-center gap-1 sm:flex">
          {pages.map((entry, index) =>
            entry === 'gap' ? (
              <span key={`gap-${index}`} className="px-1 text-xs text-subtle">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                aria-current={entry === safePage ? 'page' : undefined}
                className={cn(
                  'h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-colors duration-150',
                  entry === safePage
                    ? 'bg-gradient-to-r from-accent-cyan to-accent-violet text-white'
                    : 'text-muted hover:bg-surface-2 hover:text-fg',
                )}
              >
                {entry}
              </button>
            ),
          )}
        </div>

        <span className="px-2 text-xs text-muted sm:hidden">
          {safePage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          aria-label="Next page"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          rightIcon={<ChevronRight className="h-3.5 w-3.5" aria-hidden />}
        >
          <span className="hidden sm:inline">Next</span>
        </Button>
      </div>
    </nav>
  );
}
