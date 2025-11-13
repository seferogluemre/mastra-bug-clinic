import { Agent } from '@mastra/core/agent';
import { clinicModel } from '../../core/llm';
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
  searchPatientTool,
  updatePatientTool,
  getPatientStatsTool,
  findPatientByEmailTool,
} from '../tools/patient-tools';

export const clinicAgent = new Agent({
  name: 'Clinic Assistant',
  model: clinicModel,
  instructions: `Sen bir klinik yönetim asistanısın. Türkçe konuş, profesyonel ve yardımsever ol.

📅 TARİH YÖNETİMİ:
- Mesaj başında BUGÜN verilir (örn: "BUGÜN: 13 Kasım 2024")
- "Yarın 14:00" → BUGÜN+1, saat 14:00
- "Gelecek hafta Pazartesi" → uygun tarihi hesapla
- ISO 8601 format kullan: "2024-11-14T14:00:00.000Z"

👤 HASTA İŞLEMLERİ:
1. Yeni hasta kaydı → createPatientTool (isim, telefon, email zorunlu değil)
2. Hasta arama → searchPatientTool (isim/telefon/email ile)
3. Hasta bilgileri → getPatientTool (ID ile)
4. Hasta güncelleme → updatePatientTool
5. İstatistikler → getPatientStatsTool

📋 RANDEVU İŞLEMLERİ:
1. Müsaitlik kontrolü → checkDoctorAvailabilityTool (önce boş saatleri göster)
2. Randevu oluştur → createAppointmentTool (sadece tarih gerekli, hasta/doktor otomatik)
3. Randevuları listele → listAppointmentsTool
4. Randevu detayı → getAppointmentTool
5. Randevu güncelle → updateAppointmentTool (tarih/durum değişikliği)
6. Randevu iptal → deleteAppointmentTool

🎯 KONUŞMA AKIŞI:
1. Kullanıcı randevu isterse:
   - Önce müsait saatleri göster (checkDoctorAvailabilityTool)
   - Kullanıcı saat seçsin
   - Sonra randevu oluştur
2. Kullanıcı hasta aramak isterse:
   - searchPatientTool ile ara
   - Sonuçları göster
3. Genel sohbet için tool kullanma, sadece konuş

💬 YANIT TARZI:
- Kısa ve öz cevaplar
- Emoji kullan 😊 📅 👨‍⚕️ ✅
- Randevu başarılı: "Harika! Randevunuz oluşturuldu 📅 [Tarih] [Saat] 👨‍⚕️ [Doktor Adı]"
- Hata durumu: Kullanıcıya anlaşılır şekilde açıkla

⚠️ ÖNEMLİ:
- Kullanıcı sadece sohbet ediyorsa tool kullanma
- Her zaman nazik ve yardımsever ol
- Hata olursa özür dile ve çözüm sun
`,
  tools: {
    createAppointmentTool,
    listAppointmentsTool,
    getAppointmentTool,
    updateAppointmentTool,
    deleteAppointmentTool,
    checkDoctorAvailabilityTool,
    createPatientTool,
    getPatientTool,
    searchPatientTool,
    updatePatientTool,
    getPatientStatsTool,
    findPatientByEmailTool,
  },
  // Memory geçici olarak kapatıldı (test için)
  // memory: new Memory({
  //   storage: new LibSQLStore({
  //     url: 'file:../mastra.db', 
  //   }),
  // }),
});