import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { medicalRecordService } from '../../modules/medical-record/service';

export const createMedicalRecordTool = createTool({
  id: 'createMedicalRecord',
  description: 'Create a medical record for a patient after examination. Include vital signs and diagnosis.',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID (UUID format)'),
    doctorId: z.string().uuid().describe('Doctor ID (UUID format)'),
    appointmentId: z.string().uuid().optional().describe('Related appointment ID (optional)'),
    chiefComplaint: z.string().min(1).describe('Patient\'s main complaint/symptom'),
    diagnosis: z.string().optional().describe('Medical diagnosis'),
    symptoms: z.string().optional().describe('Detailed symptoms description'),
    notes: z.string().optional().describe('Doctor\'s notes and observations'),
    treatment: z.string().optional().describe('Treatment plan'),
    bloodPressure: z.string().optional().describe('Blood pressure (e.g., "120/80")'),
    heartRate: z.number().int().min(30).max(250).optional().describe('Heart rate (bpm)'),
    temperature: z.number().min(35).max(43).optional().describe('Body temperature (°C)'),
    weight: z.number().min(1).max(500).optional().describe('Weight (kg)'),
    height: z.number().min(50).max(250).optional().describe('Height (cm)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Medical record ID'),
    patientId: z.string().describe('Patient UUID'),
    doctorId: z.string().describe('Doctor UUID'),
    chiefComplaint: z.string().describe('Main complaint'),
    diagnosis: z.string().nullable().describe('Diagnosis'),
    patient: z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
    }),
    doctor: z.object({
      id: z.string(),
      name: z.string(),
      specialty: z.string(),
    }),
    createdAt: z.string().describe('Record creation timestamp'),
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
  description: 'Get detailed medical record by ID. Shows patient info, doctor info, and all medical data.',
  inputSchema: z.object({
    recordId: z.string().uuid().describe('Medical record ID (UUID format)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    chiefComplaint: z.string(),
    diagnosis: z.string().nullable(),
    symptoms: z.string().nullable(),
    notes: z.string().nullable(),
    treatment: z.string().nullable(),
    bloodPressure: z.string().nullable(),
    heartRate: z.number().nullable(),
    temperature: z.number().nullable(),
    weight: z.number().nullable(),
    height: z.number().nullable(),
    patient: z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
    }),
    doctor: z.object({
      id: z.string(),
      name: z.string(),
      specialty: z.string(),
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
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
  description: 'List medical records. Can filter by patient, doctor, or date range.',
  inputSchema: z.object({
    patientId: z.string().uuid().optional().describe('Filter by patient ID'),
    doctorId: z.string().uuid().optional().describe('Filter by doctor ID'),
    appointmentId: z.string().uuid().optional().describe('Filter by appointment ID'),
    startDate: z.string().datetime().optional().describe('Start date for filtering'),
    endDate: z.string().datetime().optional().describe('End date for filtering'),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string(),
    chiefComplaint: z.string(),
    diagnosis: z.string().nullable(),
    patient: z.object({
      id: z.string(),
      name: z.string(),
    }),
    doctor: z.object({
      id: z.string(),
      name: z.string(),
      specialty: z.string(),
    }),
    createdAt: z.string(),
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
  description: 'Get complete medical history for a patient. Shows all past records chronologically.',
  inputSchema: z.object({
    patientId: z.string().uuid().describe('Patient ID (UUID format)'),
  }).strict(),
  outputSchema: z.object({
    patient: z.object({
      id: z.string(),
      name: z.string(),
      dateOfBirth: z.string().nullable(),
    }),
    totalRecords: z.number(),
    records: z.array(z.object({
      id: z.string(),
      date: z.string(),
      chiefComplaint: z.string(),
      diagnosis: z.string().nullable(),
      doctorName: z.string(),
      specialty: z.string(),
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
  description: 'Update an existing medical record. Provide only the fields you want to change.',
  inputSchema: z.object({
    recordId: z.string().uuid().describe('Medical record ID to update'),
    chiefComplaint: z.string().min(1).optional().describe('Updated main complaint'),
    diagnosis: z.string().optional().describe('Updated diagnosis'),
    symptoms: z.string().optional().describe('Updated symptoms'),
    notes: z.string().optional().describe('Updated notes'),
    treatment: z.string().optional().describe('Updated treatment plan'),
    bloodPressure: z.string().optional().describe('Updated blood pressure'),
    heartRate: z.number().int().min(30).max(250).optional().describe('Updated heart rate'),
    temperature: z.number().min(35).max(43).optional().describe('Updated temperature'),
    weight: z.number().min(1).max(500).optional().describe('Updated weight'),
    height: z.number().min(50).max(250).optional().describe('Updated height'),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    chiefComplaint: z.string(),
    diagnosis: z.string().nullable(),
    updatedAt: z.string(),
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