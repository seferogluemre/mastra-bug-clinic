import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { appointmentService } from '../../modules/appointment/service';

const DEFAULT_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440001'; // Ayşe Yılmaz
const DEFAULT_DOCTOR_ID = '660e8400-e29b-41d4-a716-446655440001'; // Dr. Ahmet Yılmaz

export const createAppointmentTool = createTool({
  id: 'create-appointment',
  description: 'Creates appointment. Only date required. Patient/Doctor auto-assigned.',
  inputSchema: z.object({
    date: z.string().datetime().describe('Date in ISO format (YYYY-MM-DDTHH:mm:ss.000Z)'),
    notes: z.string().max(500).optional().describe('Optional notes'),
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
        patientId: DEFAULT_PATIENT_ID,
        doctorId: DEFAULT_DOCTOR_ID,
        date: context.date,
        duration: 30,
        notes: context.notes,
      });
      return appointment;
    } catch (error) {
      throw new Error(`Randevu oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const listAppointmentsTool = createTool({
  id: 'list-appointments',
  description: 'Lists all appointments. No parameters needed.',
  inputSchema: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().describe('Filter by status'),
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
      const appointments = await appointmentService.list({
        patientId: DEFAULT_PATIENT_ID,
        status: context.status,
      });
      return appointments;
    } catch (error) {
      throw new Error(`Randevular listelenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

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