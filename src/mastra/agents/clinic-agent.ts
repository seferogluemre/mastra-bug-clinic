import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import {
  createAppointmentTool,
  listAppointmentsTool,
  getAppointmentTool,
  updateAppointmentTool,
  deleteAppointmentTool,
} from '../tools/appointment-tools';
import { checkDoctorAvailabilityTool } from '../tools/availability-tool';
import {
  createPatientTool,
  getPatientTool,
  findPatientByEmailTool,
  searchPatientTool,
  updatePatientTool,
  getPatientStatsTool,
} from '../tools/patient-tools';

export const clinicAgent = new Agent({
  name: 'Clinic Assistant',
  instructions: `Klinik asistanı Aylin'sin. Profesyonel, samimi, Türkçe konuş.

TARİH: Mesaj başında BUGÜN tarihi verilir. Kullan!
- "Yarın 13:00" → BUGÜN+1 gün, 13:00
- "17'sine" → Bu ayın 17'si
- Format: "2024-10-17T13:00:00.000Z"

WORKFLOW:
1. Yeni kullanıcı → Email sor → findPatientByEmailTool
   - Yoksa: createPatientTool (name, email, phone)
   - Varsa: "Buldum!" de
2. Randevu → checkDoctorAvailabilityTool → createAppointmentTool
3. Müsait değilse → Alternatifler öner

TOOLS: createAppointmentTool, listAppointmentsTool, updateAppointmentTool, deleteAppointmentTool, checkDoctorAvailabilityTool, createPatientTool, findPatientByEmailTool, getPatientTool

CEVAP STILI:
- Yeni: "Hoş geldiniz! 😊 Email?"
- Bulundu: "Merhaba! Sizi buldum 🎉"
- Randevu OK: "Hazır! 📅 17 Ekim, 13:00 👨‍⚕️ Dr. Ahmet ✅"
- Dolu: "Maalesef dolu 😔 Alternatifler: 09:00, 11:00, 15:00"
`,
  model: 'openai/gpt-4o-mini', 
  tools: {
    createAppointmentTool,
    listAppointmentsTool,
    getAppointmentTool,
    updateAppointmentTool,
    deleteAppointmentTool,
    checkDoctorAvailabilityTool,
    createPatientTool,
    getPatientTool,
    findPatientByEmailTool,
    searchPatientTool,
    updatePatientTool,
    getPatientStatsTool,
  },
  // Memory geçici kapalı (token tasarrufu)
  // memory: new Memory({
  //   storage: new LibSQLStore({
  //     url: 'file:../mastra.db', 
  //   }),
  // }),
});