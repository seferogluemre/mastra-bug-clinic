import prisma from '../../core/prisma';
import type { CreatePrescriptionDto, UpdatePrescriptionDto, ListPrescriptionsDto, AddMedicationDto } from './dtos';
import { formatPrescription, formatPrescriptionWithDetails, formatPrescriptionsWithDetails, formatMedication } from './formatters';

export class PrescriptionService {
  async create(data: CreatePrescriptionDto) {
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

    if (data.medicalRecordId) {
      const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id: data.medicalRecordId },
      });

      if (!medicalRecord) {
        throw new Error('Tıbbi kayıt bulunamadı');
      }
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        medicalRecordId: data.medicalRecordId,
        diagnosis: data.diagnosis,
        notes: data.notes,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        medications: {
          create: data.medications,
        },
      },
      include: {
        patient: true,
        doctor: true,
        medications: true,
      },
    });

    return formatPrescriptionWithDetails(prescription);
  }

  async getById(id: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        medications: true,
      },
    });

    if (!prescription) {
      throw new Error('Reçete bulunamadı');
    }

    return formatPrescriptionWithDetails(prescription);
  }

  async list(filters: ListPrescriptionsDto = {}) {
    const where: any = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.medicalRecordId) {
      where.medicalRecordId = filters.medicalRecordId;
    }

    if (filters.status) {
      where.status = filters.status;
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

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        medications: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return formatPrescriptionsWithDetails(prescriptions);
  }

  async update(id: string, data: UpdatePrescriptionDto) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new Error('Reçete bulunamadı');
    }

    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        ...(data.diagnosis !== undefined && { diagnosis: data.diagnosis }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.validUntil && { validUntil: new Date(data.validUntil) }),
        ...(data.status && { status: data.status }),
      },
      include: {
        patient: true,
        doctor: true,
        medications: true,
      },
    });

    return formatPrescriptionWithDetails(updated);
  }

  async delete(id: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new Error('Reçete bulunamadı');
    }

    await prisma.prescription.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Reçete silindi',
    };
  }

  async addMedication(data: AddMedicationDto) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: data.prescriptionId },
    });

    if (!prescription) {
      throw new Error('Reçete bulunamadı');
    }

    const medication = await prisma.medication.create({
      data: {
        prescriptionId: data.prescriptionId,
        ...data.medication,
      },
    });

    return formatMedication(medication);
  }

  async removeMedication(medicationId: string) {
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId },
    });

    if (!medication) {
      throw new Error('İlaç bulunamadı');
    }

    await prisma.medication.delete({
      where: { id: medicationId },
    });

    return {
      success: true,
      message: 'İlaç reçeteden kaldırıldı',
    };
  }

  async getPatientPrescriptions(patientId: string, activeOnly = false) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new Error('Hasta bulunamadı');
    }

    const where: any = { patientId };

    if (activeOnly) {
      where.status = 'active';
      where.OR = [
        { validUntil: { gte: new Date() } },
        { validUntil: null },
      ];
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        doctor: true,
        medications: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      patient: {
        id: patient.id,
        name: patient.name,
      },
      totalPrescriptions: prescriptions.length,
      prescriptions: prescriptions.map(p => ({
        id: p.id,
        date: p.createdAt.toISOString(),
        diagnosis: p.diagnosis,
        status: p.status,
        validUntil: p.validUntil?.toISOString() || null,
        doctorName: p.doctor.name,
        medicationCount: p.medications.length,
        medications: p.medications.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
        })),
      })),
    };
  }
}

export const prescriptionService = new PrescriptionService();

