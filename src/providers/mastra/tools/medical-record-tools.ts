import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { medicalRecordService } from '../../../modules/medical-records/service';

export const createMedicalRecordTool = createTool({
  id: 'createMedicalRecord',
  description: 'Create medical record after examination.',
  inputSchema: z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid(),
    appointmentId: z.string().uuid().optional().describe('Link to appointment'),
    chiefComplaint: z.string().min(1),
    diagnosis: z.string().optional(),
    symptoms: z.string().optional(),
    notes: z.string().optional(),
    treatment: z.string().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.number().int().min(30).max(250).optional(),
    temperature: z.number().min(35).max(43).optional(),
    weight: z.number().min(1).max(500).optional(),
    height: z.number().min(50).max(250).optional(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    chiefComplaint: z.string(),
    diagnosis: z.string().nullable(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
      name: z.string(),
      specialty: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const record = await medicalRecordService.create(context);
      return record;
    } catch (error) {
      throw new Error(`Tıbbi kayıt oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const getMedicalRecordTool = createTool({
  id: 'getMedicalRecord',
  description: 'Get medical record by ID.',
  inputSchema: z.object({
    recordId: z.string().uuid(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    chiefComplaint: z.string(),
    diagnosis: z.string().nullable(),
    treatment: z.string().nullable(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
      name: z.string(),
      specialty: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const record = await medicalRecordService.getById(context.recordId);
      return record;
    } catch (error) {
      throw new Error(`Tıbbi kayıt getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const listMedicalRecordsTool = createTool({
  id: 'listMedicalRecords',
  description: 'List medical records. Filter by patient, doctor, or date.',
  inputSchema: z.object({
    patientId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    appointmentId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string(),
    chiefComplaint: z.string(),
    diagnosis: z.string().nullable(),
    patient: z.object({
      name: z.string(),
    }),
    doctor: z.object({
      name: z.string(),
      specialty: z.string(),
    }),
  })),
  execute: async ({ context }) => {
    try {
      const records = await medicalRecordService.list(context);
      return records;
    } catch (error) {
      throw new Error(`Tıbbi kayıtlar listelenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const getPatientMedicalHistoryTool = createTool({
  id: 'getPatientMedicalHistory',
  description: 'Get patient medical history chronologically.',
  inputSchema: z.object({
    patientId: z.string().uuid(),
  }).strict(),
  outputSchema: z.object({
    patient: z.object({
      name: z.string(),
    }),
    totalRecords: z.number(),
    records: z.array(z.object({
      date: z.string(),
      chiefComplaint: z.string(),
      diagnosis: z.string().nullable(),
      doctorName: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    try {
      const history = await medicalRecordService.getPatientHistory(context.patientId);
      return history;
    } catch (error) {
      throw new Error(`Hasta geçmişi getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const updateMedicalRecordTool = createTool({
  id: 'updateMedicalRecord',
  description: 'Update medical record.',
  inputSchema: z.object({
    recordId: z.string().uuid(),
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
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    chiefComplaint: z.string(),
    diagnosis: z.string().nullable(),
  }),
  execute: async ({ context }) => {
    try {
      const { recordId, ...updateData } = context;
      const record = await medicalRecordService.update(recordId, updateData);
      return record;
    } catch (error) {
      throw new Error(`Tıbbi kayıt güncellenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});