import type { Theme } from '@/hooks/use-theme';

export interface ChartTheme {
  text: string;
  textMuted: string;
  grid: string;
  cursor: string;
  tooltipBg: string;
  tooltipBorder: string;
  cyan: string;
  violet: string;
  palette: string[];
}

/**
 * Charts need real colour values (SVG presentation attributes cannot use
 * `var()`), so the palette is defined per theme and the charts re-render when
 * the theme changes.
 */
export const chartThemes: Record<Theme, ChartTheme> = {
  dark: {
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    grid: 'rgba(148, 163, 184, 0.14)',
    cursor: 'rgba(148, 163, 184, 0.10)',
    tooltipBg: '#0f1626',
    tooltipBorder: 'rgba(148, 163, 184, 0.18)',
    cyan: '#22d3ee',
    violet: '#a78bfa',
    palette: ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#f87171'],
  },
  light: {
    text: '#1e293b',
    textMuted: '#64748b',
    grid: 'rgba(100, 116, 139, 0.16)',
    cursor: 'rgba(100, 116, 139, 0.10)',
    tooltipBg: '#ffffff',
    tooltipBorder: 'rgba(15, 23, 42, 0.10)',
    cyan: '#0891b2',
    violet: '#7c3aed',
    palette: ['#0891b2', '#7c3aed', '#059669', '#d97706', '#db2777', '#2563eb', '#dc2626'],
  },
};
