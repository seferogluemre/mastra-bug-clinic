import { z } from 'zod';

export const medicationSchema = z.object({
  name: z.string().min(1, 'İlaç adı girilmeli'),
  dosage: z.string().min(1, 'Doz girilmeli'),
  frequency: z.string().min(1, 'Kullanım sıklığı girilmeli'),
  duration: z.string().min(1, 'Kullanım süresi girilmeli'),
  instructions: z.string().optional(),
});

export type MedicationDto = z.infer<typeof medicationSchema>;

export const createPrescriptionSchema = z.object({
  patientId: z.string().uuid('Geçerli bir hasta ID giriniz'),
  doctorId: z.string().uuid('Geçerli bir doktor ID giriniz'),
  medicalRecordId: z.string().uuid().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  medications: z.array(medicationSchema).min(1, 'En az bir ilaç girilmeli'),
});

export type CreatePrescriptionDto = z.infer<typeof createPrescriptionSchema>;

export const updatePrescriptionSchema = z.object({
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  status: z.enum(['active', 'expired', 'cancelled']).optional(),
});

export type UpdatePrescriptionDto = z.infer<typeof updatePrescriptionSchema>;

export const listPrescriptionsSchema = z.object({
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  medicalRecordId: z.string().uuid().optional(),
  status: z.enum(['active', 'expired', 'cancelled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type ListPrescriptionsDto = z.infer<typeof listPrescriptionsSchema>;

export const addMedicationSchema = z.object({
  prescriptionId: z.string().uuid('Geçerli bir reçete ID giriniz'),
  medication: medicationSchema,
});

export type AddMedicationDto = z.infer<typeof addMedicationSchema>;

