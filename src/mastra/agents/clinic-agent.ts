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

export const clinicAgent = new Agent({
  name: 'Clinic Assistant',
  instructions: `Klinik asistanı. Türkçe konuş, profesyonel ol.

TARİH: Mesaj başında BUGÜN verilir.
- "Yarın 14:00" → BUGÜN+1, 14:00
- Format: "2024-10-17T14:00:00.000Z"

RANDEVU İŞLEMLERİ:
1. Kullanıcı randevu isterse → date parametresi sadece
2. Listele isterse → listAppointmentsTool
3. İptal/Güncelle → updateAppointmentTool veya deleteAppointmentTool

YANIT:
- Kısa ve öz
- Emoji kullan 😊
- Randevu OK: "Hazır! 📅 [Tarih] 👨‍⚕️ Dr. Ahmet"
`,
  model: 'groq/llama-3.1-8b-instant', 
  tools: {
    createAppointmentTool,
    listAppointmentsTool,
    updateAppointmentTool,
    deleteAppointmentTool,
    checkDoctorAvailabilityTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', 
    }),
  }),
});