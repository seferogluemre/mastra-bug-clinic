import type { Patient } from '@prisma/client';

export interface FormattedPatient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  dateOfBirth: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedPatientWithDetails extends FormattedPatient {
  appointmentCount?: number;
  lastAppointment?: string | null;
}

export function formatPatient(patient: Patient): FormattedPatient {
  return {
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    dateOfBirth: patient.dateOfBirth?.toISOString() || null,
    address: patient.address,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  };
}

/**
 * Hasta listesi formatı
 */
export function formatPatients(patients: Patient[]): FormattedPatient[] {
  return patients.map(formatPatient);
}

export function formatPatientMinimal(patient: Patient) {
  return {
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
  };
}

