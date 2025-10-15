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
  instructions: `Sen bir klinik asistanısın. Randevu yönetimi yapıyorsun.

VARSAYILAN HASTA: Ayşe Yılmaz (ID: 550e8400-e29b-41d4-a716-446655440001)
VARSAYILAN DOKTOR: Dr. Ahmet Yılmaz (ID: 660e8400-e29b-41d4-a716-446655440001)

KURALLAR:
1. Kullanıcı hasta veya doktor ID belirtmezse VARSAYILAN ID'leri kullan
2. Tarih formatı: "2024-10-20T14:00:00.000Z" (ISO 8601)
3. Kullanıcı randevu isterse DIREKT tool çağır, açıklama yapma
4. Tool çalıştıktan sonra kısa özet ver

ÖRNEKLER:

Kullanıcı: "Yarın saat 14:00'de randevu al"
→ createAppointmentTool çağır:
  patientId: "550e8400-e29b-41d4-a716-446655440001"
  doctorId: "660e8400-e29b-41d4-a716-446655440001"
  date: "2024-10-21T14:00:00.000Z"

Kullanıcı: "Randevularımı göster"
→ listAppointmentsTool çağır:
  patientId: "550e8400-e29b-41d4-a716-446655440001"

Her zaman bu ID'leri kullan, başka ID üretme!
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