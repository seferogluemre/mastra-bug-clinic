import type { Doctor } from '@prisma/client';
import type { FormattedDoctor } from './types';

export function formatDoctor(doctor: Doctor): FormattedDoctor {
  return {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    phone: doctor.phone,
    email: doctor.email,
    createdAt: doctor.createdAt.toISOString(),
    updatedAt: doctor.updatedAt.toISOString(),
  };
}

export function formatDoctors(doctors: Doctor[]): FormattedDoctor[] {
  return doctors.map(formatDoctor);
}

