# 🏥 Klinik Yönetim Sistemi - AI Asistan

Mastra, Elysia ve PostgreSQL ile geliştirilmiş klinik yönetim sistemi AI asistanı.

## 🚀 Özellikler

- ✅ **AI-Powered Chat Interface**: Tek endpoint üzerinden tüm işlemler
- ✅ **Randevu Yönetimi**: Oluşturma, listeleme, güncelleme, iptal
- ✅ **Modüler Mimari**: Service, DTO, Formatter katmanları
- ✅ **PostgreSQL Database**: Prisma ORM ile
- ✅ **Type-Safe**: Full TypeScript desteği

## 📁 Proje Yapısı

```
src/
├── appointment/              # Randevu modülü
│   ├── appointment.service.ts
│   ├── appointment.dto.ts
│   └── appointment.formatter.ts
├── mastra/                   # AI katmanı
│   ├── tools/                # AI tool'ları
│   ├── agents/               # AI agent'ları
│   └── index.ts
├── core/                     # Core utilities
│   └── prisma.ts
└── index.ts                  # Elysia API
```

## 🛠️ Kurulum

### 1. Dependencies Yükle

```bash
npm install
# veya
bun install
```

### 2. Environment Variables

`.env` dosyası oluştur:

```bash
cp .env.example .env
```

Gerekli değişkenleri doldur:
- `DATABASE_URL`: PostgreSQL connection string
- `GROQ_API_KEY`: Groq API key (AI için)

### 3. Database Kurulumu

```bash
# Prisma generate
npm run db:generate

# Database migration
npm run db:migrate

# Veya sadece push (development)
npm run db:push
```

### 4. Server Başlat

```bash
npm run dev
```

Server `http://localhost:3000` adresinde çalışacak.

## 📡 API Kullanımı

### Chat Endpoint

```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Yarın saat 14:00'de randevu almak istiyorum",
  "threadId": "user-conversation-123",  // Optional
  "userId": "user-456"                   // Optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Elbette! Randevu oluşturmak için hasta ID'nize ihtiyacım var...",
    "threadId": "user-conversation-123",
    "userId": "user-456"
  }
}
```

### Örnek Konuşma Akışı

```bash
# 1. Randevu talebi
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Yarın saat 14:00 randevu almak istiyorum"}'

# 2. Hasta bilgisi ver
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hasta ID: 550e8400-e29b-41d4-a716-446655440000",
    "threadId": "conv-123"
  }'

# 3. Randevuları listele
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Randevularımı göster"}'
```

## 🗄️ Database Schema

### Tables

- **patients**: Hasta bilgileri
- **doctors**: Doktor bilgileri  
- **appointments**: Randevu kayıtları

### Appointment Status

- `pending`: Beklemede
- `confirmed`: Onaylandı
- `cancelled`: İptal edildi
- `completed`: Tamamlandı

## 🧪 Development

```bash
# Database studio (GUI)
npm run db:studio

# Prisma generate
npm run db:generate

# Migration oluştur
npm run db:migrate

# Mastra dev mode
npm run dev:mastra
```

## 🎯 Yapılacaklar

- [ ] Patient modülü ekle
- [ ] Doctor modülü ekle
- [ ] Authentication ekle
- [ ] Rate limiting
- [ ] Tests yaz

## 📝 Notlar

- **ThreadId**: Her konuşma oturumu için unique ID
- **ResourceId**: Kullanıcı bazlı data için (userId)
- **Memory**: Agent konuşmaları hatırlar (LibSQL)
- **Tools**: AI'ın kullanabileceği fonksiyonlar

## 🤝 Katkıda Bulunma

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC

