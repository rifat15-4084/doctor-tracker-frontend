import { api, unwrapData } from './api';
import { cleanParams, normalizeList } from '@/lib/utils';
import type {
  Doctor,
  DoctorFilters,
  DoctorInput,
  DoctorPatientFilters,
  MetaFilters,
  Paginated,
  Patient,
  PatientInput,
} from '@/types';

/** Read the `data` block of the response envelope. */
const readData = <T>(body: unknown): T => unwrapData<T>(body);

export const doctorService = {
  /** Paginated + filterable doctor directory. */
  async list(filters: DoctorFilters = {}): Promise<Paginated<Doctor>> {
    const body = await api.get('/doctors', { params: cleanParams(filters) }).then((res) => res.data);
    return normalizeList<Doctor>(body, { page: filters.page, limit: filters.limit });
  },

  /** A single doctor (including its patient count). */
  async getById(id: string): Promise<Doctor> {
    const body = await api.get(`/doctors/${id}`).then((res) => res.data);
    return readData<Doctor>(body);
  },

  /** Create a doctor. */
  async create(input: DoctorInput): Promise<Doctor> {
    const body = await api.post('/doctors', input).then((res) => res.data);
    return readData<Doctor>(body);
  },

  /** Update a doctor (partial). */
  async update(id: string, input: Partial<DoctorInput>): Promise<Doctor> {
    const body = await api.put(`/doctors/${id}`, input).then((res) => res.data);
    return readData<Doctor>(body);
  },

  /**
   * Delete a doctor.
   *
   * The API refuses to orphan patients: deleting a doctor that still has
   * patients answers `409` unless the caller opts into the cascade.
   */
  async remove(id: string, options: { cascade?: boolean } = {}): Promise<void> {
    await api.delete(`/doctors/${id}`, {
      params: options.cascade ? { cascade: 'true' } : undefined,
    });
  },

  /** The patients treated by one doctor (paginated + searchable). */
  async listPatients(id: string, filters: DoctorPatientFilters = {}): Promise<Paginated<Patient>> {
    const body = await api
      .get(`/doctors/${id}/patients`, { params: cleanParams(filters) })
      .then((res) => res.data);
    return normalizeList<Patient>(body, { page: filters.page, limit: filters.limit });
  },

  /** Add a patient to a doctor (the doctor comes from the URL). */
  async addPatient(id: string, input: Omit<PatientInput, 'doctorId'>): Promise<Patient> {
    const body = await api.post(`/doctors/${id}/patients`, input).then((res) => res.data);
    return readData<Patient>(body);
  },

  /** Remove a patient from a doctor's patient list. */
  async removePatient(id: string, patientId: string): Promise<void> {
    await api.delete(`/doctors/${id}/patients/${patientId}`);
  },

  /** Filter option lists used by the toolbars. */
  async meta(): Promise<MetaFilters> {
    const body = await api.get('/meta/filters').then((res) => res.data);
    const data = readData<MetaFilters>(body);
    return {
      specializations: data.specializations ?? [],
      hospitals: data.hospitals ?? [],
      conditions: data.conditions ?? [],
      doctors: data.doctors ?? [],
    };
  },
};
