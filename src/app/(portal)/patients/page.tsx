'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { FilterBar } from '@/components/common/filter-bar';
import { SearchInput } from '@/components/common/search-input';
import { Pagination } from '@/components/common/pagination';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PatientsTable } from '@/components/patients/patients-table';
import { useAllDoctors, useMetaFilters } from '@/hooks/use-doctors';
import { usePatients } from '@/hooks/use-patients';
import { useDebouncedUrlParam } from '@/hooks/use-debounced-url-param';
import { useUrlParams } from '@/hooks/use-url-params';
import { DEFAULT_PAGE_SIZE, FALLBACK_CONDITIONS } from '@/lib/constants';
import type { PatientFilters } from '@/types';

/* The form pulls in React Hook Form + Zod — keep it out of the initial bundle. */
const PatientFormModal = dynamic(
  () => import('@/components/patients/patient-form-modal').then((mod) => mod.PatientFormModal),
  { ssr: false },
);

export default function PatientsPage() {
  const { params, setParam, removeParams, page, setPage } = useUrlParams();
  const { data: meta } = useMetaFilters();
  const doctors = useAllDoctors();
  const { value: search, setValue: setSearch, debounced } = useDebouncedUrlParam('search', 400);
  const [formOpen, setFormOpen] = useState(false);

  const condition = params.condition ?? '';
  const doctor = params.doctor ?? '';
  const from = params.from ?? '';
  const to = params.to ?? '';

  const filters = useMemo<PatientFilters>(
    () => ({
      search: debounced || undefined,
      condition: condition || undefined,
      doctor: doctor || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: DEFAULT_PAGE_SIZE,
    }),
    [debounced, condition, doctor, from, to, page],
  );

  const { data, isLoading, isError, error, isPlaceholderData, refetch } = usePatients(filters);

  const isFiltered = Boolean(debounced || condition || doctor || from || to);

  const resetFilters = () => {
    removeParams(['search', 'condition', 'doctor', 'from', 'to']);
    setSearch('');
  };

  const conditions = meta?.conditions?.length ? meta.conditions : FALLBACK_CONDITIONS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Every patient on file, with their condition and assigned doctor."
        actions={
          <Button
            onClick={() => setFormOpen(true)}
            leftIcon={<Plus className="h-4 w-4" aria-hidden />}
          >
            Add patient
          </Button>
        }
      />

      <FilterBar isFiltered={isFiltered} onReset={resetFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, phone or condition…"
          label="Search patients"
        />

        <div>
          <Label htmlFor="filter-condition" className="sr-only">
            Condition
          </Label>
          <Select
            id="filter-condition"
            value={condition}
            onChange={(event) => setParam('condition', event.target.value || undefined)}
            placeholder="All conditions"
            options={conditions.map((value) => ({ value, label: value }))}
          />
        </div>

        <div>
          <Label htmlFor="filter-doctor" className="sr-only">
            Doctor
          </Label>
          <Select
            id="filter-doctor"
            value={doctor}
            onChange={(event) => setParam('doctor', event.target.value || undefined)}
            placeholder="All doctors"
            options={(doctors ?? []).map((doctor) => ({
              value: doctor.id,
              label: doctor.name,
            }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="filter-from" className="sr-only">
              Registered from
            </Label>
            <Input
              id="filter-from"
              type="date"
              value={from}
              onChange={(event) => setParam('from', event.target.value || undefined)}
              aria-label="Registered from"
            />
          </div>
          <div>
            <Label htmlFor="filter-to" className="sr-only">
              Registered to
            </Label>
            <Input
              id="filter-to"
              type="date"
              value={to}
              onChange={(event) => setParam('to', event.target.value || undefined)}
              aria-label="Registered to"
            />
          </div>
        </div>
      </FilterBar>

      <Card padded={false} className="overflow-hidden">
        {isError ? (
          <ErrorState
            title="We could not load the patient records"
            message={error?.message ?? 'Please check your connection and try again.'}
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <PatientsTable
              patients={data?.items ?? []}
              isLoading={isLoading}
              dimmed={isPlaceholderData}
              emptyAction={
                <Button
                  size="sm"
                  onClick={() => setFormOpen(true)}
                  leftIcon={<Plus className="h-4 w-4" aria-hidden />}
                >
                  Add patient
                </Button>
              }
            />

            <Pagination
              page={data?.page ?? page}
              totalPages={data?.totalPages ?? 1}
              total={data?.total ?? 0}
              limit={data?.limit ?? DEFAULT_PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <p className="flex items-center gap-2 text-[11px] text-subtle">
        <UserRound className="h-3.5 w-3.5" aria-hidden />
        Filters and pagination are stored in the URL — refresh or share the link to restore this view.
      </p>

      <PatientFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
