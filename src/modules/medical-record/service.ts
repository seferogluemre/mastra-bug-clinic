import prisma from '../../core/prisma';
import type { CreateMedicalRecordDto, UpdateMedicalRecordDto, ListMedicalRecordsDto } from './dtos';
import { formatMedicalRecord, formatMedicalRecordWithDetails, formatMedicalRecordsWithDetails } from './formatters';

export class MedicalRecordService {
  async create(data: CreateMedicalRecordDto) {
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new Error('Hasta bulunamadı');
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
    });

    if (!doctor) {
      throw new Error('Doktor bulunamadı');
    }

    if (data.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
      });

      if (!appointment) {
        throw new Error('Randevu bulunamadı');
      }
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        chiefComplaint: data.chiefComplaint,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        notes: data.notes,
        treatment: data.treatment,
        bloodPressure: data.bloodPressure,
        heartRate: data.heartRate,
        temperature: data.temperature,
        weight: data.weight,
        height: data.height,
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });

    return formatMedicalRecordWithDetails(record);
  }

  async getById(id: string) {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });

    if (!record) {
      throw new Error('Tıbbi kayıt bulunamadı');
    }

    return formatMedicalRecordWithDetails(record);
  }

  async list(filters: ListMedicalRecordsDto = {}) {
    const where: any = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.appointmentId) {
      where.appointmentId = filters.appointmentId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return formatMedicalRecordsWithDetails(records);
  }

  async update(id: string, data: UpdateMedicalRecordDto) {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new Error('Tıbbi kayıt bulunamadı');
    }

    const updated = await prisma.medicalRecord.update({
      where: { id },
      data: {
        ...(data.chiefComplaint && { chiefComplaint: data.chiefComplaint }),
        ...(data.diagnosis !== undefined && { diagnosis: data.diagnosis }),
        ...(data.symptoms !== undefined && { symptoms: data.symptoms }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.treatment !== undefined && { treatment: data.treatment }),
        ...(data.bloodPressure !== undefined && { bloodPressure: data.bloodPressure }),
        ...(data.heartRate !== undefined && { heartRate: data.heartRate }),
        ...(data.temperature !== undefined && { temperature: data.temperature }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.height !== undefined && { height: data.height }),
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });

    return formatMedicalRecordWithDetails(updated);
  }

  async delete(id: string) {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new Error('Tıbbi kayıt bulunamadı');
    }

    await prisma.medicalRecord.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Tıbbi kayıt silindi',
    };
  }

  async getPatientHistory(patientId: string) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new Error('Hasta bulunamadı');
    }

    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
        doctor: true,
        appointment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth?.toISOString() || null,
      },
      totalRecords: records.length,
      records: records.map(record => ({
        id: record.id,
        date: record.createdAt.toISOString(),
        chiefComplaint: record.chiefComplaint,
        diagnosis: record.diagnosis,
        doctorName: record.doctor.name,
        specialty: record.doctor.specialty,
      })),
    };
  }
}

export const medicalRecordService = new MedicalRecordService();

