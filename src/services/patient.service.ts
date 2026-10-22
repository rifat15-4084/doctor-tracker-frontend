import { api, unwrapData } from './api';
import { cleanParams, normalizeList } from '@/lib/utils';
import type { Paginated, Patient, PatientFilters, PatientInput } from '@/types';

/** Read the `data` block of the response envelope. */
const readData = <T>(body: unknown): T => unwrapData<T>(body);

/**
 * The API names the doctor reference `doctor`, the UI calls it `doctorId`.
 * The translation happens here so the rest of the app only deals with
 * `doctorId`.
 */
const toApiPayload = (input: Partial<PatientInput>) => {
  const { doctorId, ...rest } = input;
  return doctorId ? { ...rest, doctor: doctorId } : rest;
};

export const patientService = {
  /** Paginated + filterable patient list. */
  async list(filters: PatientFilters = {}): Promise<Paginated<Patient>> {
    const body = await api.get('/patients', { params: cleanParams(filters) }).then((res) => res.data);
    return normalizeList<Patient>(body, { page: filters.page, limit: filters.limit });
  },

  /** A single patient (including the assigned doctor). */
  async getById(id: string): Promise<Patient> {
    const body = await api.get(`/patients/${id}`).then((res) => res.data);
    return readData<Patient>(body);
  },

  /** Register a patient. */
  async create(input: PatientInput): Promise<Patient> {
    const body = await api.post('/patients', toApiPayload(input)).then((res) => res.data);
    return readData<Patient>(body);
  },

  /** Update a patient (partial). */
  async update(id: string, input: Partial<PatientInput>): Promise<Patient> {
    const body = await api.put(`/patients/${id}`, toApiPayload(input)).then((res) => res.data);
    return readData<Patient>(body);
  },

  /** Remove a patient. */
  async remove(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },
};
