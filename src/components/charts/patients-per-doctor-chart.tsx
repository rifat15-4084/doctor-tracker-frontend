'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/hooks/use-theme';
import { chartThemes } from '@/lib/chart-theme';
import { ChartTooltip } from './chart-tooltip';
import type { ChartDatum } from '@/types';

export default function PatientsPerDoctorChart({ data }: { data: ChartDatum[] }) {
  const { theme } = useTheme();
  const colors = chartThemes[theme];

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-xs text-subtle">
        No patient distribution yet.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
          <defs>
            <linearGradient id="patientsPerDoctorBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.cyan} />
              <stop offset="100%" stopColor={colors.violet} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: colors.textMuted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-12}
            textAnchor="end"
            height={52}
          />
          <YAxis
            tick={{ fill: colors.textMuted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
          />
          <Tooltip
            cursor={{ fill: colors.cursor }}
            content={<ChartTooltip valueLabel="Patients" />}
          />
          <Bar
            dataKey="value"
            name="Patients"
            fill="url(#patientsPerDoctorBar)"
            radius={[6, 6, 0, 0]}
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
