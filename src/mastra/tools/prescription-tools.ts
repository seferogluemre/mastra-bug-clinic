import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prescriptionService } from '../../modules/prescription/service';

const medicationSchema = z.object({
  name: z.string().min(1).describe('Medicine name'),
  dosage: z.string().min(1).describe('Dosage (e.g., "500mg", "10ml")'),
  frequency: z.string().min(1).describe('Frequency (e.g., "Günde 3 kez", "Her 8 saatte bir")'),
  duration: z.string().min(1).describe('Duration (e.g., "7 gün", "2 hafta")'),
  instructions: z.string().optional().describe('Usage instructions'),
});

export const createPrescriptionTool = createTool({
  id: 'createPrescription',
  description: 'Create a new prescription with medications for a patient. Must include at least one medication.',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID (UUID format)'),
    doctorId: z.string().uuid().describe('Doctor ID (UUID format)'),
    medicalRecordId: z.string().uuid().optional().describe('Related medical record ID (optional)'),
    diagnosis: z.string().optional().describe('Diagnosis for this prescription'),
    notes: z.string().optional().describe('Doctor\'s notes and instructions'),
    validUntil: z.string().datetime().optional().describe('Prescription expiry date (ISO format)'),
    medications: z.array(medicationSchema).min(1).describe('List of medications (at least 1 required)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Prescription ID'),
    patientId: z.string(),
    doctorId: z.string(),
    diagnosis: z.string().nullable(),
    status: z.string(),
    validUntil: z.string().nullable(),
    patient: z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string().nullable(),
    }),
    doctor: z.object({
      id: z.string(),
      name: z.string(),
      specialty: z.string(),
    }),
    medications: z.array(z.object({
      id: z.string(),
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
      instructions: z.string().nullable(),
    })),
    createdAt: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const prescription = await prescriptionService.create(context);
      return prescription;
    } catch (error) {
      throw new Error(`Reçete oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const getPrescriptionTool = createTool({
  id: 'getPrescription',
  description: 'Get detailed prescription by ID. Shows patient info, doctor info, and all medications.',
  inputSchema: z.object({
    prescriptionId: z.string().uuid().describe('Prescription ID (UUID format)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    diagnosis: z.string().nullable(),
    notes: z.string().nullable(),
    status: z.string(),
    validUntil: z.string().nullable(),
    patient: z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string().nullable(),
    }),
    doctor: z.object({
      id: z.string(),
      name: z.string(),
      specialty: z.string(),
    }),
    medications: z.array(z.object({
      id: z.string(),
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
      instructions: z.string().nullable(),
    })),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const prescription = await prescriptionService.getById(context.prescriptionId);
      return prescription;
    } catch (error) {
      throw new Error(`Reçete getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const listPrescriptionsTool = createTool({
  id: 'listPrescriptions',
  description: 'List prescriptions. Can filter by patient, doctor, status, or date range.',
  inputSchema: z.object({
    patientId: z.string().uuid().optional().describe('Filter by patient ID'),
    doctorId: z.string().uuid().optional().describe('Filter by doctor ID'),
    medicalRecordId: z.string().uuid().optional().describe('Filter by medical record ID'),
    status: z.enum(['active', 'expired', 'cancelled']).optional().describe('Filter by prescription status'),
    startDate: z.string().datetime().optional().describe('Start date for filtering'),
    endDate: z.string().datetime().optional().describe('End date for filtering'),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string(),
    diagnosis: z.string().nullable(),
    status: z.string(),
    validUntil: z.string().nullable(),
    patient: z.object({
      id: z.string(),
      name: z.string(),
    }),
    doctor: z.object({
      id: z.string(),
      name: z.string(),
      specialty: z.string(),
    }),
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
    })),
    createdAt: z.string(),
  })),
  execute: async ({ context }) => {
    try {
      const prescriptions = await prescriptionService.list(context);
      return prescriptions;
    } catch (error) {
      throw new Error(`Reçeteler listelenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const getPatientPrescriptionsTool = createTool({
  id: 'getPatientPrescriptions',
  description: 'Get all prescriptions for a patient. Optionally filter to show only active prescriptions.',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID (UUID format)'),
    activeOnly: z.boolean().default(false).optional().describe('Show only active prescriptions (default: false)'),
  }).strict(),
  outputSchema: z.object({
    patient: z.object({
      id: z.string(),
      name: z.string(),
    }),
    totalPrescriptions: z.number(),
    prescriptions: z.array(z.object({
      id: z.string(),
      date: z.string(),
      diagnosis: z.string().nullable(),
      status: z.string(),
      validUntil: z.string().nullable(),
      doctorName: z.string(),
      medicationCount: z.number(),
      medications: z.array(z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        duration: z.string(),
      })),
    })),
  }),
  execute: async ({ context }) => {
    try {
      const prescriptions = await prescriptionService.getPatientPrescriptions(
        context.patientId,
        context.activeOnly || false
      );
      return prescriptions;
    } catch (error) {
      throw new Error(`Hasta reçeteleri getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const updatePrescriptionTool = createTool({
  id: 'updatePrescription',
  description: 'Update prescription information. Can change diagnosis, notes, validity, or status.',
  inputSchema: z.object({
    prescriptionId: z.string().uuid().describe('Prescription ID to update'),
    diagnosis: z.string().optional().describe('Updated diagnosis'),
    notes: z.string().optional().describe('Updated notes'),
    validUntil: z.string().datetime().optional().describe('Updated expiry date'),
    status: z.enum(['active', 'expired', 'cancelled']).optional().describe('Updated status'),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    diagnosis: z.string().nullable(),
    status: z.string(),
    validUntil: z.string().nullable(),
    updatedAt: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const { prescriptionId, ...updateData } = context;
      const prescription = await prescriptionService.update(prescriptionId, updateData);
      return prescription;
    } catch (error) {
      throw new Error(`Reçete güncellenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const cancelPrescriptionTool = createTool({
  id: 'cancelPrescription',
  description: 'Cancel a prescription. Use when prescription needs to be invalidated.',
  inputSchema: z.object({
    prescriptionId: z.string().uuid().describe('Prescription ID to cancel'),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    status: z.string(),
    updatedAt: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const prescription = await prescriptionService.update(context.prescriptionId, {
        status: 'cancelled',
      });
      return prescription;
    } catch (error) {
      throw new Error(`Reçete iptal edilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

