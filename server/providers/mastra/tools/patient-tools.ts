import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { patientService } from '../../../modules/patients/service';

export const createPatientTool = createTool({
  id: 'createPatient',
  description: 'Register new patient. Save returned ID for future use.',
  inputSchema: z.object({
    name: z.string().min(2),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    dateOfBirth: z.string().datetime().optional(),
    address: z.string().optional(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const patient = await patientService.create({
        name: context.name,
        phone: context.phone,
        email: context.email,
        dateOfBirth: context.dateOfBirth,
        address: context.address,
      });
      return patient;
    } catch (error) {
      throw new Error(`Hasta kaydı oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const getPatientTool = createTool({
  id: 'getPatient',
  description: 'Get patient info by ID.',
  inputSchema: z.object({
    patientId: z.string().uuid(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    recentAppointments: z.array(z.object({
      date: z.string(),
      status: z.string(),
      doctorName: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    try {
      const patient = await patientService.getById(context.patientId);
      return patient;
    } catch (error) {
      throw new Error(`Hasta bilgileri getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const findPatientByEmailTool = createTool({
  id: 'findPatientByEmail',
  description: 'Find patient by email.',
  inputSchema: z.object({
    email: z.string().email(),
  }).strict(),
  outputSchema: z.union([
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().nullable(),
    }),
    z.null(),
  ]),
  execute: async ({ context }) => {
    try {
      const patient = await patientService.getByEmail(context.email);
      return patient;
    } catch (error) {
      return null;
    }
  },
});

export const searchPatientTool = createTool({
  id: 'searchPatient',
  description: 'Search patients by name, phone, or email.',
  inputSchema: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
  })),
  execute: async ({ context }) => {
    try {
      const patients = await patientService.search(context);
      return patients;
    } catch (error) {
      throw new Error(`Hasta araması yapılamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const updatePatientTool = createTool({
  id: 'updatePatient',
  description: 'Update patient info.',
  inputSchema: z.object({
    patientId: z.string().uuid(),
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const { patientId, ...updateData } = context;
      const patient = await patientService.update(patientId, updateData);
      return patient;
    } catch (error) {
      throw new Error(`Hasta bilgileri güncellenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const getPatientStatsTool = createTool({
  id: 'getPatientStats',
  description: 'Get patient appointment statistics.',
  inputSchema: z.object({
    patientId: z.string().uuid(),
  }).strict(),
  outputSchema: z.object({
    patient: z.object({
      name: z.string(),
    }),
    stats: z.object({
      totalAppointments: z.number(),
      upcomingAppointments: z.number(),
      completedAppointments: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const stats = await patientService.getStats(context.patientId);
      return stats;
    } catch (error) {
      throw new Error(`İstatistikler getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});