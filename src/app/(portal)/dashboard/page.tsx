'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Activity, CalendarPlus, Stethoscope, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentPatientsTable } from '@/components/patients/recent-patients-table';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { formatNumber } from '@/lib/utils';
import type { ChartDatum, TimeSeriesDatum } from '@/types';

/* Charts are code-split so the first paint stays small. */
const PatientsPerDoctorChart = dynamic(
  () => import('@/components/charts/patients-per-doctor-chart'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  },
);

const PatientsPerDayChart = dynamic(() => import('@/components/charts/patients-per-day-chart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const PatientsByConditionChart = dynamic(
  () => import('@/components/charts/patients-by-condition-chart'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  },
);

function ChartSkeleton() {
  return (
    <div className="flex h-[280px] w-full items-end gap-2 p-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <Skeleton
          key={index}
          className="flex-1 rounded-t-md"
          // deterministic pseudo-random heights keep the layout stable
          style={{ height: `${30 + ((index * 37) % 60)}%` }}
        />
      ))}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="mt-3 h-3 w-20" />
    </div>
  );
}

export default function DashboardPage() {
  const stats = useDashboardStats();

  const stat = stats.data;

  // The API returns the breakdowns in its own shape - the charts expect
  // `{ name, value }` / `{ date, value }`, so they are mapped here.
  const perDoctor = useMemo<ChartDatum[]>(
    () =>
      (stat?.patientsPerDoctor ?? []).map((row) => ({
        name: row.doctorName,
        value: row.count,
      })),
    [stat?.patientsPerDoctor],
  );

  const perCondition = useMemo<ChartDatum[]>(
    () =>
      (stat?.patientsPerCondition ?? []).map((row) => ({
        name: row.label,
        value: row.count,
      })),
    [stat?.patientsPerCondition],
  );

  const perDay = useMemo<TimeSeriesDatum[]>(
    () =>
      (stat?.patientsAddedPerDay ?? []).map((row) => ({
        date: row.date,
        value: row.count,
      })),
    [stat?.patientsAddedPerDay],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live overview of the practice: how many doctors and patients are on file, and how the caseload is distributed."
        eyebrow={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 text-[11px] font-medium text-accent-cyan">
            <Activity className="h-3 w-3" aria-hidden />
            Live overview
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total doctors"
              value={stat?.totalDoctors ?? 0}
              icon={<Stethoscope className="h-4 w-4" aria-hidden />}
              hint="In the directory"
              accent="cyan"
            />
            <StatCard
              label="Total patients"
              value={stat?.totalPatients ?? 0}
              icon={<Users className="h-4 w-4" aria-hidden />}
              hint="Across all doctors"
              accent="violet"
            />
            <StatCard
              label="New this week"
              value={stat?.newPatientsLast7Days ?? 0}
              icon={<CalendarPlus className="h-4 w-4" aria-hidden />}
              hint="Registered in the last 7 days"
              accent="mixed"
            />
            <StatCard
              label="Top specialization"
              value={stat?.topSpecialization ?? '—'}
              icon={<Activity className="h-4 w-4" aria-hidden />}
              hint={
                stat?.topSpecializationCount
                  ? `${formatNumber(stat.topSpecializationCount)} patients`
                  : 'No data yet'
              }
              accent="cyan"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Patients per doctor"
              description="How the caseload is distributed across the team."
            />
          </div>
          <div className="p-4 pt-2">
            <PatientsPerDoctorChart data={perDoctor} />
          </div>
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Patients by condition"
              description="Share of the caseload per diagnosis."
            />
          </div>
          <div className="p-4 pt-2">
            <PatientsByConditionChart data={perCondition} />
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="New patients over the last 30 days"
            description="Daily registrations across every department."
          />
        </div>
        <div className="p-4 pt-2">
          <PatientsPerDayChart data={perDay} />
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="Recent patients"
            description="The five most recent registrations."
          />
        </div>
        <RecentPatientsTable
          patients={stat?.recentPatients ?? []}
          isLoading={stats.isLoading}
        />
      </Card>
    </div>
  );
}
