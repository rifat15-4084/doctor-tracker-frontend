import { type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

/** Single pulse-only placeholder used across every loading state. */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden
      style={style}
      className={cn('animate-pulse rounded-lg bg-surface-3/80', className)}
    />
  );
}

/** Placeholder that mirrors the shape of a table. */
export function SkeletonTable({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-4">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn('h-4', columnIndex === 0 ? 'w-48' : 'flex-1')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
