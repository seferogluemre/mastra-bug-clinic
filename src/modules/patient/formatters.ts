import type { Patient } from '@prisma/client';

import type { FormattedPatient } from './types';

export function formatPatient(patient: Patient): FormattedPatient {
  return formatPatient(patient);
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

