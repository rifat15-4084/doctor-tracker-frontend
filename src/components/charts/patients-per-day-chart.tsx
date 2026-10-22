'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/hooks/use-theme';
import { chartThemes } from '@/lib/chart-theme';
import { ChartTooltip } from './chart-tooltip';
import { formatDate } from '@/lib/utils';
import type { TimeSeriesDatum } from '@/types';

export default function PatientsPerDayChart({ data }: { data: TimeSeriesDatum[] }) {
  const { theme } = useTheme();
  const colors = chartThemes[theme];

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-xs text-subtle">
        No registrations in the last 30 days.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
          <defs>
            <linearGradient id="patientsPerDayArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.cyan} stopOpacity={0.45} />
              <stop offset="100%" stopColor={colors.violet} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: colors.textMuted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            tickFormatter={(value: string) => formatDate(value).replace(', ', ' ')}
          />
          <YAxis
            tick={{ fill: colors.textMuted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: colors.cursor }}
            content={<ChartTooltip valueLabel="New patients" />}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="New patients"
            stroke={colors.cyan}
            strokeWidth={2}
            fill="url(#patientsPerDayArea)"
            dot={false}
            activeDot={{ r: 3.5, fill: colors.cyan, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
