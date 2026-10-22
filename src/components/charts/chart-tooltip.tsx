'use client';

import { chartThemes } from '@/lib/chart-theme';
import { useTheme } from '@/hooks/use-theme';

export interface ChartTooltipItem {
  name?: string | number;
  value?: string | number;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: string | number;
  valueLabel?: string;
}

/** Shared tooltip used by every chart so they look identical. */
export function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = 'Patients',
}: ChartTooltipProps) {
  const { theme } = useTheme();
  const colors = chartThemes[theme];

  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs shadow-card"
      style={{ background: colors.tooltipBg, borderColor: colors.tooltipBorder }}
    >
      {label !== undefined && label !== '' ? (
        <p className="mb-1 font-medium" style={{ color: colors.text }}>
          {label}
        </p>
      ) : null}
      <p className="flex items-center gap-2" style={{ color: colors.textMuted }}>
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ background: item?.color ?? colors.cyan }}
        />
        {valueLabel}:{' '}
        <span className="font-semibold" style={{ color: colors.text }}>
          {item?.value ?? 0}
        </span>
      </p>
    </div>
  );
}
