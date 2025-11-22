import type { Patient } from '@prisma/client';

import type { FormattedPatient } from './types';

export function formatPatient(patient: Patient): FormattedPatient {
  return {
    id:patient.id,
    name:patient.name,
    email:patient.email,
    phone:patient.phone,
    dateOfBirth:patient.dateOfBirth?patient.dateOfBirth.toISOString():null,
    address:patient.address,
    createdAt:patient.createdAt.toISOString(),
    updatedAt:patient.updatedAt.toISOString(),
  };
}

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