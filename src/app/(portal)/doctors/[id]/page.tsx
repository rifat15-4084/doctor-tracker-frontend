'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Plus, UserRound } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/page-header';
import { SearchInput } from '@/components/common/search-input';
import { Pagination } from '@/components/common/pagination';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { DoctorInfoCard } from '@/components/doctors/doctor-info-card';
import { DoctorPatientsTable } from '@/components/doctors/doctor-patients-table';
import { useDebouncedUrlParam } from '@/hooks/use-debounced-url-param';
import { useDoctor, useDoctorPatients } from '@/hooks/use-doctors';
import { useUrlParams } from '@/hooks/use-url-params';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { DoctorPatientFilters } from '@/types';

/* The form pulls in React Hook Form + Zod — keep it out of the initial bundle. */
const PatientFormModal = dynamic(
  () => import('@/components/patients/patient-form-modal').then((mod) => mod.PatientFormModal),
  { ssr: false },
);

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { page, setPage } = useUrlParams();
  const { value: search, setValue: setSearch, debounced } = useDebouncedUrlParam('search', 400);
  const [formOpen, setFormOpen] = useState(false);

  const doctor = useDoctor(id);

  const filters = useMemo<DoctorPatientFilters>(
    () => ({ search: debounced || undefined, page, limit: DEFAULT_PAGE_SIZE }),
    [debounced, page],
  );

  const patients = useDoctorPatients(id, filters);

  return (
    <div className="space-y-6">
      <Link
        href="/doctors"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to doctors
      </Link>

      {doctor.isError ? (
        <Card>
          <ErrorState
            title="We could not load this doctor"
            message={doctor.error?.message ?? 'The record may have been removed.'}
            onRetry={() => void doctor.refetch()}
          />
        </Card>
      ) : (
        <DoctorInfoCard
          doctor={doctor.data}
          patientCount={patients.data?.total}
          isLoading={doctor.isLoading}
        />
      )}

      <PageHeader
        title="Patients"
        description="Everyone currently assigned to this doctor."
        actions={
          <Button
            onClick={() => setFormOpen(true)}
            leftIcon={<Plus className="h-4 w-4" aria-hidden />}
          >
            Add patient
          </Button>
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-line p-3 sm:p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search this doctor's patients…"
            label="Search patients"
            className="max-w-md"
          />
        </div>

        {patients.isError ? (
          <ErrorState
            title="We could not load the patient list"
            message={patients.error?.message ?? 'Please try again.'}
            onRetry={() => void patients.refetch()}
          />
        ) : (
          <>
            <DoctorPatientsTable
              doctorId={id}
              patients={patients.data?.items ?? []}
              isLoading={patients.isLoading}
              dimmed={patients.isPlaceholderData}
            />

            <Pagination
              page={patients.data?.page ?? page}
              totalPages={patients.data?.totalPages ?? 1}
              total={patients.data?.total ?? 0}
              limit={patients.data?.limit ?? DEFAULT_PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <p className="flex items-center gap-2 text-[11px] text-subtle">
        <UserRound className="h-3.5 w-3.5" aria-hidden />
        Deleting a patient is optimistic — the row disappears instantly and is restored if the request fails.
      </p>

      <PatientFormModal
        open={formOpen}
        defaultDoctorId={id}
        doctorEndpointId={id}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
