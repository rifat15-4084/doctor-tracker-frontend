import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  DashboardStats,
  DayCount,
  DoctorPatientCount,
  LabelCount,
  MonthCount,
  Paginated,
  Patient,
} from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*                                   Formatting                                */
/* -------------------------------------------------------------------------- */

export function initials(name?: string | null): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return numberFormatter.format(value);
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(value);
}

export function titleCase(value?: string | null): string {
  if (!value) return '—';
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function truncate(value: string, max = 40): string {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/* -------------------------------------------------------------------------- */
/*                                   Utilities                                 */
/* -------------------------------------------------------------------------- */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Removes empty values so they never reach the query string. */
export function cleanParams<T extends object>(params: T): Record<string, string> {
  const out: Record<string, string> = {};
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const str = String(value).trim();
    if (!str) return;
    out[key] = str;
  });
  return out;
}

/* -------------------------------------------------------------------------- */
/*                              API normalisation                              */
/* -------------------------------------------------------------------------- */

/**
 * The API answers list endpoints with the envelope
 *
 *   { success: true, data: [...], pagination: { page, limit, total, totalPages } }
 *
 * A couple of legacy shapes are still tolerated so the UI keeps working if a
 * deployment runs an older API build.
 */
export function normalizeList<T>(
  body: unknown,
  fallback: { page?: number; limit?: number } = {},
): Paginated<T> {
  const root = body as Record<string, any> | null | undefined;
  const inner =
    root && typeof root === 'object' && !Array.isArray(root) && root.data && typeof root.data === 'object'
      ? root.data
      : root;

  const items: T[] = Array.isArray(inner)
    ? (inner as T[])
    : (inner?.items ??
      inner?.doctors ??
      inner?.patients ??
      inner?.results ??
      inner?.rows ??
      inner?.data ??
      []) as T[];

  // `pagination` is the canonical block of the current API - it always wins
  // over the legacy `meta` block.
  const meta = root?.pagination ?? root?.meta ?? inner?.pagination ?? inner?.meta ?? {};

  const limit = Number(inner?.limit ?? meta?.limit ?? meta?.perPage ?? root?.limit ?? fallback.limit ?? 10) || 10;
  const total = Number(inner?.total ?? meta?.total ?? root?.total ?? items.length) || 0;
  const totalPages =
    Number(inner?.totalPages ?? meta?.totalPages ?? meta?.pages ?? root?.totalPages) ||
    Math.max(1, Math.ceil(total / limit));
  const page = Number(inner?.page ?? meta?.page ?? meta?.currentPage ?? root?.page ?? fallback.page ?? 1) || 1;

  return { items, page, limit, total, totalPages };
}

/** Read the payload of an envelope response (`{ success, data }`). */
const unwrapRoot = (body: unknown): Record<string, any> => {
  const root = (body as Record<string, any>)?.data ?? body;
  return root && typeof root === 'object' && !Array.isArray(root) ? (root as Record<string, any>) : {};
};

/** Coerce anything into a finite number (0 when missing/invalid). */
const toCount = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Map a `label -> count` breakdown into the shape the charts expect. */
const toLabelCounts = (rows: unknown): { label: string; count: number }[] => {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const entry = (row ?? {}) as Record<string, any>;
    const label = entry.condition ?? entry.specialization ?? entry.label ?? entry.name ?? '';
    return { label: String(label), count: toCount(entry.count ?? entry.value) };
  });
};

/**
 * Map the dashboard payload of `GET /api/dashboard/stats` onto the types the
 * UI works with. The API already returns the exact counters - this function
 * only guarantees the shape and fills in sane defaults.
 */
export function normalizeStats(body: unknown): DashboardStats {
  const root = unwrapRoot(body);

  const patientsPerDoctor: DoctorPatientCount[] = Array.isArray(root.patientsPerDoctor)
    ? root.patientsPerDoctor.map((row: Record<string, any>) => ({
        doctorId: String(row?.doctorId ?? ''),
        doctorName: String(row?.doctorName ?? 'Unknown doctor'),
        specialization: row?.specialization ?? null,
        hospital: row?.hospital ?? null,
        count: toCount(row?.count),
      }))
    : [];

  const patientsAddedPerDay: DayCount[] = Array.isArray(root.patientsAddedPerDay)
    ? root.patientsAddedPerDay.map((row: Record<string, any>) => ({
        date: String(row?.date ?? ''),
        count: toCount(row?.count),
      }))
    : [];

  const doctorsAddedPerMonth: MonthCount[] = Array.isArray(root.doctorsAddedPerMonth)
    ? root.doctorsAddedPerMonth.map((row: Record<string, any>) => ({
        month: String(row?.month ?? ''),
        count: toCount(row?.count),
      }))
    : [];

  const recentPatients: Patient[] = Array.isArray(root.recentPatients)
    ? root.recentPatients.map((row: Record<string, any>) => ({
        id: String(row?.id ?? ''),
        name: String(row?.name ?? ''),
        condition: String(row?.condition ?? ''),
        phone: null,
        age: null,
        gender: null,
        doctorId: row?.doctorId ?? null,
        doctorName: row?.doctorName ?? null,
        createdAt: String(row?.createdAt ?? ''),
        updatedAt: null,
      }))
    : [];

  return {
    totalDoctors: toCount(root.totalDoctors),
    totalPatients: toCount(root.totalPatients),
    newDoctorsLast30Days: toCount(root.newDoctorsLast30Days),
    newPatientsLast30Days: toCount(root.newPatientsLast30Days),
    newPatientsLast7Days: toCount(root.newPatientsLast7Days),
    averagePatientsPerDoctor: toCount(root.averagePatientsPerDoctor),
    topSpecialization: root.topSpecialization ? String(root.topSpecialization) : null,
    topSpecializationCount: toCount(root.topSpecializationCount),
    patientsPerDoctor,
    patientsPerCondition: toLabelCounts(root.patientsPerCondition),
    patientsPerSpecialization: toLabelCounts(root.patientsPerSpecialization),
    doctorsPerSpecialization: toLabelCounts(root.doctorsPerSpecialization),
    patientsAddedPerDay,
    doctorsAddedPerMonth,
    recentPatients,
  };
}

