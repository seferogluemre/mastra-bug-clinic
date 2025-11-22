import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Geçerli bir hasta ID giriniz'),
  doctorId: z.string().uuid('Geçerli bir doktor ID giriniz'),
  date: z.string().datetime('Geçerli bir tarih formatı giriniz (ISO 8601)'),
  duration: z.number().min(15).max(240).default(30).optional(),
  notes: z.string().max(500).optional(),
});

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  date: z.string().datetime().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  notes: z.string().max(500).optional(),
  duration: z.number().min(15).max(240).optional(),
});

export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;

export const listAppointmentsSchema = z.object({
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
});

export type ListAppointmentsDto = z.infer<typeof listAppointmentsSchema>;

