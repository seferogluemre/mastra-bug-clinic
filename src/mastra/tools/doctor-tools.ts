import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { doctorService } from '../../modules/doctor/service';

export const createDoctorTool = createTool({
  id: 'createDoctor',
  description: 'Register a new doctor in the system. Use when user wants to add a new doctor.',
  inputSchema: z.object({
    name: z.string().min(2).describe('Doctor full name (minimum 2 characters)'),
    specialty: z.string().min(2).describe('Medical specialty (e.g., Kardiyoloji, Dermatoloji, Ortopedi)'),
    phone: z.string().optional().describe('Doctor phone number (optional)'),
    email: z.string().email().optional().describe('Doctor email address (optional, must be valid email)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Unique doctor ID (UUID)'),
    name: z.string().describe('Doctor full name'),
    specialty: z.string().describe('Medical specialty'),
    phone: z.string().nullable().describe('Doctor phone number'),
    email: z.string().nullable().describe('Doctor email address'),
    createdAt: z.string().describe('Registration timestamp'),
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
1
export const getDoctorTool = createTool({
  id: 'getDoctor',
  description: 'Get doctor information by ID. Returns doctor details with upcoming appointments.',
  inputSchema: z.object({
    doctorId: z.string().uuid().describe('Doctor ID (UUID format)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Unique doctor ID (UUID)'),
    name: z.string().describe('Doctor full name'),
    specialty: z.string().describe('Medical specialty'),
    phone: z.string().nullable().describe('Doctor phone number'),
    email: z.string().nullable().describe('Doctor email address'),
    createdAt: z.string().describe('Registration timestamp'),
    updatedAt: z.string().describe('Last update timestamp'),
    upcomingAppointments: z.array(z.object({
      id: z.string().describe('Appointment ID'),
      date: z.string().describe('Appointment date and time'),
      status: z.string().describe('Appointment status'),
      patientName: z.string().describe('Patient full name'),
      notes: z.string().nullable().describe('Appointment notes'),
    }).describe('Appointment record')).describe('List of upcoming appointments'),
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
  description: 'List all doctors. Optionally filter by specialty (e.g., Kardiyoloji, Dermatoloji).',
  inputSchema: z.object({
    specialty: z.string().optional().describe('Filter doctors by specialty (optional, e.g., Kardiyoloji, Dermatoloji, Ortopedi)'),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string().describe('Unique doctor ID (UUID)'),
    name: z.string().describe('Doctor full name'),
    specialty: z.string().describe('Medical specialty'),
    phone: z.string().nullable().describe('Doctor phone number'),
    email: z.string().nullable().describe('Doctor email address'),
  }).describe('Doctor information')).describe('List of doctors'),
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
  description: 'Search doctors by name, specialty, or email. Provide at least one search parameter.',
  inputSchema: z.object({
    name: z.string().optional().describe('Search by doctor name (partial match supported)'),
    specialty: z.string().optional().describe('Search by medical specialty'),
    email: z.string().optional().describe('Search by doctor email address'),
  }).strict(),
  outputSchema: z.array(z.object({
    id: z.string().describe('Unique doctor ID (UUID)'),
    name: z.string().describe('Doctor full name'),
    specialty: z.string().describe('Medical specialty'),
    phone: z.string().nullable().describe('Doctor phone number'),
    email: z.string().nullable().describe('Doctor email address'),
  }).describe('Doctor search result')).describe('List of matching doctors'),
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
  description: 'Update doctor information. Provide only the fields you want to change.',
  inputSchema: z.object({
    doctorId: z.string().uuid().describe('Doctor ID to update (UUID format)'),
    name: z.string().min(2).optional().describe('New doctor name (minimum 2 characters, optional)'),
    specialty: z.string().min(2).optional().describe('New medical specialty (optional)'),
    phone: z.string().optional().describe('New phone number (optional)'),
    email: z.string().email().optional().describe('New email address (optional, must be valid email)'),
  }).strict(),
  outputSchema: z.object({
    id: z.string().describe('Unique doctor ID (UUID)'),
    name: z.string().describe('Updated doctor full name'),
    specialty: z.string().describe('Updated medical specialty'),
    phone: z.string().nullable().describe('Updated doctor phone number'),
    email: z.string().nullable().describe('Updated doctor email address'),
    updatedAt: z.string().describe('Update timestamp'),
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
  description: 'Get doctor statistics including upcoming appointments, today\'s appointments, and total patients.',
  inputSchema: z.object({
    doctorId: z.string().uuid().describe('Doctor ID to get statistics for (UUID format)'),
  }).strict(),
  outputSchema: z.object({
    doctor: z.object({
      id: z.string().describe('Doctor UUID'),
      name: z.string().describe('Doctor full name'),
      specialty: z.string().describe('Medical specialty'),
    }).describe('Doctor basic information'),
    stats: z.object({
      upcomingAppointments: z.number().describe('Number of upcoming appointments'),
      todayAppointments: z.number().describe('Number of today\'s appointments'),
      totalPatients: z.number().describe('Total number of unique patients'),
    }).describe('Doctor statistics'),
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
  description: 'Get doctor\'s schedule for a specific date. Shows all appointments for that day.',
  inputSchema: z.object({
    doctorId: z.string().uuid().describe('Doctor ID (UUID format)'),
    date: z.string().describe('Date to check schedule in YYYY-MM-DD format (e.g., 2024-10-20)'),
  }).strict(),
  outputSchema: z.object({
    doctor: z.object({
      id: z.string().describe('Doctor UUID'),
      name: z.string().describe('Doctor full name'),
      specialty: z.string().describe('Medical specialty'),
    }).describe('Doctor information'),
    date: z.string().describe('Schedule date (YYYY-MM-DD)'),
    appointments: z.array(z.object({
      id: z.string().describe('Appointment ID'),
      date: z.string().describe('Appointment date and time (ISO format)'),
      duration: z.number().describe('Duration in minutes'),
      status: z.string().describe('Appointment status'),
      patient: z.object({
        id: z.string().describe('Patient ID'),
        name: z.string().describe('Patient name'),
        phone: z.string().nullable().describe('Patient phone'),
      }).describe('Patient information'),
      notes: z.string().nullable().describe('Appointment notes'),
    }).describe('Appointment')).describe('List of appointments'),
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