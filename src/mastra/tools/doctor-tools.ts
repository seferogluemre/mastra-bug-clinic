import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { doctorService } from '../../modules/doctor/service';

export const createDoctorTool = createTool({
  id: 'createDoctor',
  description: 'Register new doctor.',
  inputSchema: z.object({
    name: z.string().min(2),
    specialty: z.string().min(2),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    specialty: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const doctor = await doctorService.create({
        name: context.name,
        specialty: context.specialty,
        phone: context.phone,
        email: context.email,
      });
      return doctor;
    } catch (error) {
      throw new Error(`Doktor kaydı oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const getDoctorTool = createTool({
  id: 'getDoctor',
  description: 'Get doctor info by ID.',
  inputSchema: z.object({
    doctorId: z.string().uuid(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    specialty: z.string(),
    upcomingAppointments: z.array(z.object({
      date: z.string(),
      status: z.string(),
      patientName: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    try {
      const doctor = await doctorService.getById(context.doctorId);
      return doctor;
    } catch (error) {
      throw new Error(`Doktor bilgileri getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const listDoctorsTool = createTool({
  id: 'listDoctors',
  description: 'List all doctors. Use when user asks "hangi doktorlar var" or needs to see all doctors. Filter by specialty optional.',
  inputSchema: z.object({
    specialty: z.string().optional().describe('Filter by specialty options'),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string(),
    name: z.string(),
    specialty: z.string(),
  })),
  execute: async ({ context }) => {
    try {
      const doctors = await doctorService.list({
        specialty: context.specialty,
      });
      return doctors;
    } catch (error) {
      throw new Error(`Doktorlar listelenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const searchDoctorTool = createTool({
  id: 'searchDoctor',
  description: 'Search doctors. IMPORTANT: Use BOTH name AND specialty if user provides both. Example: "Mustafa özkan ortopedi" → { name: "Mustafa özkan", specialty: "Ortopedi" }. Returns empty array if no match.',
  inputSchema: z.object({
    name: z.string().optional().describe('Doctor name - partial match, case insensitive'),
    specialty: z.string().optional().describe('Medical specialty options'),
    email: z.string().optional(),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string(),
    name: z.string(),
    specialty: z.string(),
  })),
  execute: async ({ context }) => {
    try {
      const doctors = await doctorService.search(context);
      return doctors;
    } catch (error) {
      throw new Error(`Doktor araması yapılamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const updateDoctorTool = createTool({
  id: 'updateDoctor',
  description: 'Update doctor info.',
  inputSchema: z.object({
    doctorId: z.string().uuid(),
    name: z.string().min(2).optional(),
    specialty: z.string().min(2).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).strict(),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    specialty: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const { doctorId, ...updateData } = context;
      const doctor = await doctorService.update(doctorId, updateData);
      return doctor;
    } catch (error) {
      throw new Error(`Doktor bilgileri güncellenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const getDoctorStatsTool = createTool({
  id: 'getDoctorStats',
  description: 'Get doctor statistics.',
  inputSchema: z.object({
    doctorId: z.string().uuid(),
  }).strict(),
  outputSchema: z.object({
    doctor: z.object({
      name: z.string(),
      specialty: z.string(),
    }),
    stats: z.object({
      upcomingAppointments: z.number(),
      todayAppointments: z.number(),
      totalPatients: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const stats = await doctorService.getStats(context.doctorId);
      return stats;
    } catch (error) {
      throw new Error(`İstatistikler getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});

export const getDoctorScheduleTool = createTool({
  id: 'getDoctorSchedule',
  description: 'Get doctor schedule for specific date.',
  inputSchema: z.object({
    doctorId: z.string().uuid(),
    date: z.string().describe('YYYY-MM-DD format'),
  }).strict(),
  outputSchema: z.object({
    doctor: z.object({
      name: z.string(),
      specialty: z.string(),
    }),
    date: z.string(),
    appointments: z.array(z.object({
      date: z.string(),
      duration: z.number(),
      status: z.string(),
      patient: z.object({
        name: z.string(),
      }),
    })),
  }),
  execute: async ({ context }) => {
    try {
      const schedule = await doctorService.getSchedule(context.doctorId, context.date);
      return schedule;
    } catch (error) {
      throw new Error(`Program getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  },
});