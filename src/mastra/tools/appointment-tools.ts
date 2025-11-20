import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { appointmentService } from '../../modules/appointment/service';

export const createAppointmentTool = createTool({
  id: 'createAppointment',
  description: 'Creates appointment. Search patient/doctor first if not provided.',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Use createPatientTool or searchPatientTool first'),
    doctorId: z.string().uuid().describe('Use searchDoctorTool if user mentions doctor/specialty'),
    date: z.string().datetime(),
    notes: z.string().max(500).optional().describe('Patient health complaint only'),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    date: z.string(),
    status: z.string(),
    notes: z.string().nullable(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
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
  description: 'Lists appointments. Can filter by patient, doctor, or status.',
  inputSchema: z.object({
    patientId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string(),
    date: z.string(),
    status: z.string(),
    notes: z.string().nullable(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
      name: z.string(),
      specialty: z.string(),
    }),
  })),
  execute: async ({ context }) => {
    try {
      const appointments = await appointmentService.list({
        patientId: context.patientId,
        doctorId: context.doctorId,
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
  description: 'Gets appointment details by ID.',
  inputSchema: z.object({
    appointmentId: z.string().uuid(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    date: z.string(),
    status: z.string(),
    duration: z.number(),
    notes: z.string().nullable(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
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
  id: 'updateAppointment',
  description: 'Updates appointment date, status, notes, or duration.',
  inputSchema: z.object({
    appointmentId: z.string().uuid(),
    date: z.string().datetime().optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    notes: z.string().max(500).optional(),
    duration: z.number().min(15).max(240).optional(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    date: z.string(),
    status: z.string(),
    duration: z.number(),
    notes: z.string().nullable(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
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
  id: 'deleteAppointment',
  description: 'Cancels an appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid(),
  }).strict(),
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