import type { Prescription, Medication, Patient, Doctor } from '@prisma/client';
import type { FormattedPrescription, FormattedPrescriptionWithDetails, FormattedMedication } from './types';

export function formatMedication(medication: Medication): FormattedMedication {
  return {
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    duration: medication.duration,
    instructions: medication.instructions,
    createdAt: medication.createdAt.toISOString(),
    updatedAt: medication.updatedAt.toISOString(),
  };
}

export function formatMedications(medications: Medication[]): FormattedMedication[] {
  return medications.map(formatMedication);
}

export function formatPrescription(prescription: Prescription): FormattedPrescription {
  return {
    id: prescription.id,
    patientId: prescription.patientId,
    doctorId: prescription.doctorId,
    medicalRecordId: prescription.medicalRecordId,
    diagnosis: prescription.diagnosis,
    notes: prescription.notes,
    validUntil: prescription.validUntil?.toISOString() || null,
    status: prescription.status,
    createdAt: prescription.createdAt.toISOString(),
    updatedAt: prescription.updatedAt.toISOString(),
  };
}

export function formatPrescriptionWithDetails(
  prescription: Prescription & {
    patient: Patient;
    doctor: Doctor;
    medications: Medication[];
  }
): FormattedPrescriptionWithDetails {
  return {
    ...formatPrescription(prescription),
    patient: {
      id: prescription.patient.id,
      name: prescription.patient.name,
      phone: prescription.patient.phone,
    },
    doctor: {
      id: prescription.doctor.id,
      name: prescription.doctor.name,
      specialty: prescription.doctor.specialty,
    },
    medications: formatMedications(prescription.medications),
  };
}

export function formatPrescriptions(prescriptions: Prescription[]): FormattedPrescription[] {
  return prescriptions.map(formatPrescription);
}

export function formatPrescriptionsWithDetails(
  prescriptions: Array<
    Prescription & {
      patient: Patient;
      doctor: Doctor;
      medications: Medication[];
    }
  >
): FormattedPrescriptionWithDetails[] {
  return prescriptions.map(formatPrescriptionWithDetails);
}

