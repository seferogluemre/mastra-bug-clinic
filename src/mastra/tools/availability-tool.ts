import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import prisma from '../../core/prisma';

const DEFAULT_DOCTOR_ID = '660e8400-e29b-41d4-a716-446655440001'; // Dr. Ahmet Yılmaz

export const checkDoctorAvailabilityTool = createTool({
  id: 'check-doctor-availability',
  description: 'Checks doctor availability for a specific date and shows available time slots. Use this when user asks about available times.',
  inputSchema: z.object({
    date: z.string().describe('Date to check availability (YYYY-MM-DD format, e.g., 2024-10-20)'),
    doctorId: z.string().uuid().optional().describe('Doctor ID (optional, uses default)'),
  }),
  outputSchema: z.object({
    date: z.string(),
    doctorName: z.string(),
    workingHours: z.object({
      start: z.string(),
      end: z.string(),
    }),
    availableSlots: z.array(z.object({
      startTime: z.string(),
      endTime: z.string(),
      duration: z.number(),
    })),
    bookedSlots: z.array(z.object({
      startTime: z.string(),
      endTime: z.string(),
      patientName: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const doctorId = context.doctorId || DEFAULT_DOCTOR_ID;
    const targetDate = new Date(context.date);

    // Doktor bilgisi
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new Error('Doktor bulunamadı');
    }

    // Çalışma saatleri (örnek: 09:00 - 17:00)
    const workingStart = new Date(targetDate);
    workingStart.setHours(9, 0, 0, 0);
    
    const workingEnd = new Date(targetDate);
    workingEnd.setHours(17, 0, 0, 0);

    // O gün için mevcut randevular
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

    // Dolu slotlar
    const bookedSlots = appointments.map(apt => ({
      startTime: apt.date.toISOString(),
      endTime: new Date(apt.date.getTime() + apt.duration * 60000).toISOString(),
      patientName: apt.patient.name,
    }));

    // Müsait slotları hesapla (30 dakikalık aralıklar)
    const availableSlots: Array<{ startTime: string; endTime: string; duration: number }> = [];
    let currentTime = new Date(workingStart);

    while (currentTime < workingEnd) {
      const slotEnd = new Date(currentTime.getTime() + 30 * 60000);

      // Bu slot dolu mu?
      const isBooked = appointments.some(apt => {
        const aptEnd = new Date(apt.date.getTime() + apt.duration * 60000);
        return (
          (currentTime >= apt.date && currentTime < aptEnd) ||
          (slotEnd > apt.date && slotEnd <= aptEnd) ||
          (currentTime <= apt.date && slotEnd >= aptEnd)
        );
      });

      if (!isBooked && slotEnd <= workingEnd) {
        availableSlots.push({
          startTime: currentTime.toISOString(),
          endTime: slotEnd.toISOString(),
          duration: 30,
        });
      }

      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }

    return {
      date: context.date,
      doctorName: doctor.name,
      workingHours: {
        start: '09:00',
        end: '17:00',
      },
      availableSlots,
      bookedSlots,
    };
  },
});