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

      const response = await agent.generate(
        [
          {
            role: 'user',
            content: message,
          },
        ],
        {
          resourceId: userId || 'default-user',
          threadId: threadId || 'default-thread',
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
      set.status = 400;

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Geçersiz istek',
          details: error.errors,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
      };
    }
  })
  .listen(3000);

console.log(`Elysia Server running at http://localhost:${app.server?.port}`);