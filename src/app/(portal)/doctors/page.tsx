'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Stethoscope } from 'lucide-react';
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
import { DoctorsTable } from '@/components/doctors/doctors-table';
import { useDoctors, useMetaFilters } from '@/hooks/use-doctors';
import { useDebouncedUrlParam } from '@/hooks/use-debounced-url-param';
import { useUrlParams } from '@/hooks/use-url-params';
import { DEFAULT_PAGE_SIZE, FALLBACK_HOSPITALS, FALLBACK_SPECIALIZATIONS } from '@/lib/constants';
import type { Doctor, DoctorFilters } from '@/types';

/* The form pulls in React Hook Form + Zod — keep it out of the initial bundle. */
const DoctorFormModal = dynamic(
  () => import('@/components/doctors/doctor-form-modal').then((mod) => mod.DoctorFormModal),
  { ssr: false },
);

export default function DoctorsPage() {
  const { params, setParam, removeParams, page, setPage } = useUrlParams();
  const { data: meta } = useMetaFilters();
  const { value: search, setValue: setSearch, debounced } = useDebouncedUrlParam('search', 400);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);

  const specialization = params.specialization ?? '';
  const hospital = params.hospital ?? '';
  const from = params.from ?? '';
  const to = params.to ?? '';

  const filters = useMemo<DoctorFilters>(
    () => ({
      search: debounced || undefined,
      specialization: specialization || undefined,
      hospital: hospital || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: DEFAULT_PAGE_SIZE,
    }),
    [debounced, specialization, hospital, from, to, page],
  );

  const { data, isLoading, isError, error, isPlaceholderData, refetch } = useDoctors(filters);

  const isFiltered = Boolean(
    debounced || specialization || hospital || from || to,
  );

  const resetFilters = () => {
    removeParams(['search', 'specialization', 'hospital', 'from', 'to']);
    setSearch('');
  };

  const specializations = meta?.specializations?.length
    ? meta.specializations
    : FALLBACK_SPECIALIZATIONS;
  const hospitals = meta?.hospitals?.length ? meta.hospitals : FALLBACK_HOSPITALS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description="Every doctor on the roster, with their specialization, hospital and caseload size."
        actions={
          <Button onClick={() => setFormOpen(true)} leftIcon={<Plus className="h-4 w-4" aria-hidden />}>
            Add doctor
          </Button>
        }
      />

      <FilterBar isFiltered={isFiltered} onReset={resetFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, specialization, hospital or email…"
          label="Search doctors"
        />

        <div>
          <Label htmlFor="filter-specialization" className="sr-only">
            Specialization
          </Label>
          <Select
            id="filter-specialization"
            value={specialization}
            onChange={(event) => setParam('specialization', event.target.value || undefined)}
            placeholder="All specializations"
            options={specializations.map((value) => ({ value, label: value }))}
          />
        </div>

        <div>
          <Label htmlFor="filter-hospital" className="sr-only">
            Hospital
          </Label>
          <Select
            id="filter-hospital"
            value={hospital}
            onChange={(event) => setParam('hospital', event.target.value || undefined)}
            placeholder="All hospitals"
            options={hospitals.map((value) => ({ value, label: value }))}
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
            title="We could not load the doctor directory"
            message={error?.message ?? 'Please check your connection and try again.'}
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <DoctorsTable
              doctors={data?.items ?? []}
              isLoading={isLoading}
              dimmed={isPlaceholderData}
              onEdit={setEditing}
              emptyAction={
                <Button
                  size="sm"
                  onClick={() => setFormOpen(true)}
                  leftIcon={<Plus className="h-4 w-4" aria-hidden />}
                >
                  Add doctor
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
        <Stethoscope className="h-3.5 w-3.5" aria-hidden />
        Filters and pagination are stored in the URL — refresh or share the link to restore this view.
      </p>

      <DoctorFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <DoctorFormModal
        open={Boolean(editing)}
        doctor={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
