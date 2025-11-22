import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
  patientId: z.string().uuid('Geçerli bir hasta ID giriniz'),
  doctorId: z.string().uuid('Geçerli bir doktor ID giriniz'),
  appointmentId: z.string().uuid().optional(),
  chiefComplaint: z.string().min(1, 'Ana şikayet girilmeli'),
  diagnosis: z.string().optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
  treatment: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.number().int().min(30).max(250).optional(),
  temperature: z.number().min(35).max(43).optional(),
  weight: z.number().min(1).max(500).optional(),
  height: z.number().min(50).max(250).optional(),
});

export type CreateMedicalRecordDto = z.infer<typeof createMedicalRecordSchema>;

export const updateMedicalRecordSchema = z.object({
  chiefComplaint: z.string().min(1).optional(),
  diagnosis: z.string().optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
  treatment: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.number().int().min(30).max(250).optional(),
  temperature: z.number().min(35).max(43).optional(),
  weight: z.number().min(1).max(500).optional(),
  height: z.number().min(50).max(250).optional(),
});

export type UpdateMedicalRecordDto = z.infer<typeof updateMedicalRecordSchema>;

export const listMedicalRecordsSchema = z.object({
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type ListMedicalRecordsDto = z.infer<typeof listMedicalRecordsSchema>;