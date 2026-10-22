'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@/hooks/use-theme';
import { chartThemes } from '@/lib/chart-theme';
import { ChartTooltip } from './chart-tooltip';
import { formatNumber } from '@/lib/utils';
import type { ChartDatum } from '@/types';

export default function PatientsByConditionChart({ data }: { data: ChartDatum[] }) {
  const { theme } = useTheme();
  const colors = chartThemes[theme];
  const total = data.reduce((sum, entry) => sum + (entry.value || 0), 0);

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-xs text-subtle">
        No condition data yet.
      </div>
    );
  }

  return (
    <div className="flex h-[280px] w-full flex-col items-center gap-3 sm:flex-row">
      <div className="h-[200px] w-full sm:h-[280px] sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip valueLabel="Patients" />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={colors.palette[index % colors.palette.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full space-y-1.5 sm:w-1/2">
        {data.slice(0, 6).map((entry, index) => {
          const percent = total ? Math.round((entry.value / total) * 100) : 0;
          return (
            <li key={entry.name} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: colors.palette[index % colors.palette.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-muted">{entry.name}</span>
              <span className="tabular-nums text-subtle">{formatNumber(entry.value)}</span>
              <span className="w-9 shrink-0 text-right tabular-nums text-fg">{percent}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
