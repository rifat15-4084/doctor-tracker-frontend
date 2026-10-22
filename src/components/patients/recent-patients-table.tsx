'use client';

import { useMemo } from 'react';
import { UserRound } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/common/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import type { Patient } from '@/types';

/** Compact "latest arrivals" table used on the dashboard. */
export function RecentPatientsTable({
  patients,
  isLoading,
}: {
  patients: Patient[];
  isLoading?: boolean;
}) {
  const columns = useMemo<DataTableColumn<Patient>[]>(
    () => [
      {
        id: 'patient',
        header: 'Patient',
        primary: true,
        render: (patient) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={patient.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{patient.name}</p>
              <p className="truncate text-[11px] text-subtle">{patient.condition}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'doctor',
        header: 'Doctor',
        render: (patient) => (
          <span className="text-sm text-muted">{patient.doctorName || 'Unassigned'}</span>
        ),
      },
      {
        id: 'when',
        header: 'Added',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (patient) => (
          <span className="whitespace-nowrap text-xs text-subtle">
            {formatRelativeTime(patient.createdAt)}
          </span>
        ),
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="divide-y divide-line">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={patients}
      getRowId={(patient) => patient.id}
      caption="Recently registered patients"
      empty={
        <EmptyState
          icon={<UserRound className="h-5 w-5" aria-hidden />}
          title="No registrations yet"
          description="Newly registered patients will appear here."
        />
      }
    />
  );
}
