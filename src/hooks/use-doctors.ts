'use client';

import { useMemo } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { doctorService } from '@/services/doctor.service';
import { FALLBACK_CONDITIONS, FALLBACK_HOSPITALS, FALLBACK_SPECIALIZATIONS } from '@/lib/constants';
import type {
  Doctor,
  DoctorFilters,
  DoctorInput,
  DoctorOption,
  DoctorPatientFilters,
  MetaFilters,
  Patient,
  PatientInput,
} from '@/types';

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => ['doctors', 'list'] as const,
  list: (filters: DoctorFilters) => ['doctors', 'list', filters] as const,
  details: () => ['doctors', 'detail'] as const,
  detail: (id: string) => ['doctors', 'detail', id] as const,
  patients: (id: string) => ['doctors', id, 'patients'] as const,
  patientList: (id: string, filters: DoctorPatientFilters) =>
    ['doctors', id, 'patients', filters] as const,
};

/** Paginated list of doctors with smooth pagination (`keepPreviousData`). */
export function useDoctors(filters: DoctorFilters = {}) {
  return useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => doctorService.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useDoctor(id: string | undefined) {
  return useQuery({
    queryKey: doctorKeys.detail(id ?? 'unknown'),
    queryFn: () => doctorService.getById(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useDoctorPatients(id: string | undefined, filters: DoctorPatientFilters = {}) {
  return useQuery({
    queryKey: doctorKeys.patientList(id ?? 'unknown', filters),
    queryFn: () => doctorService.listPatients(id as string, filters),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DoctorInput) => doctorService.create(input),
    onSuccess: (doctor) => {
      toast.success(`${doctor.name} was added to the directory`);
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['meta'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not create the doctor');
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DoctorInput> }) =>
      doctorService.update(id, input),
    onSuccess: (doctor) => {
      toast.success(`${doctor.name} was updated`);
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(doctor.id) });
      queryClient.invalidateQueries({ queryKey: ['meta'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not update the doctor');
    },
  });
}

/**
 * Delete a doctor.
 *
 * The API refuses to delete a doctor that still has patients (`409`) unless
 * the cascade flag is set, so the mutation accepts it explicitly.
 */
export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cascade }: { id: string; cascade?: boolean }) =>
      doctorService.remove(id, { cascade }),
    onSuccess: (_doctor, variables) => {
      toast.success(
        variables.cascade
          ? 'Doctor and their patients were removed'
          : 'Doctor removed from the directory',
      );
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['meta'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not remove the doctor');
    },
  });
}

/**
 * Option lists for the filter toolbars. The API provides them when available,
 * otherwise the local fallbacks keep the selects usable.
 */
export function useMetaFilters() {
  return useQuery<MetaFilters>({
    queryKey: ['meta', 'filters'],
    queryFn: async () => {
      try {
        const meta = await doctorService.meta();
        return {
          specializations:
            meta.specializations?.length ? meta.specializations : FALLBACK_SPECIALIZATIONS,
          hospitals: meta.hospitals?.length ? meta.hospitals : FALLBACK_HOSPITALS,
          conditions: meta.conditions?.length ? meta.conditions : FALLBACK_CONDITIONS,
          doctors: meta.doctors ?? [],
        };
      } catch {
        return {
          specializations: FALLBACK_SPECIALIZATIONS,
          hospitals: FALLBACK_HOSPITALS,
          conditions: FALLBACK_CONDITIONS,
          doctors: [],
        };
      }
    },
    staleTime: 10 * 60_000,
    retry: false,
  });
}

/**
 * All doctors — used to populate the "Doctor" filter and the doctor picker.
 *
 * The list comes from `GET /api/meta/filters`, which is not paginated, so the
 * dropdown always contains every doctor (the directory endpoint caps a page
 * at 100 records).
 */
export function useAllDoctors(): DoctorOption[] {
  const { data } = useMetaFilters();
  return useMemo(() => data?.doctors ?? [], [data]);
}

export type { Doctor, Patient, PatientInput };
