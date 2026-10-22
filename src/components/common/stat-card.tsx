'use client';

import { type ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  hint?: string;
  delta?: number;
  /** Index controls the accent gradient used on the card. */
  accent?: 'cyan' | 'violet' | 'mixed';
  className?: string;
}

const ACCENTS = {
  cyan: 'from-accent-cyan/18',
  violet: 'from-accent-violet/18',
  mixed: 'from-accent-cyan/18 to-accent-violet/10',
} as const;

export function StatCard({
  label,
  value,
  icon,
  hint,
  delta,
  accent = 'cyan',
  className,
}: StatCardProps) {
  const numeric = typeof value === 'number';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card',
        'transition-[border-color,transform] duration-150 ease-swift hover:border-line-strong',
        className,
      )}
    >
      {/* Static gradient wash — no blur filter, no animation. */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-70',
          ACCENTS[accent],
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">
            {numeric ? formatNumber(value as number) : value}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2/80 text-accent-cyan">
          {icon}
        </span>
      </div>

      <div className="relative mt-3 flex items-center gap-2">
        {delta !== undefined ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
              delta >= 0
                ? 'bg-success/10 text-success'
                : 'bg-danger/10 text-danger',
            )}
          >
            {delta >= 0 ? (
              <TrendingUp className="h-3 w-3" aria-hidden />
            ) : (
              <TrendingDown className="h-3 w-3" aria-hidden />
            )}
            {Math.abs(delta)}%
          </span>
        ) : null}
        {hint ? <span className="truncate text-[11px] text-subtle">{hint}</span> : null}
      </div>
    </div>
  );
}
