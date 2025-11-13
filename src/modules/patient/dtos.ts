import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir email giriniz').optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  tcNo: z.string().length(11, 'TC No 11 karakter olmalı').optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-']).optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

export type CreatePatientDto = z.infer<typeof createPatientSchema>;

export const updatePatientSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  tcNo: z.string().length(11).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-']).optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

export type UpdatePatientDto = z.infer<typeof updatePatientSchema>;

export const searchPatientSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  tcNo: z.string().optional(),
});

export type SearchPatientDto = z.infer<typeof searchPatientSchema>;