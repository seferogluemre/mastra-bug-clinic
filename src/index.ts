import { Elysia } from 'elysia';
import { mastra } from './mastra';
import { z } from 'zod';
import { chatSchema } from './schemas';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

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
    try {
      const validatedBody = chatSchema.parse(body);
      const { message, threadId, userId } = validatedBody;

      const agent = mastra.getAgent('clinicAgent');

      if (!agent) {
        set.status = 500;
        return {
          success: false,
          error: 'Clinic agent bulunamadı',
        };
      }

      // Bugünün tarihini context olarak ekle
      const today = new Date();
      const todayStr = today.toLocaleDateString('tr-TR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const todayISO = today.toISOString().split('T')[0]; // YYYY-MM-DD

      console.log('📅 Context:', { todayStr, todayISO, message });

      const response = await agent.generate(
        [
          {
            role: 'user',
            content: `BUGÜN: ${todayStr} (${todayISO})

Kullanıcı Mesajı: ${message}`,
          },
        ],
        {
          resourceId: userId || 'default-user',
          threadId: threadId || 'default-thread',
          toolChoice: 'auto',
        }
      );

      return {
        success: true,
        data: {
          message: response.text,
          threadId: threadId || 'default-thread',
          userId: userId || 'default-user',
        },
      };
    } catch (error) {
      console.error('Chat error:', error);

      // Rate limit hatası kontrolü
      if (error instanceof Error && error.message.includes('Rate limit')) {
        set.status = 429;
        return {
          success: false,
          error: 'API limiti aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.',
          retryAfter: 130, // saniye
        };
      }

      if (error instanceof z.ZodError) {
        set.status = 400;
        return {
          success: false,
          error: 'Geçersiz istek',
          details: error.errors,
        };
      }

      set.status = 400;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
      };
    }
  })
  .listen(3000);

console.log(`Elysia Server running at http://localhost:${app.server?.port}`);