import type { MedicalRecord, Patient, Doctor, Appointment } from '@prisma/client';
import type { FormattedMedicalRecord, FormattedMedicalRecordWithDetails } from './types';

export function formatMedicalRecord(record: MedicalRecord): FormattedMedicalRecord {
  return {
    id: record.id,
    patientId: record.patientId,
    doctorId: record.doctorId,
    appointmentId: record.appointmentId,
    chiefComplaint: record.chiefComplaint,
    diagnosis: record.diagnosis,
    symptoms: record.symptoms,
    notes: record.notes,
    treatment: record.treatment,
    bloodPressure: record.bloodPressure,
    heartRate: record.heartRate,
    temperature: record.temperature,
    weight: record.weight,
    height: record.height,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function formatMedicalRecordWithDetails(
  record: MedicalRecord & {
    patient: Patient;
    doctor: Doctor;
    appointment?: Appointment | null;
  }
): FormattedMedicalRecordWithDetails {
  return {
    ...formatMedicalRecord(record),
    patient: {
      id: record.patient.id,
      name: record.patient.name,
      phone: record.patient.phone,
      email: record.patient.email,
    },
    doctor: {
      id: record.doctor.id,
      name: record.doctor.name,
      specialty: record.doctor.specialty,
    },
    ...(record.appointment && {
      appointment: {
        id: record.appointment.id,
        date: record.appointment.date.toISOString(),
        status: record.appointment.status,
      },
    }),
  };
}

export function formatMedicalRecords(records: MedicalRecord[]): FormattedMedicalRecord[] {
  return records.map(formatMedicalRecord);
}

export function formatMedicalRecordsWithDetails(
  records: Array<
    MedicalRecord & {
      patient: Patient;
      doctor: Doctor;
      appointment?: Appointment | null;
    }
  >
): FormattedMedicalRecordWithDetails[] {
  return records.map(formatMedicalRecordWithDetails);
}

