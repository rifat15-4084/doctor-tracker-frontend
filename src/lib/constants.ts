/** Shared, framework-level constants. */

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export const SEARCH_DEBOUNCE_MS = 400;

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  doctors: '/doctors',
  patients: '/patients',
} as const;

/**
 * Fallback option lists. The API may override them through
 * `GET /meta/filters`; these keep the UI usable when it is unavailable.
 */
export const FALLBACK_SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'ENT',
  'Gastroenterology',
  'General Medicine',
  'Gynecology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
];

export const FALLBACK_HOSPITALS = [
  'City General Hospital',
  'Lakeside Medical Center',
  'Northside Clinic',
  'Riverside Health',
  'St. Mary Hospital',
  'Sunrise Multispecialty',
];

export const FALLBACK_CONDITIONS = [
  'Asthma',
  'Cardiac Arrhythmia',
  'Diabetes Type 2',
  'Hypertension',
  'Migraine',
  'Osteoarthritis',
  'Sinusitis',
  'Type 1 Diabetes',
];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;
