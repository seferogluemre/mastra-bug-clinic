import type { Appointment, Patient, Doctor } from '@prisma/client';

/**
 * Randevu formatters
 * Database modellerini API response formatına çevirir
 */

export interface FormattedAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  duration: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedAppointmentWithDetails extends FormattedAppointment {
  patient: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
}

/**
 * Basit randevu formatı
 */
export function formatAppointment(appointment: Appointment): FormattedAppointment {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    date: appointment.date.toISOString(),
    duration: appointment.duration,
    status: appointment.status,
    notes: appointment.notes,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };
}

/**
 * Detaylı randevu formatı (hasta ve doktor bilgileriyle)
 */
export function formatAppointmentWithDetails(
  appointment: Appointment & {
    patient: Patient;
    doctor: Doctor;
  }
): FormattedAppointmentWithDetails {
  return {
    ...formatAppointment(appointment),
    patient: {
      id: appointment.patient.id,
      name: appointment.patient.name,
      phone: appointment.patient.phone,
      email: appointment.patient.email,
    },
    doctor: {
      id: appointment.doctor.id,
      name: appointment.doctor.name,
      specialty: appointment.doctor.specialty,
    },
  };
}

/**
 * Randevu listesi formatı
 */
export function formatAppointments(appointments: Appointment[]): FormattedAppointment[] {
  return appointments.map(formatAppointment);
}

/**
 * Detaylı randevu listesi formatı
 */
export function formatAppointmentsWithDetails(
  appointments: (Appointment & {
    patient: Patient;
    doctor: Doctor;
  })[]
): FormattedAppointmentWithDetails[] {
  return appointments.map(formatAppointmentWithDetails);
}

