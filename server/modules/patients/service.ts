import prisma from '../../core/prisma';
import type { CreatePatientDto, UpdatePatientDto, SearchPatientDto } from './dtos';
import { formatPatient, formatPatients } from './formatters';

export class PatientService {
  async create(data: CreatePatientDto) {
    if (data.email) {
      const existing = await prisma.patient.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new Error('Bu email ile kayıtlı hasta zaten mevcut');
      }
    }

    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address,
      },
    });

    return formatPatient(patient);
  }

  async getById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 5,
          include: {
            doctor: true,
          },
        },
      },
    });

    if (!patient) {
      throw new Error('Hasta bulunamadı');
    }

    return {
      ...formatPatient(patient),
      recentAppointments: patient.appointments.map(apt => ({
        id: apt.id,
        date: apt.date.toISOString(),
        status: apt.status,
        doctorName: apt.doctor.name,
        specialty: apt.doctor.specialty,
      })),
    };
  }

  async getByEmail(email: string) {
    const patient = await prisma.patient.findUnique({
      where: { email },
    });

    if (!patient) {
      return null;
    }

    return formatPatient(patient);
  }

  async search(filters: SearchPatientDto) {
    const where: any = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.phone) {
      where.phone = {
        contains: filters.phone,
      };
    }

    if (filters.email) {
      where.email = filters.email;
    }

    const patients = await prisma.patient.findMany({
      where,
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return formatPatients(patients);
  }

  async update(id: string, data: UpdatePatientDto) {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new Error('Hasta bulunamadı');
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.address !== undefined && { address: data.address }),
      },
    });

    return formatPatient(updated);
  }
  async delete(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new Error('Hasta bulunamadı');
    }

    await prisma.patient.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Hasta kaydı silindi',
    };
  }

  async getStats(patientId: string) {
    const [patient, appointmentCount, upcomingCount, completedCount] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.appointment.count({ where: { patientId } }),
      prisma.appointment.count({
        where: {
          patientId,
          status: { in: ['pending', 'confirmed'] },
          date: { gte: new Date() },
        },
      }),
      prisma.appointment.count({
        where: {
          patientId,
          status: 'completed',
        },
      }),
    ]);

    if (!patient) {
      throw new Error('Hasta bulunamadı');
    }

    return {
      patient: formatPatient(patient),
      stats: {
        totalAppointments: appointmentCount,
        upcomingAppointments: upcomingCount,
        completedAppointments: completedCount,
      },
    };
  }
}

export const patientService = new PatientService();