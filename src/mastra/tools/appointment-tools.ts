import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { appointmentService } from '../../modules/appointment/service';

const DEFAULT_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440001'; // Ayşe Yılmaz
const DEFAULT_DOCTOR_ID = '660e8400-e29b-41d4-a716-446655440001'; // Dr. Ahmet Yılmaz

export const createAppointmentTool = createTool({
  id: 'createAppointment',
  description: 'Creates appointment. CRITICAL: 1) Use patientId from just created patient OR search by name/phone. 2) Extract patient\'s SPECIFIC health complaint in notes. If patientId not provided, uses default test patient.',
  inputSchema: z.object({
    patientId: z.string().uuid().optional().describe('Patient ID (UUID). IMPORTANT: Use the ID from just created patient (createPatientTool) or search with searchPatientTool. If not provided, uses default test patient.'),
    date: z.string().datetime().describe('Date in ISO format (YYYY-MM-DDTHH:mm:ss.000Z)'),
    notes: z.string().max(500).optional().describe('Patient\'s SPECIFIC health complaint or symptom from their original message. Examples: "boğaz ağrısı", "baş ağrısı", "grip". DO NOT use generic text like "randevu almak istedi".'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Unique appointment ID'),
    patientId: z.string().describe('Patient UUID'),
    doctorId: z.string().describe('Doctor UUID'),
    date: z.string().describe('Appointment date and time in ISO format'),
    duration: z.number().describe('Duration in minutes'),
    status: z.string().describe('Appointment status (pending/confirmed/cancelled/completed)'),
    notes: z.string().nullable().describe('Patient complaint or appointment notes'),
    createdAt: z.string().describe('Creation timestamp'),
    updatedAt: z.string().describe('Last update timestamp'),
    patient: z.object({
      id: z.string().describe('Patient UUID'),
      name: z.string().describe('Patient full name'),
      phone: z.string().nullable().describe('Patient phone number'),
      email: z.string().nullable().describe('Patient email address'),
    }).describe('Patient information'),
    doctor: z.object({
      id: z.string().describe('Doctor UUID'),
      name: z.string().describe('Doctor full name'),
      specialty: z.string().describe('Doctor medical specialty'),
    }).describe('Doctor information'),
  }),
  execute: async ({ context }) => {
    try {
      const appointment = await appointmentService.create({
        patientId: context.patientId || DEFAULT_PATIENT_ID,
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
  id: 'listAppointments',
  description: 'Lists all appointments. No parameters needed.',
  inputSchema: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().describe('Filter appointments by status (pending/confirmed/cancelled/completed)'),
  }).strict(),
  outputSchema: z.array(
    z.object({
      id: z.string().describe('Unique appointment ID'),
      patientId: z.string().describe('Patient UUID'),
      doctorId: z.string().describe('Doctor UUID'),
      date: z.string().describe('Appointment date and time in ISO format'),
      duration: z.number().describe('Duration in minutes'),
      status: z.string().describe('Appointment status (pending/confirmed/cancelled/completed)'),
      notes: z.string().nullable().describe('Patient complaint or appointment notes'),
      patient: z.object({
        id: z.string().describe('Patient UUID'),
        name: z.string().describe('Patient full name'),
        phone: z.string().nullable().describe('Patient phone number'),
        email: z.string().nullable().describe('Patient email address'),
      }).describe('Patient information'),
      doctor: z.object({
        id: z.string().describe('Doctor UUID'),
        name: z.string().describe('Doctor full name'),
        specialty: z.string().describe('Doctor medical specialty'),
      }).describe('Doctor information'),
    }).describe('Appointment record')
  ).describe('List of appointments'),
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
  id: 'getAppointment',
  description: 'Gets details of a specific appointment by ID. Use this when user asks about a specific appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid().describe('Appointment ID (UUID format)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Unique appointment ID'),
    patientId: z.string().describe('Patient UUID'),
    doctorId: z.string().describe('Doctor UUID'),
    date: z.string().describe('Appointment date and time in ISO format'),
    duration: z.number().describe('Duration in minutes'),
    status: z.string().describe('Appointment status (pending/confirmed/cancelled/completed)'),
    notes: z.string().nullable().describe('Patient complaint or appointment notes'),
    createdAt: z.string().describe('Creation timestamp'),
    updatedAt: z.string().describe('Last update timestamp'),
    patient: z.object({
      id: z.string().describe('Patient UUID'),
      name: z.string().describe('Patient full name'),
      phone: z.string().nullable().describe('Patient phone number'),
      email: z.string().nullable().describe('Patient email address'),
    }).describe('Patient information'),
    doctor: z.object({
      id: z.string().describe('Doctor UUID'),
      name: z.string().describe('Doctor full name'),
      specialty: z.string().describe('Doctor medical specialty'),
    }).describe('Doctor information'),
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
  id: 'updateAppointment',
  description: 'Updates an existing appointment. Can change date, status, notes, or duration. Use when user wants to modify, reschedule, or change an appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid().describe('Appointment ID to update (UUID format)'),
    date: z.string().datetime().optional().describe('New appointment date and time (ISO 8601 format, e.g., 2024-10-20T14:00:00.000Z)'),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().describe('New appointment status (pending/confirmed/cancelled/completed)'),
    notes: z.string().max(500).optional().describe('Updated appointment notes or patient complaint'),
    duration: z.number().min(15).max(240).optional().describe('Updated duration in minutes (15-240)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Unique appointment ID'),
    patientId: z.string().describe('Patient UUID'),
    doctorId: z.string().describe('Doctor UUID'),
    date: z.string().describe('Appointment date and time in ISO format'),
    duration: z.number().describe('Duration in minutes'),
    status: z.string().describe('Appointment status (pending/confirmed/cancelled/completed)'),
    notes: z.string().nullable().describe('Patient complaint or appointment notes'),
    updatedAt: z.string().describe('Last update timestamp'),
    patient: z.object({
      id: z.string().describe('Patient UUID'),
      name: z.string().describe('Patient full name'),
      phone: z.string().nullable().describe('Patient phone number'),
      email: z.string().nullable().describe('Patient email address'),
    }).describe('Patient information'),
    doctor: z.object({
      id: z.string().describe('Doctor UUID'),
      name: z.string().describe('Doctor full name'),
      specialty: z.string().describe('Doctor medical specialty'),
    }).describe('Doctor information'),
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
  id: 'deleteAppointment',
  description: 'Cancels an appointment by ID. Use when user wants to cancel, delete, or remove an appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid().describe('Appointment ID to cancel (UUID format)'),
  }).strict(),
  outputSchema: z.object({
    success: z.boolean().describe('Whether the cancellation was successful'),
    message: z.string().describe('Success or error message'),
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