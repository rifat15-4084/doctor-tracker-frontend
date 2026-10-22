'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormValues } from '@/lib/validators';
import { useAllDoctors } from '@/hooks/use-doctors';
import { useCreateDoctorPatient, useCreatePatient, useUpdatePatient } from '@/hooks/use-patients';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { GENDERS } from '@/lib/constants';
import type { Patient } from '@/types';

const EMPTY_FORM: PatientFormValues = {
  name: '',
  phone: '',
  age: '',
  gender: 'male',
  condition: '',
  doctorId: '',
};

export interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When present the modal switches to "edit" mode. */
  patient?: Patient | null;
  /** Locks the patient to a specific doctor (used on the doctor detail page). */
  defaultDoctorId?: string;
  /**
   * When set, a **new** patient is created through `POST /doctors/:id/patients`
   * so the doctor comes from the URL instead of the form payload.
   */
  doctorEndpointId?: string;
}

export function PatientFormModal({
  open,
  onClose,
  patient,
  defaultDoctorId,
  doctorEndpointId,
}: PatientFormModalProps) {
  const isEdit = Boolean(patient);
  const doctors = useAllDoctors();
  const createPatient = useCreatePatient();
  const createDoctorPatient = useCreateDoctorPatient(doctorEndpointId ?? '');
  const updatePatient = useUpdatePatient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    mode: 'onBlur',
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!open) return;

    if (patient) {
      reset({
        name: patient.name ?? '',
        phone: patient.phone ?? '',
        age: patient.age ?? '',
        gender: (patient.gender as PatientFormValues['gender']) ?? 'male',
        condition: patient.condition ?? '',
        doctorId: patient.doctorId ?? defaultDoctorId ?? '',
      });
      return;
    }

    reset({ ...EMPTY_FORM, doctorId: defaultDoctorId ?? '' });
  }, [open, patient, defaultDoctorId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (patient) {
      await updatePatient.mutateAsync({
        id: patient.id,
        input: {
          name: values.name,
          phone: values.phone,
          age: Number(values.age),
          gender: values.gender,
          condition: values.condition,
          doctorId: values.doctorId,
        },
      });
      onClose();
      return;
    }

    if (doctorEndpointId) {
      // The doctor comes from the URL - the API endpoint takes it from there.
      await createDoctorPatient.mutateAsync({
        name: values.name,
        phone: values.phone,
        age: Number(values.age),
        gender: values.gender,
        condition: values.condition,
      });
      onClose();
      return;
    }

    await createPatient.mutateAsync({
      name: values.name,
      phone: values.phone,
      age: Number(values.age),
      gender: values.gender,
      condition: values.condition,
      doctorId: values.doctorId,
    });

    onClose();
  });

  const busy =
    isSubmitting || createPatient.isPending || createDoctorPatient.isPending || updatePatient.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit patient' : 'Add patient'}
      description={
        isEdit
          ? 'Update the record. Changes are saved immediately.'
          : 'Register a new patient and attach them to a doctor.'
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={busy} type="button">
            {isEdit ? 'Save changes' : 'Add patient'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="patient-name" required>
            Full name
          </Label>
          <Input
            id="patient-name"
            placeholder="Jordan Reyes"
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name ? (
            <p className="mt-1.5 text-xs text-danger">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="patient-phone" required>
            Phone
          </Label>
          <Input
            id="patient-phone"
            type="tel"
            placeholder="+1 555 0142"
            invalid={Boolean(errors.phone)}
            {...register('phone')}
          />
          {errors.phone ? (
            <p className="mt-1.5 text-xs text-danger">{errors.phone.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="patient-age" required>
            Age
          </Label>
          <Input
            id="patient-age"
            type="number"
            min={0}
            max={120}
            placeholder="34"
            invalid={Boolean(errors.age)}
            {...register('age')}
          />
          {errors.age ? (
            <p className="mt-1.5 text-xs text-danger">{errors.age.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="patient-gender" required>
            Gender
          </Label>
          <Select
            id="patient-gender"
            options={GENDERS.map((gender) => ({ value: gender.value, label: gender.label }))}
            {...register('gender')}
          />
        </div>

        <div>
          <Label htmlFor="patient-condition" required>
            Condition
          </Label>
          <Input
            id="patient-condition"
            placeholder="Hypertension"
            invalid={Boolean(errors.condition)}
            {...register('condition')}
          />
          {errors.condition ? (
            <p className="mt-1.5 text-xs text-danger">{errors.condition.message}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="patient-doctor" required>
            Doctor
          </Label>
          <Select
            id="patient-doctor"
            placeholder="Select a doctor"
            options={(doctors ?? []).map((entry) => ({
              value: entry.id,
              label: entry.specialization
                ? `${entry.name} — ${entry.specialization}`
                : entry.name,
            }))}
            disabled={Boolean(defaultDoctorId || doctorEndpointId) && !patient}
            invalid={Boolean(errors.doctorId)}
            {...register('doctorId')}
          />
          {errors.doctorId ? (
            <p className="mt-1.5 text-xs text-danger">{errors.doctorId.message}</p>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
