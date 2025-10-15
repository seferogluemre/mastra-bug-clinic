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

export const clinicAgent = new Agent({
  name: 'Clinic Assistant',
  instructions: `Klinik asistanısın. Türkçe yanıt ver.

TOOLS:
- createAppointmentTool: Sadece date parametresi al. Patient/Doctor ID gerekli DEĞİL.
- listAppointmentsTool: Parametre gerektirmez.

KURALLAR:
1. Randevu talebi → DIREKT createAppointmentTool çağır (sadece date ver)
2. Randevu listesi talebi → DIREKT listAppointmentsTool çağır
3. Tool çalıştıktan sonra kısa özet ver
4. ASLA ID sorma, ASLA "fonksiyon kullanacağım" deme
5. Tarih ISO formatı: "2024-10-20T14:00:00.000Z"

Örnek:
"Yarın 14:00 randevu" → createAppointmentTool(date: "2024-10-21T14:00:00.000Z")
"Randevularım?" → listAppointmentsTool()
`,
  model: 'groq/llama-3.3-70b-versatile',
  tools: {
    createAppointmentTool,
    listAppointmentsTool,
    getAppointmentTool,
    updateAppointmentTool,
    deleteAppointmentTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', 
    }),
  }),
});