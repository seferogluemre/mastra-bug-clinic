import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { patientService } from '../../modules/patient/service';

export const createPatientTool = createTool({
  id: 'createPatient',
  description: 'Register a new patient in the system. Use when user wants to create profile or register.',
  inputSchema: z.object({
    name: z.string().min(2).describe('Patient full name (minimum 2 characters)'),
    phone: z.string().optional().describe('Patient phone number (optional)'),
    email: z.string().email().optional().describe('Patient email address (optional, must be valid email)'),
    dateOfBirth: z.string().datetime().optional().describe('Date of birth in ISO format (optional, e.g., 1990-01-15T00:00:00.000Z)'),
    address: z.string().optional().describe('Patient home address (optional)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Unique patient ID (UUID)'),
    name: z.string().describe('Patient full name'),
    phone: z.string().nullable().describe('Patient phone number'),
    email: z.string().nullable().describe('Patient email address'),
    dateOfBirth: z.string().nullable().describe('Date of birth in ISO format'),
    address: z.string().nullable().describe('Patient home address'),
    createdAt: z.string().describe('Registration timestamp'),
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
  description: 'Get patient information by ID. Returns patient details with recent appointments.',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID (UUID format)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Unique patient ID (UUID)'),
    name: z.string().describe('Patient full name'),
    phone: z.string().nullable().describe('Patient phone number'),
    email: z.string().nullable().describe('Patient email address'),
    dateOfBirth: z.string().nullable().describe('Date of birth in ISO format'),
    address: z.string().nullable().describe('Patient home address'),
    createdAt: z.string().describe('Registration timestamp'),
    updatedAt: z.string().describe('Last update timestamp'),
    recentAppointments: z.array(z.object({
      id: z.string().describe('Appointment ID'),
      date: z.string().describe('Appointment date and time'),
      status: z.string().describe('Appointment status'),
      doctorName: z.string().describe('Doctor full name'),
      specialty: z.string().describe('Doctor specialty'),
    }).describe('Appointment record')).describe('List of recent appointments'),
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
  description: 'Find patient by email address. Returns patient object if found, null otherwise.',
  inputSchema: z.object({
    email: z.string().email().describe('Patient email address to search for'),
  }).strict(),
  outputSchema: z.union([
    z.object({
      id: z.string().describe('Unique patient ID (UUID)'),
      name: z.string().describe('Patient full name'),
      phone: z.string().nullable().describe('Patient phone number'),
      email: z.string().nullable().describe('Patient email address'),
      dateOfBirth: z.string().nullable().describe('Date of birth in ISO format'),
      address: z.string().nullable().describe('Patient home address'),
      createdAt: z.string().describe('Registration timestamp'),
      updatedAt: z.string().describe('Last update timestamp'),
    }).describe('Patient information if found'),
    z.null().describe('Null if patient not found'),
  ]).describe('Patient object or null'),
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
  description: 'Search patients by name, phone, or email. Provide at least one search parameter.',
  inputSchema: z.object({
    name: z.string().optional().describe('Search by patient name (partial match supported)'),
    phone: z.string().optional().describe('Search by patient phone number'),
    email: z.string().optional().describe('Search by patient email address'),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string().describe('Unique patient ID (UUID)'),
    name: z.string().describe('Patient full name'),
    phone: z.string().nullable().describe('Patient phone number'),
    email: z.string().nullable().describe('Patient email address'),
  }).describe('Patient search result')).describe('List of matching patients'),
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
  description: 'Update patient information. Provide only the fields you want to change.',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID to update (UUID format)'),
    name: z.string().min(2).optional().describe('New patient name (minimum 2 characters, optional)'),
    phone: z.string().optional().describe('New phone number (optional)'),
    email: z.string().email().optional().describe('New email address (optional, must be valid email)'),
    address: z.string().optional().describe('New home address (optional)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Unique patient ID (UUID)'),
    name: z.string().describe('Updated patient full name'),
    phone: z.string().nullable().describe('Updated patient phone number'),
    email: z.string().nullable().describe('Updated patient email address'),
    address: z.string().nullable().describe('Updated patient home address'),
    updatedAt: z.string().describe('Update timestamp'),
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
  description: 'Get patient appointment statistics including total, upcoming, and completed appointments.',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID to get statistics for (UUID format)'),
  }).strict(),
  outputSchema: z.object({
    patient: z.object({
      id: z.string().describe('Patient UUID'),
      name: z.string().describe('Patient full name'),
    }).describe('Patient basic information'),
    stats: z.object({
      totalAppointments: z.number().describe('Total number of appointments (all statuses)'),
      upcomingAppointments: z.number().describe('Number of upcoming appointments (pending/confirmed)'),
      completedAppointments: z.number().describe('Number of completed appointments'),
    }).describe('Appointment statistics'),
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