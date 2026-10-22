'use client';

import { useMemo, useState } from 'react';
import { Pencil, Trash2, UserRound } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/common/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { PatientFormModal } from './patient-form-modal';
import { useDeletePatient } from '@/hooks/use-patients';
import { formatDate, titleCase } from '@/lib/utils';
import type { Patient } from '@/types';

export interface PatientsTableProps {
  patients: Patient[];
  isLoading?: boolean;
  dimmed?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function PatientsTable({
  patients,
  isLoading,
  dimmed,
  emptyTitle = 'No patients found',
  emptyDescription = 'Try adjusting your filters or register a new patient.',
  emptyAction,
}: PatientsTableProps) {
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const deletePatient = useDeletePatient();

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
              <p className="truncate text-[11px] text-subtle">{patient.phone || '—'}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'condition',
        header: 'Condition',
        render: (patient) => (
          <span className="text-sm text-muted">{patient.condition || '—'}</span>
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
        id: 'demographics',
        header: 'Age',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (patient) => (
          <span className="text-sm tabular-nums text-muted">
            {patient.age ?? '—'}
            {patient.gender ? (
              <span className="ml-1 text-[11px] text-subtle">
                {titleCase(patient.gender)}
              </span>
            ) : null}
          </span>
        ),
      },
      {
        id: 'registered',
        header: 'Registered',
        render: (patient) => (
          <span className="whitespace-nowrap text-xs text-subtle">
            {formatDate(patient.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (patient) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Edit ${patient.name}`}
              onClick={() => setEditing(patient)}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${patient.name}`}
              className="hover:text-danger"
              onClick={() => setDeleting(patient)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        rows={patients}
        getRowId={(patient) => patient.id}
        isLoading={isLoading}
        dimmed={dimmed}
        caption="Patient records"
        empty={
          <EmptyState
            icon={<UserRound className="h-5 w-5" aria-hidden />}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        }
      />

      <PatientFormModal open={Boolean(editing)} patient={editing} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete patient"
        description={
          <>
            This permanently removes{' '}
            <span className="font-medium text-fg">{deleting?.name}</span> and their record.
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete patient"
        loading={deletePatient.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          deletePatient.mutate(deleting.id, { onSettled: () => setDeleting(null) });
        }}
      />
    </>
  );
}
