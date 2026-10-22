'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Pencil, Stethoscope, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteDoctor } from '@/hooks/use-doctors';
import { formatDate, formatNumber } from '@/lib/utils';
import type { Doctor } from '@/types';

export interface DoctorsTableProps {
  doctors: Doctor[];
  isLoading?: boolean;
  dimmed?: boolean;
  emptyAction?: React.ReactNode;
  /** Called when the user asks to edit a doctor. */
  onEdit?: (doctor: Doctor) => void;
}

export function DoctorsTable({
  doctors,
  isLoading,
  dimmed,
  emptyAction,
  onEdit,
}: DoctorsTableProps) {
  const [deleting, setDeleting] = useState<Doctor | null>(null);
  const deleteDoctor = useDeleteDoctor();

  const columns = useMemo<DataTableColumn<Doctor>[]>(
    () => [
      {
        id: 'doctor',
        header: 'Doctor',
        primary: true,
        render: (doctor) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={doctor.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{doctor.name}</p>
              <p className="truncate text-[11px] text-subtle">{doctor.email}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'specialization',
        header: 'Specialization',
        render: (doctor) => (
          <span className="text-sm text-muted">{doctor.specialization || '—'}</span>
        ),
      },
      {
        id: 'hospital',
        header: 'Hospital',
        render: (doctor) => (
          <span className="text-sm text-muted">{doctor.hospital || '—'}</span>
        ),
      },
      {
        id: 'patients',
        header: 'Patients',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (doctor) => (
          <span className="text-sm tabular-nums text-muted">
            {formatNumber(doctor.patientsCount ?? 0)}
          </span>
        ),
      },
      {
        id: 'registered',
        header: 'Registered',
        render: (doctor) => (
          <span className="whitespace-nowrap text-xs text-subtle">
            {formatDate(doctor.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (doctor) => (
          <div className="flex items-center justify-end gap-1.5">
            {onEdit ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${doctor.name}`}
                onClick={() => onEdit(doctor)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${doctor.name}`}
              className="hover:text-danger"
              onClick={() => setDeleting(doctor)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Link
              href={`/doctors/${doctor.id}`}
              aria-label={`Open ${doctor.name}`}
              className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition-colors duration-150 hover:border-line-strong hover:text-fg"
            >
              Open
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        ),
      },
    ],
    [onEdit],
  );

  /**
   * The API refuses to orphan patients, so a doctor that still has a caseload
   * is removed together with their patients (the cascade flag).
   */
  const patientCount = deleting?.patientsCount ?? 0;
  const hasPatients = patientCount > 0;

  return (
    <>
      <DataTable
        columns={columns}
        rows={doctors}
        getRowId={(doctor) => doctor.id}
        isLoading={isLoading}
        dimmed={dimmed}
        caption="Doctor directory"
        empty={
          <EmptyState
            icon={<Stethoscope className="h-5 w-5" aria-hidden />}
            title="No doctors found"
            description="Try adjusting your filters, or add a new doctor to the directory."
            action={emptyAction}
          />
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete doctor"
        description={
          hasPatients ? (
            <>
              <span className="font-medium text-fg">{deleting?.name}</span> still has{' '}
              <span className="font-medium text-fg">{formatNumber(patientCount)}</span> patient
              {patientCount === 1 ? '' : 's'}. Removing the doctor also removes those patient
              records. This action cannot be undone.
            </>
          ) : (
            <>
              This permanently removes{' '}
              <span className="font-medium text-fg">{deleting?.name}</span> from the directory.
              This action cannot be undone.
            </>
          )
        }
        confirmLabel={hasPatients ? 'Delete doctor & patients' : 'Delete doctor'}
        loading={deleteDoctor.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          deleteDoctor.mutate(
            { id: deleting.id, cascade: hasPatients },
            { onSettled: () => setDeleting(null) },
          );
        }}
      />
    </>
  );
}
