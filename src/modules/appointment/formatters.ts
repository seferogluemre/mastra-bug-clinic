import type { Appointment, Patient, Doctor } from '@prisma/client';

import type { FormattedAppointment, FormattedAppointmentWithDetails } from './types';

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

export function formatAppointments(appointments: Appointment[]): FormattedAppointment[] {
  return appointments.map(formatAppointment);
}

export function formatAppointmentsWithDetails(
  appointments: (Appointment & {
    patient: Patient;
    doctor: Doctor;
  })[]
): FormattedAppointmentWithDetails[] {
  return appointments.map(formatAppointmentWithDetails);
}