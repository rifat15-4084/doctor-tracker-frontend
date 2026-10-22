'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { doctorKeys } from '@/hooks/use-doctors';
import type { Paginated, Patient, PatientFilters, PatientInput } from '@/types';

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => ['patients', 'list'] as const,
  list: (filters: PatientFilters) => ['patients', 'list', filters] as const,
  details: () => ['patients', 'detail'] as const,
  detail: (id: string) => ['patients', 'detail', id] as const,
};

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientInput) => patientService.create(input),
    onSuccess: (patient) => {
      toast.success(`${patient.name} was registered`);
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not register the patient');
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PatientInput> }) =>
      patientService.update(id, input),
    onSuccess: (patient) => {
      toast.success(`${patient.name} was updated`);
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patient.id) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not update the patient');
    },
  });
}

/**
 * Optimistic delete: the row disappears instantly, the cache is rolled back if
 * the request fails and the list is revalidated afterwards.
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientService.remove(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: patientKeys.lists() });
      await queryClient.cancelQueries({ queryKey: doctorKeys.all });

      const previous = queryClient.getQueriesData<Paginated<Patient>>({
        queryKey: patientKeys.lists(),
      });

      queryClient.setQueriesData<Paginated<Patient>>(
        { queryKey: patientKeys.lists() },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.filter((patient) => patient.id !== id),
            total: Math.max(0, old.total - 1),
          };
        },
      );

      return { previous };
    },

    onError: (error: Error, _id, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error.message || 'Could not delete the patient');
    },

    onSuccess: () => {
      toast.success('Patient deleted');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Add a patient to a specific doctor (`POST /api/doctors/:id/patients`).
 *
 * Used on the doctor detail screen, where the doctor comes from the URL and
 * must not be picked by the user.
 */
export function useCreateDoctorPatient(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<PatientInput, 'doctorId'>) =>
      doctorService.addPatient(doctorId, input),
    onSuccess: (patient) => {
      toast.success(`${patient.name} was added to this doctor's list`);
      queryClient.invalidateQueries({ queryKey: doctorKeys.patients(doctorId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not add the patient');
    },
  });
}

/**
 * Remove a patient from a doctor's patient list
 * (`DELETE /api/doctors/:id/patients/:patientId`).
 *
 * Optimistic like the global delete: the row disappears instantly and is
 * restored when the request fails.
 */
export function useDeleteDoctorPatient(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) => doctorService.removePatient(doctorId, patientId),

    onMutate: async (patientId: string) => {
      await queryClient.cancelQueries({ queryKey: doctorKeys.patients(doctorId) });

      const previous = queryClient.getQueriesData<Paginated<Patient>>({
        queryKey: doctorKeys.patients(doctorId),
      });

      queryClient.setQueriesData<Paginated<Patient>>(
        { queryKey: doctorKeys.patients(doctorId) },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.filter((patient) => patient.id !== patientId),
            total: Math.max(0, old.total - 1),
          };
        },
      );

      return { previous };
    },

    onError: (error: Error, _patientId, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error.message || 'Could not remove the patient');
    },

    onSuccess: () => {
      toast.success('Patient removed from this doctor');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.patients(doctorId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                                   Lists                                     */
/* -------------------------------------------------------------------------- */

/** Paginated patient list with `keepPreviousData` for seamless pagination. */
export function usePatients(filters: PatientFilters = {}) {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => patientService.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: patientKeys.detail(id ?? 'unknown'),
    queryFn: () => patientService.getById(id as string),
    enabled: Boolean(id),
  });
}
