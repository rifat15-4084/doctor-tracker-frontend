/* -------------------------------------------------------------------------- */
/*                                   Domain                                    */
/* -------------------------------------------------------------------------- */

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string | null;
}

export type Gender = 'male' | 'female' | 'other';

/**
 * A doctor as returned by the API.
 * Mirrors the `doctors` collection (plus the computed `patientsCount`).
 */
export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  specialization: string;
  hospital: string;
  /** Number of patients assigned to this doctor (computed by the API). */
  patientsCount?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

/** A patient as returned by the API. */
export interface Patient {
  id: string;
  name: string;
  phone?: string | null;
  age?: number | null;
  gender?: Gender | string | null;
  condition: string;
  /** Id of the doctor the patient is assigned to. */
  doctorId?: string | null;
  /** Name of the assigned doctor (resolved by the API). */
  doctorName?: string | null;
  /** Full doctor record - only returned by `GET /patients/:id`. */
  doctor?: {
    id: string;
    name: string;
    specialization?: string | null;
    hospital?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  createdAt: string;
  updatedAt?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                             Pagination & filters                            */
/* -------------------------------------------------------------------------- */

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Query parameters accepted by `GET /api/doctors`. */
export interface DoctorFilters {
  search?: string;
  specialization?: string;
  hospital?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/** Query parameters accepted by `GET /api/patients`. */
export interface PatientFilters {
  search?: string;
  condition?: string;
  /** Id of the doctor to filter by. */
  doctor?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/** Query parameters accepted by `GET /api/doctors/:id/patients`. */
export interface DoctorPatientFilters {
  search?: string;
  page?: number;
  limit?: number;
}

/* -------------------------------------------------------------------------- */
/*                                   Forms                                     */
/* -------------------------------------------------------------------------- */

/** Payload accepted by `POST`/`PUT /api/doctors`. */
export interface DoctorInput {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  hospital: string;
}

/** Payload accepted by `POST`/`PUT /api/patients`. */
export interface PatientInput {
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  condition: string;
  /** Id of the doctor the patient belongs to. */
  doctorId: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Dashboard                                  */
/* -------------------------------------------------------------------------- */

/** One bar of the "patients per doctor" chart. */
export interface DoctorPatientCount {
  doctorId: string;
  doctorName: string;
  specialization?: string | null;
  hospital?: string | null;
  count: number;
}

/** A `label -> count` breakdown (condition, specialisation, ...). */
export interface LabelCount {
  label: string;
  count: number;
}

/** A single day of the "new patients" time series. */
export interface DayCount {
  date: string;
  count: number;
}

/** A single month of the "new doctors" time series. */
export interface MonthCount {
  month: string;
  count: number;
}

/** Everything the dashboard needs - one `GET /api/dashboard/stats` response. */
export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  newDoctorsLast30Days: number;
  newPatientsLast30Days: number;
  newPatientsLast7Days: number;
  averagePatientsPerDoctor: number;
  topSpecialization: string | null;
  topSpecializationCount: number;
  patientsPerDoctor: DoctorPatientCount[];
  patientsPerCondition: LabelCount[];
  patientsPerSpecialization: LabelCount[];
  doctorsPerSpecialization: LabelCount[];
  patientsAddedPerDay: DayCount[];
  doctorsAddedPerMonth: MonthCount[];
  recentPatients: Patient[];
}

export interface ChartDatum {
  name: string;
  value: number;
}

export interface TimeSeriesDatum {
  date: string;
  value: number;
}

/* -------------------------------------------------------------------------- */
/*                                    Meta                                     */
/* -------------------------------------------------------------------------- */

export interface DoctorOption {
  id: string;
  name: string;
  specialization?: string | null;
}

/** Option lists for the filter dropdowns (`GET /api/meta/filters`). */
export interface MetaFilters {
  specializations: string[];
  hospitals: string[];
  conditions: string[];
  doctors: DoctorOption[];
}

/* -------------------------------------------------------------------------- */
/*                                    Auth                                     */
/* -------------------------------------------------------------------------- */

export interface LoginPayload {
  email: string;
  password: string;
}
