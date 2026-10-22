import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*                                    Login                                    */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/* -------------------------------------------------------------------------- */
/*                                    Doctor                                   */
/* -------------------------------------------------------------------------- */

/**
 * The doctor form mirrors the API contract exactly - every field below is
 * stored by the backend. Adding a field here without adding it to the API
 * would silently drop the value, so the two must be kept in sync.
 */
export const doctorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long'),
  specialization: z.string().trim().min(1, 'Select a specialization'),
  hospital: z
    .string()
    .trim()
    .min(2, 'Enter the hospital or clinic')
    .max(120, 'Hospital name is too long'),
});

export type DoctorFormValues = z.infer<typeof doctorSchema>;

/* -------------------------------------------------------------------------- */
/*                                   Patient                                   */
/* -------------------------------------------------------------------------- */

/**
 * The patient form mirrors the API contract exactly - every field below is
 * stored by the backend.
 */
export const patientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long'),
  age: z
    .union([z.string(), z.number()])
    .refine((value) => String(value).trim() !== '', 'Age is required')
    .refine(
      (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0 && parsed <= 120;
      },
      'Age must be between 0 and 120',
    ),
  gender: z.enum(['male', 'female', 'other']),
  condition: z
    .string()
    .trim()
    .min(2, 'Condition is required')
    .max(120, 'Condition is too long'),
  doctorId: z.string().trim().min(1, 'Select a doctor'),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
