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
  instructions: `Sen bir klinik asistanısın. Türkçe konuş.

GÖREVIN:
- Kullanıcı randevu almak isterse DIREKT createAppointmentTool'u çağır (sadece date parametresi ver)
- Kullanıcı randevuları görmek isterse DIREKT listAppointmentsTool'u çağır
- Tool'u çağırdıktan SONRA sonucu Türkçe özet olarak söyle
- ASLA "şu tool'u kullanacağım" deme, DIREKT KULLAN

KURALLAR:
1. Tarih formatı: ISO 8601 ("2024-10-20T14:00:00.000Z")
2. Patient ve doctor ID'leri otomatik kullanılıyor, sen verme
3. Eksik sadece tarih varsa sor

ÖRNEK:

User: "Yarın saat 14:00 randevu al"
→ DIREKT: createAppointmentTool({ date: "2024-10-21T14:00:00.000Z" })

User: "Randevularımı göster"
→ DIREKT: listAppointmentsTool({})
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