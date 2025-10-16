import prisma from '../../core/prisma';
import type { CreateAppointmentDto, UpdateAppointmentDto, ListAppointmentsDto } from './appointment.dto';
import { formatAppointment, formatAppointmentWithDetails, formatAppointmentsWithDetails } from './appointment.formatter';

export class AppointmentService {
  /**
   * Yeni randevu oluştur
   */
  async create(data: CreateAppointmentDto) {
    // Hasta var mı kontrol et
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new Error('Hasta bulunamadı');
    }

    // Doktor var mı kontrol et
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
    });

    if (!doctor) {
      throw new Error('Doktor bulunamadı');
    }

    // Randevu çakışması var mı kontrol et
    const appointmentDate = new Date(data.date);
    const duration = data.duration || 30;
    const appointmentEndTime = new Date(appointmentDate.getTime() + duration * 60000);

    // Doktorun bu tarihte tüm randevularını getir
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: data.doctorId,
        status: {
          in: ['pending', 'confirmed'],
        },
        date: {
          gte: new Date(appointmentDate.getTime() - 24 * 60 * 60000), // 1 gün öncesi
          lte: new Date(appointmentDate.getTime() + 24 * 60 * 60000), // 1 gün sonrası
        },
      },
    });

    // Çakışma kontrolü
    for (const existing of existingAppointments) {
      const existingEndTime = new Date(existing.date.getTime() + existing.duration * 60000);
      
      const isConflict = 
        (appointmentDate >= existing.date && appointmentDate < existingEndTime) || // Yeni randevu mevcut randevunun içinde başlıyor
        (appointmentEndTime > existing.date && appointmentEndTime <= existingEndTime) || // Yeni randevu mevcut randevunun içinde bitiyor
        (appointmentDate <= existing.date && appointmentEndTime >= existingEndTime); // Yeni randevu mevcut randevuyu kapsıyor
      
      if (isConflict) {
        const existingTime = existing.date.toLocaleString('tr-TR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit' 
        });
        throw new Error(`Bu saatte doktorun başka bir randevusu var (${existingTime})`);
      }
    }

    // Randevu oluştur
    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: appointmentDate,
        duration: data.duration || 30,
        notes: data.notes,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return formatAppointmentWithDetails(appointment);
  }

  /**
   * Randevuları listele
   */
  async list(filters: ListAppointmentsDto = {}) {
    const where: any = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return formatAppointmentsWithDetails(appointments);
  }

  /**
   * Tek randevu getir
   */
  async getById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      throw new Error('Randevu bulunamadı');
    }

    return formatAppointmentWithDetails(appointment);
  }

  /**
   * Randevu güncelle
   */
  async update(id: string, data: UpdateAppointmentDto) {
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      throw new Error('Randevu bulunamadı');
    }

    // Eğer tarih değiştiriliyorsa, çakışma kontrolü yap
    if (data.date) {
      const appointmentDate = new Date(data.date);
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId: existingAppointment.doctorId,
          status: {
            in: ['pending', 'confirmed'],
          },
          date: {
            gte: new Date(appointmentDate.getTime() - 60 * 60000),
            lte: new Date(appointmentDate.getTime() + 60 * 60000),
          },
        },
      });

      if (conflictingAppointment) {
        throw new Error('Bu saatte doktorun başka bir randevusu var');
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.duration && { duration: data.duration }),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return formatAppointmentWithDetails(updatedAppointment);
  }

  /**
   * Randevu sil (iptal et)
   */
  async delete(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new Error('Randevu bulunamadı');
    }

    // Soft delete yerine status'u cancelled yap
    await prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return {
      success: true,
      message: 'Randevu iptal edildi',
    };
  }
}

// Singleton instance
export const appointmentService = new AppointmentService();

