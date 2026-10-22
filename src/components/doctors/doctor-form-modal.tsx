'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doctorSchema, type DoctorFormValues } from '@/lib/validators';
import { useCreateDoctor, useMetaFilters, useUpdateDoctor } from '@/hooks/use-doctors';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { FALLBACK_SPECIALIZATIONS } from '@/lib/constants';
import type { Doctor } from '@/types';

const EMPTY_FORM: DoctorFormValues = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  hospital: '',
};

export interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When present the modal switches to "edit" mode. */
  doctor?: Doctor | null;
}

export function DoctorFormModal({ open, onClose, doctor }: DoctorFormModalProps) {
  const isEdit = Boolean(doctor);
  const { data: meta } = useMetaFilters();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    mode: 'onBlur',
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!open) return;

    if (doctor) {
      reset({
        name: doctor.name ?? '',
        email: doctor.email ?? '',
        phone: doctor.phone ?? '',
        specialization: doctor.specialization ?? '',
        hospital: doctor.hospital ?? '',
      });
      return;
    }

    reset(EMPTY_FORM);
  }, [open, doctor, reset]);

  const specializations = meta?.specializations?.length
    ? meta.specializations
    : FALLBACK_SPECIALIZATIONS;
  const hospitals = meta?.hospitals ?? [];

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      specialization: values.specialization,
      hospital: values.hospital,
    };

    if (doctor) {
      await updateDoctor.mutateAsync({ id: doctor.id, input: payload });
    } else {
      await createDoctor.mutateAsync(payload);
    }

    onClose();
  });

  const busy = isSubmitting || createDoctor.isPending || updateDoctor.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit doctor' : 'Add doctor'}
      description={
        isEdit
          ? 'Update the profile in the doctor directory.'
          : 'Create a new profile in the doctor directory.'
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={busy} type="button">
            {isEdit ? 'Save changes' : 'Add doctor'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="doctor-name" required>
            Full name
          </Label>
          <Input
            id="doctor-name"
            placeholder="Dr. Ava Mitchell"
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name ? (
            <p className="mt-1.5 text-xs text-danger">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="doctor-email" required>
            Email
          </Label>
          <Input
            id="doctor-email"
            type="email"
            placeholder="a.mitchell@hospital.org"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="doctor-phone" required>
            Phone
          </Label>
          <Input
            id="doctor-phone"
            type="tel"
            placeholder="+1 555 0100"
            invalid={Boolean(errors.phone)}
            {...register('phone')}
          />
          {errors.phone ? (
            <p className="mt-1.5 text-xs text-danger">{errors.phone.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="doctor-specialization" required>
            Specialization
          </Label>
          <Select
            id="doctor-specialization"
            placeholder="Select a specialization"
            options={specializations.map((value) => ({ value, label: value }))}
            invalid={Boolean(errors.specialization)}
            {...register('specialization')}
          />
          {errors.specialization ? (
            <p className="mt-1.5 text-xs text-danger">{errors.specialization.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="doctor-hospital" required>
            Hospital / clinic
          </Label>
          <Input
            id="doctor-hospital"
            placeholder="City General Hospital"
            list="doctor-hospital-options"
            invalid={Boolean(errors.hospital)}
            {...register('hospital')}
          />
          <datalist id="doctor-hospital-options">
            {hospitals.map((hospital) => (
              <option key={hospital} value={hospital} />
            ))}
          </datalist>
          {errors.hospital ? (
            <p className="mt-1.5 text-xs text-danger">{errors.hospital.message}</p>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
