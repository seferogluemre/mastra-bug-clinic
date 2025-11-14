import { z } from 'zod';

export const createDoctorSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  specialty: z.string().min(2, 'Uzmanlık alanı en az 2 karakter olmalı'),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir email adresi giriniz').optional(),
});

export type CreateDoctorDto = z.infer<typeof createDoctorSchema>;

export const updateDoctorSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').optional(),
  specialty: z.string().min(2, 'Uzmanlık alanı en az 2 karakter olmalı').optional(),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir email adresi giriniz').optional(),
});

export type UpdateDoctorDto = z.infer<typeof updateDoctorSchema>;

export const searchDoctorSchema = z.object({
  name: z.string().optional(),
  specialty: z.string().optional(),
  email: z.string().optional(),
});

export type SearchDoctorDto = z.infer<typeof searchDoctorSchema>;

export const listDoctorsSchema = z.object({
  specialty: z.string().optional(),
});

export type ListDoctorsDto = z.infer<typeof listDoctorsSchema>;
