'use client';

import { type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterBarProps {
  children: ReactNode;
  onReset?: () => void;
  isFiltered?: boolean;
  className?: string;
  /** Rendered on the right-hand side of the bar (e.g. a "filters" summary). */
  aside?: ReactNode;
}

/**
 * Horizontal toolbar that hosts the search box and the filter controls.
 * Collapses into a single column on mobile.
 */
export function FilterBar({ children, onReset, isFiltered, className, aside }: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 sm:p-4 lg:flex-row lg:items-center',
        className,
      )}
    >
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1.4fr)_repeat(auto-fit,minmax(150px,1fr))]">
        {children}
      </div>

      {aside || (isFiltered && onReset) ? (
        <div className="flex shrink-0 items-center gap-2 lg:pl-1">
          {aside}
          {isFiltered && onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line px-3 text-xs font-medium text-muted transition-colors duration-150 hover:border-line-strong hover:text-fg"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Reset
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
