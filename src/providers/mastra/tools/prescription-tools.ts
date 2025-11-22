import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prescriptionService } from '../../../modules/prescriptions/service';

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional(),
});

export const createPrescriptionTool = createTool({
  id: 'createPrescription',
  description: 'Create prescription with medications (min 1).',
  inputSchema: z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid(),
    medicalRecordId: z.string().uuid().optional().describe('Link to medical record'),
    diagnosis: z.string().optional(),
    notes: z.string().optional(),
    validUntil: z.string().datetime().optional(),
    medications: z.array(medicationSchema).min(1),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    diagnosis: z.string().nullable(),
    status: z.string(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
      name: z.string(),
    }),
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
    })),
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
  description: 'Get prescription by ID.',
  inputSchema: z.object({
    prescriptionId: z.string().uuid(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    diagnosis: z.string().nullable(),
    status: z.string(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
      name: z.string(),
    }),
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
    })),
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
  description: 'List prescriptions. Filter by patient, doctor, status, or date.',
  inputSchema: z.object({
    patientId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    medicalRecordId: z.string().uuid().optional(),
    status: z.enum(['active', 'expired', 'cancelled']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string(),
    diagnosis: z.string().nullable(),
    status: z.string(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
      name: z.string(),
    }),
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
    })),
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
  description: 'Get patient prescriptions. Filter by active status optional.',
  inputSchema: z.object({
    patientId: z.string().uuid(),
    activeOnly: z.boolean().default(false).optional(),
  }).strict(),
  outputSchema: z.object({
    patient: z.object({
      name: z.string(),
    }),
    totalPrescriptions: z.number(),
    prescriptions: z.array(z.object({
      date: z.string(),
      diagnosis: z.string().nullable(),
      status: z.string(),
      doctorName: z.string(),
      medications: z.array(z.object({
        name: z.string(),
        dosage: z.string(),
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
  description: 'Update prescription.',
  inputSchema: z.object({
    prescriptionId: z.string().uuid(),
    diagnosis: z.string().optional(),
    notes: z.string().optional(),
    validUntil: z.string().datetime().optional(),
    status: z.enum(['active', 'expired', 'cancelled']).optional(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    diagnosis: z.string().nullable(),
    status: z.string(),
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
  description: 'Cancel prescription.',
  inputSchema: z.object({
    prescriptionId: z.string().uuid(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    status: z.string(),
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

