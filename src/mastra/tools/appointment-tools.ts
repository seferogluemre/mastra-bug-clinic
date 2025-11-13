import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { appointmentService } from '../../modules/appointment/service';
import { tool } from 'ai';

const DEFAULT_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440001'; // Ayşe Yılmaz
const DEFAULT_DOCTOR_ID = '660e8400-e29b-41d4-a716-446655440001'; // Dr. Ahmet Yılmaz

export const createAppointmentTool = createTool({
  id: 'createAppointment',
  description: 'Creates appointment. Only date required. Patient/Doctor auto-assigned.',
  inputSchema: z.object({
    date: z.string().datetime().describe('Date in ISO format (YYYY-MM-DDTHH:mm:ss.000Z)'),
    notes: z.string().max(500).optional().describe('Optional notes'),
  }).strict(),
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
  id: 'listAppointments',
  description: 'Lists all appointments. No parameters needed.',
  inputSchema: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().describe('Filter by status'),
  }).strict(),
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
  id: 'getAppointment',
  description: 'Gets details of a specific appointment by ID. Use this when user asks about a specific appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid().describe('Appointment ID (UUID format)'),
  }).strict(),
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
  id: 'updateAppointment',
  description: 'Updates an existing appointment. Can change date, status, notes, or duration. Use when user wants to modify, reschedule, or change an appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid().describe('Appointment ID to update'),
    date: z.string().datetime().optional().describe('New appointment date and time (ISO 8601 format)'),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().describe('New status'),
    notes: z.string().max(500).optional().describe('Updated notes'),
    duration: z.number().min(15).max(240).optional().describe('Updated duration in minutes'),
  }).strict(),
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
  id: 'deleteAppointment',
  description: 'Cancels an appointment by ID. Use when user wants to cancel, delete, or remove an appointment.',
  inputSchema: z.object({
    appointmentId: z.string().uuid().describe('Appointment ID to cancel'),
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


export const aiCreateAppointmentTool = tool({
  description: 'Randevu oluşturur. Tarih ISO format olmalı (YYYY-MM-DDTHH:mm:ss.000Z). Not eklenebilir.',
  parameters: z.object({
    date: z.string().describe('Randevu tarihi ISO formatında (örn: 2025-11-14T12:00:00.000Z)'),
    notes: z.string().optional().describe('Randevu notu/şikayeti (isteğe bağlı)'),
  }),
  execute: async ({ date, notes }: { date: string; notes?: string }) => {
    try {
      const appointment = await appointmentService.create({
        patientId: DEFAULT_PATIENT_ID,
        doctorId: DEFAULT_DOCTOR_ID,
        date,
        duration: 30,
        notes,
      });
      return {
        success: true,
        appointment,
        message: `Randevu başarıyla oluşturuldu! ${appointment.patient.name} için ${new Date(appointment.date).toLocaleString('tr-TR')} tarihinde randevu alındı.`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },
});

export const aiListAppointmentsTool = tool({
  description: 'Tüm randevuları listeler. Status ile filtreleme yapılabilir.',
  parameters: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().describe('Randevu durumu filtresi'),
  }),
  execute: async ({ status }: { status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' }) => {
    try {
      const appointments = await appointmentService.list({
        patientId: DEFAULT_PATIENT_ID,
        status,
      });
      return {
        success: true,
        appointments,
        count: appointments.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },
});

export const aiUpdateAppointmentTool = tool({
  description: 'Randevu günceller. Tarih, status, not veya süre değiştirilebilir.',
  parameters: z.object({
    appointmentId: z.string().uuid().describe('Güncellenecek randevu ID'),
    date: z.string().datetime().optional().describe('Yeni randevu tarihi (ISO format)'),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().describe('Yeni durum'),
    notes: z.string().max(500).optional().describe('Güncellenmiş not'),
    duration: z.number().min(15).max(240).optional().describe('Güncellenmiş süre (dakika)'),
  }),
  execute: async ({ appointmentId, ...updateData }: { appointmentId: string; date?: string; status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'; notes?: string; duration?: number }) => {
    try {
      const appointment = await appointmentService.update(appointmentId, updateData);
      return {
        success: true,
        appointment,
        message: 'Randevu başarıyla güncellendi.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },
});