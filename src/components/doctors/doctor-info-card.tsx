'use client';

import { Building2, CalendarDays, Mail, Phone, Stethoscope } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatNumber } from '@/lib/utils';
import type { Doctor } from '@/types';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-subtle" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-subtle">{label}</p>
        <p className="mt-0.5 truncate text-sm text-fg">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export function DoctorInfoCard({
  doctor,
  patientCount,
  isLoading,
}: {
  doctor?: Doctor;
  patientCount?: number;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10" />
          ))}
        </div>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-violet/10"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={doctor.name} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold tracking-tight text-fg">
              {doctor.name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {doctor.specialization || 'General Medicine'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
          <div className="rounded-xl border border-line bg-surface-2/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-subtle">Patients</p>
            <p className="mt-1 font-display text-lg font-semibold text-fg">
              {formatNumber(patientCount ?? doctor.patientsCount ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface-2/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-subtle">Since</p>
            <p className="mt-1 font-display text-lg font-semibold text-fg">
              {doctor.createdAt ? formatDate(doctor.createdAt).split(',')[0] : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow
          icon={<Stethoscope className="h-4 w-4" />}
          label="Specialization"
          value={doctor.specialization}
        />
        <InfoRow
          icon={<Building2 className="h-4 w-4" />}
          label="Hospital"
          value={doctor.hospital}
        />
        <InfoRow
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={doctor.email}
        />
        <InfoRow
          icon={<Phone className="h-4 w-4" />}
          label="Phone"
          value={doctor.phone}
        />
        <InfoRow
          icon={<CalendarDays className="h-4 w-4" />}
          label="Registered"
          value={formatDate(doctor.createdAt)}
        />
      </div>
    </section>
  );
}
