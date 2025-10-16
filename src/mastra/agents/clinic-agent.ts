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
  instructions: `Klinik asistanısın. Türkçe yanıt ver.

TOOLS:
- createAppointmentTool: Randevu oluştur (sadece date)
- listAppointmentsTool: Randevuları listele
- updateAppointmentTool: Randevu güncelle
- deleteAppointmentTool: Randevu iptal et
- checkDoctorAvailabilityTool: Müsait saatleri göster (sadece date, YYYY-MM-DD formatı)

KURALLAR:
1. Randevu talebi → ÖNCE checkDoctorAvailabilityTool ile müsait saatleri kontrol et, SONRA createAppointmentTool çağır
2. Eğer randevu oluşturma hatası alırsan, checkDoctorAvailabilityTool ile müsait saatleri göster
3. Randevu listesi → listAppointmentsTool
4. Tool sonrası kısa Türkçe özet ver
5. Tarih ISO formatı: "2024-10-20T14:00:00.000Z" (create için), "2024-10-20" (availability için)

Örnek:
User: "Yarın 14:00 randevu"
→ checkDoctorAvailabilityTool(date: "2024-10-21") 
→ Eğer müsaitse: createAppointmentTool(date: "2024-10-21T14:00:00.000Z")
→ Eğer doluysa: Müsait saatleri listele

User: "Randevularım?"
→ listAppointmentsTool()
`,
  model: 'groq/llama-3.3-70b-versatile',
  tools: {
    createAppointmentTool,
    listAppointmentsTool,
    getAppointmentTool,
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