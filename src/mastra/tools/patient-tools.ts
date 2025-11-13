import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { patientService } from '../../modules/patient/service';

export const createPatientTool = createTool({
  id: 'createPatient',
  description: 'Register a new patient in the system. Use when user wants to create profile or register.',
  inputSchema: z.object({
    name: z.string().min(2).describe('Patient full name'),
    phone: z.string().optional().describe('Phone number'),
    email: z.string().email().optional().describe('Email address'),
    dateOfBirth: z.string().datetime().optional().describe('Date of birth (ISO format)'),
    address: z.string().optional().describe('Address'),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    dateOfBirth: z.string().nullable(),
    address: z.string().nullable(),
    createdAt: z.string(),
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

/**
 * Tool: Hasta Bilgilerini Getir
 */
export const getPatientTool = createTool({
  id: 'getPatient',
  description: 'Get patient information by ID',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID'),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    dateOfBirth: z.string().nullable(),
    address: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    recentAppointments: z.array(z.object({
      id: z.string(),
      date: z.string(),
      status: z.string(),
      doctorName: z.string(),
      specialty: z.string(),
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

/**
 * Tool: Email ile Hasta Bul
 */
export const findPatientByEmailTool = createTool({
  id: 'findPatientByEmail',
  description: 'Find patient by email address. Returns null if not found.',
  inputSchema: z.object({
    email: z.string().email().describe('Patient email address'),
  }).strict(),
  outputSchema: z.union([
    z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
      dateOfBirth: z.string().nullable(),
      address: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
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

/**
 * Tool: Hasta Ara
 */
export const searchPatientTool = createTool({
  id: 'searchPatient',
  description: 'Search patients by name, phone, or email',
  inputSchema: z.object({
    name: z.string().optional().describe('Search by name'),
    phone: z.string().optional().describe('Search by phone'),
    email: z.string().optional().describe('Search by email'),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
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

/**
 * Tool: Hasta Bilgilerini Güncelle
 */
export const updatePatientTool = createTool({
  id: 'updatePatient',
  description: 'Update patient information',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID'),
    name: z.string().min(2).optional().describe('New name'),
    phone: z.string().optional().describe('New phone'),
    email: z.string().email().optional().describe('New email'),
    address: z.string().optional().describe('New address'),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    address: z.string().nullable(),
    updatedAt: z.string(),
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

/**
 * Tool: Hasta İstatistikleri
 */
export const getPatientStatsTool = createTool({
  id: 'getPatientStats',
  description: 'Get patient statistics (total appointments, upcoming, completed)',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID'),
  }).strict(),
  outputSchema: z.object({
    patient: z.object({
      id: z.string(),
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

