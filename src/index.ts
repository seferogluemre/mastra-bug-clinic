import { Elysia } from 'elysia';
import { mastra } from './mastra';
import { z } from 'zod';
import { chatSchema } from './schemas';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { generateText } from 'ai';
import type { CoreMessage } from 'ai';
import { aiCreateAppointmentTool, aiListAppointmentsTool, aiUpdateAppointmentTool } from './mastra/tools/appointment-tools';

const conversationHistory = new Map<string, CoreMessage[]>();

const app = new Elysia()
.use(swagger())
.use(cors())
  .get('/', () => ({
    message: 'Klinik Yönetim Sistemi API',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /health',
    },
  }))
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .post('/api/chat', async ({ body, set }) => {
    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 1000;

    try {
      const validatedBody = chatSchema.parse(body);
      const { message, threadId, userId } = validatedBody;
      
      const uniqueThreadId = threadId || `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const uniqueUserId = userId || 'default-user';
      
      const agent = mastra.getAgent('clinicAgent');
      if (!agent) {
        set.status = 500;
        return {
          success: false,
          error: 'Clinic agent bulunamadı',
        };
      }

      const today = new Date();
      const todayStr = today.toLocaleDateString('tr-TR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
        const todayISO = today.toISOString().split('T')[0];

      console.log('📅 Context:', { todayStr, todayISO, message });

      let lastError: Error | null = null;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          console.log('🚀 Direkt AI SDK kullanılıyor...', { attempt: attempt + 1 });
          
          let history = conversationHistory.get(uniqueThreadId) || [];
          
          const systemMessage: CoreMessage = {
            role: 'system',
            content: `Sen bir klinik yönetim asistanısın. Türkçe konuş, profesyonel ve yardımsever ol.
Bugün: ${todayStr} (${todayISO})

🛠️ KULLANILABILIR ARAÇLAR:
1. createAppointment - Randevu oluştur (tarih ISO format: YYYY-MM-DDTHH:mm:ss.000Z, notes opsiyonel)
2. listAppointments - Randevuları listele
3. updateAppointment - Randevu güncelle (appointmentId, date, status, notes, duration)

📋 RANDEVU OLUŞTURMA:
- Kullanıcı "14 kasım saat 12:00" derse → "2025-11-14T12:00:00.000Z" formatına çevir
- Kullanıcının şikayetini/notunu MUTLAKA notes parametresine ekle
- Örnek: "boğaz ağrısı için randevu" → notes: "boğaz ağrısı"
- Randevu oluşturduktan sonra başarılı mesajı göster

💬 YANIT TARZI:
- Kısa ve öz cevaplar ver
- Emoji kullan 😊 📅 👨‍⚕️ ✅
- Her zaman nazik ve yardımsever ol
- Kullanıcının önceki mesajlarını hatırla ve context'i koru`
          };
          
          const userMessage: CoreMessage = {
            role: 'user',
            content: message,
          };
          
          const allMessages: CoreMessage[] = [systemMessage, ...history, userMessage];
          
          const result = await generateText({
            model: agent.model as any,
            messages: allMessages,
            tools: {
              createAppointment: aiCreateAppointmentTool,
              listAppointments: aiListAppointmentsTool,
              updateAppointment: aiUpdateAppointmentTool,
            },
            temperature: 0.7,
            maxTokens: 1000,
          });
          
          console.log('✅ AI SDK yanıt aldı');
          console.log('📝 Response text:', result.text || 'BOŞ');
          console.log('📏 Text uzunluğu:', result.text.length);
          console.log('🔢 Tokens:', result.usage);
          
          // Tool calls varsa logla
          if (result.toolCalls && result.toolCalls.length > 0) {
            console.log('🛠️  Tool calls:', JSON.stringify(result.toolCalls, null, 2));
          }
          if (result.toolResults && result.toolResults.length > 0) {
            console.log('📊 Tool results:', JSON.stringify(result.toolResults, null, 2));
          }
          
          const assistantMessage: CoreMessage = {
            role: 'assistant',
            content: result.text,
          };
          
          history.push(userMessage, assistantMessage);
          conversationHistory.set(uniqueThreadId, history);
          
          console.log('💾 History güncellendi:', { threadId: uniqueThreadId, messageCount: history.length });

          return {
            success: true,
            data: {
              message: result.text || 'Agent yanıt vermedi. Lütfen tekrar deneyin.',
              threadId: uniqueThreadId,
              userId: uniqueUserId,
            },
          };
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');
          
          const isRateLimit = lastError.message.toLowerCase().includes('rate limit') || 
                             lastError.message.toLowerCase().includes('429') ||
                             lastError.message.toLowerCase().includes('too many requests');

          if (isRateLimit && attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_DELAY * Math.pow(2, attempt);
            console.log(`⏳ Rate limit! Deneme ${attempt + 1}/${MAX_RETRIES}. ${delay}ms bekleniyor...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          throw lastError;
        }
      }

      throw lastError || new Error('Maksimum deneme sayısı aşıldı');
      
    } catch (error) {
      console.error('❌ Chat error:', error);

      if (error instanceof Error && 
          (error.message.toLowerCase().includes('rate limit') || 
           error.message.toLowerCase().includes('429') ||
           error.message.toLowerCase().includes('too many requests'))) {
        set.status = 429;
        return {
          success: false,
          error: '⏱️ API limiti aşıldı. Lütfen 2 dakika sonra tekrar deneyin.',
          retryAfter: 120,
          details: 'Rate limit aşıldı. GPT-4o kullanıyorsanız, limitler daha yüksektir.',
        };
      }

      if (error instanceof z.ZodError) {
        set.status = 400;
        return {
          success: false,
          error: 'Geçersiz istek formatı',
          details: error.errors,
        };
      }

      if (error instanceof Error && 
          (error.message.includes('API key') || 
           error.message.includes('Unauthorized') ||
           error.message.includes('401'))) {
        set.status = 401;
        return {
          success: false,
          error: '🔑 API key hatası. .env dosyasında OPENAI_API_KEY kontrol edin.',
        };
      }

      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
      };
    }
  })
  .listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });