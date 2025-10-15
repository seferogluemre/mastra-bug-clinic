import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { appointmentService } from '../../appointment/appointment.service';

/**
 * Tool: Randevu Oluştur
 * Direkt servis çağrısı yapılır, fetch kullanılmaz
 */
export const createAppointmentTool = createTool({
  id: 'create-appointment',
  description: 'Creates a new appointment for a patient with a doctor at a specific date and time. Use this when the user wants to book, schedule, or create an appointment.',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID (UUID format)'),
    doctorId: z.string().uuid().describe('Doctor ID (UUID format)'),
    date: z.string().datetime().describe('Appointment date and time in ISO 8601 format (e.g., 2024-10-15T14:00:00Z)'),
    duration: z.number().min(15).max(240).optional().describe('Duration in minutes (default: 30, min: 15, max: 240)'),
    notes: z.string().max(500).optional().describe('Additional notes for the appointment'),
  }),
  outputSchema: z.object({
    id: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    date: z.string(),
    duration: z.number(),
    status: z.string(),
    notes: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    patient: z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
    }),
    doctor: z.object({
      id: z.string(),
      name: z.string(),
      specialty: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const appointment = await appointmentService.create({
        patientId: context.patientId,
        doctorId: context.doctorId,
        date: context.date,
        duration: context.duration,
        notes: context.notes,
      });
      return appointment;
    } catch (error) {
      throw new Error(`Randevu oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

/**
 * Tool: Randevuları Listele
 */
export const listAppointmentsTool = createTool({
  id: 'list-appointments',
  description: 'Lists appointments with optional filters. Can filter by patient, doctor, date range, or status. Use this when user asks to see, list, or check appointments.',
  inputSchema: z.object({
    patientId: z.string().uuid().optional().describe('Filter by patient ID'),
    doctorId: z.string().uuid().optional().describe('Filter by doctor ID'),
    startDate: z.string().datetime().optional().describe('Start date for filtering (ISO 8601 format)'),
    endDate: z.string().datetime().optional().describe('End date for filtering (ISO 8601 format)'),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().describe('Filter by appointment status'),
  }),
  outputSchema: z.array(
    z.object({
      id: z.string(),
      patientId: z.string(),
      doctorId: z.string(),
      date: z.string(),
      duration: z.number(),
      status: z.string(),
      notes: z.string().nullable(),
      patient: z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string().nullable(),
        email: z.string().nullable(),
      }),
      doctor: z.object({
        id: z.string(),
        name: z.string(),
        specialty: z.string(),
      }),
    })
  ),
  execute: async ({ context }) => {
    try {
      const appointments = await appointmentService.list(context);
      return appointments;
    } catch (error) {
      throw new Error(`Randevular listelenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

/**
 * Tool: Tek Randevu Getir
 */
export const getAppointmentTool = createTool({
  id: 'get-appointment',
  description: 'Gets details of a specific appointment by ID. Use this when user asks about a specific appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid().describe('Appointment ID (UUID format)'),
  }),
  outputSchema: z.object({
    id: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    date: z.string(),
    duration: z.number(),
    status: z.string(),
    notes: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    patient: z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
    }),
    doctor: z.object({
      id: z.string(),
      name: z.string(),
      specialty: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const appointment = await appointmentService.getById(context.appointmentId);
      return appointment;
    } catch (error) {
      throw new Error(`Randevu bulunamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

/**
 * Tool: Randevu Güncelle
 */
export const updateAppointmentTool = createTool({
  id: 'update-appointment',
  description: 'Updates an existing appointment. Can change date, status, notes, or duration. Use when user wants to modify, reschedule, or change an appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid().describe('Appointment ID to update'),
    date: z.string().datetime().optional().describe('New appointment date and time (ISO 8601 format)'),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().describe('New status'),
    notes: z.string().max(500).optional().describe('Updated notes'),
    duration: z.number().min(15).max(240).optional().describe('Updated duration in minutes'),
  }),
  outputSchema: z.object({
    id: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    date: z.string(),
    duration: z.number(),
    status: z.string(),
    notes: z.string().nullable(),
    updatedAt: z.string(),
    patient: z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
    }),
    doctor: z.object({
      id: z.string(),
      name: z.string(),
      specialty: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const { appointmentId, ...updateData } = context;
      const appointment = await appointmentService.update(appointmentId, updateData);
      return appointment;
    } catch (error) {
      throw new Error(`Randevu güncellenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

/**
 * Tool: Randevu Sil/İptal Et
 */
export const deleteAppointmentTool = createTool({
  id: 'delete-appointment',
  description: 'Cancels an appointment by ID. Use when user wants to cancel, delete, or remove an appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid().describe('Appointment ID to cancel'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const result = await appointmentService.delete(context.appointmentId);
      return result;
    } catch (error) {
      throw new Error(`Randevu iptal edilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

