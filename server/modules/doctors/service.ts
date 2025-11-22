import prisma from '../../core/prisma';
import type { CreateDoctorDto, UpdateDoctorDto, SearchDoctorDto, ListDoctorsDto } from './dtos';
import { formatDoctor, formatDoctors } from './formatters';

export class DoctorService {
  async create(data: CreateDoctorDto) {
    if (data.email) {
      const existing = await prisma.doctor.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new Error('Bu email ile kayıtlı doktor zaten mevcut');
      }
    }

    const doctor = await prisma.doctor.create({
      data: {
        name: data.name,
        specialty: data.specialty,
        phone: data.phone,
        email: data.email,
      },
    });

    return formatDoctor(doctor);
  }

  async getById(id: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: {
          where: {
            status: { in: ['pending', 'confirmed'] },
            date: { gte: new Date() },
          },
          orderBy: { date: 'asc' },
          take: 5,
          include: {
            patient: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new Error('Doktor bulunamadı');
    }

    return {
      ...formatDoctor(doctor),
      upcomingAppointments: doctor.appointments.map(apt => ({
        id: apt.id,
        date: apt.date.toISOString(),
        status: apt.status,
        patientName: apt.patient.name,
        notes: apt.notes,
      })),
    };
  }

  async getByEmail(email: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (!doctor) {
      return null;
    }

    return formatDoctor(doctor);
  }

  async list(filters: ListDoctorsDto = {}) {
    const where: any = {};

    if (filters.specialty) {
      where.specialty = {
        contains: filters.specialty,
        mode: 'insensitive',
      };
    }

    const doctors = await prisma.doctor.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return formatDoctors(doctors);
  }

  async search(filters: SearchDoctorDto) {
    const where: any = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.specialty) {
      where.specialty = {
        contains: filters.specialty,
        mode: 'insensitive',
      };
    }

    if (filters.email) {
      where.email = filters.email;
    }

    const doctors = await prisma.doctor.findMany({
      where,
      take: 10,
      orderBy: {
        name: 'asc',
      },
    });

    return formatDoctors(doctors);
  }

  async update(id: string, data: UpdateDoctorDto) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new Error('Doktor bulunamadı');
    }

    if (data.email && data.email !== doctor.email) {
      const existing = await prisma.doctor.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new Error('Bu email ile kayıtlı başka bir doktor var');
      }
    }

    const updated = await prisma.doctor.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.specialty && { specialty: data.specialty }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
      },
    });

    return formatDoctor(updated);
  }

  async delete(id: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: {
          where: {
            status: { in: ['pending', 'confirmed'] },
            date: { gte: new Date() },
          },
        },
      },
    });

    if (!doctor) {
      throw new Error('Doktor bulunamadı');
    }

    if (doctor.appointments.length > 0) {
      throw new Error('Aktif randevuları olan doktor silinemez');
    }

    await prisma.doctor.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Doktor kaydı silindi',
    };
  }

  async getStats(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [doctor, upcomingCount, todayCount, totalPatients] = await Promise.all([
      prisma.doctor.findUnique({ where: { id: doctorId } }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: { in: ['pending', 'confirmed'] },
          date: { gte: new Date() },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: { in: ['pending', 'confirmed'] },
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.appointment.findMany({
        where: { doctorId },
        select: { patientId: true },
        distinct: ['patientId'],
      }),
    ]);

    if (!doctor) {
      throw new Error('Doktor bulunamadı');
    }

    return {
      doctor: formatDoctor(doctor),
      stats: {
        upcomingAppointments: upcomingCount,
        todayAppointments: todayCount,
        totalPatients: totalPatients.length,
      },
    };
  }

  async getSchedule(doctorId: string, date: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new Error('Doktor bulunamadı');
    }

    const targetDate = new Date(date);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      include: {
        patient: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return {
      doctor: formatDoctor(doctor),
      date: date,
      appointments: appointments.map(apt => ({
        id: apt.id,
        date: apt.date.toISOString(),
        duration: apt.duration,
        status: apt.status,
        patient: {
          id: apt.patient.id,
          name: apt.patient.name,
          phone: apt.patient.phone,
        },
        notes: apt.notes,
      })),
    };
  }
}

export const doctorService = new DoctorService();