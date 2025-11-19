import { Elysia } from 'elysia';
import { mastra } from './mastra';
import { z } from 'zod';
import { chatSchema, newThreadSchema, threadListSchema } from './schemas';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { success, ZodError } from 'zod/v4';
import { jwt } from '@elysiajs/jwt';
import { authService, authenticateRequest } from './modules/auth';
import { JWT_SECRET } from './utils/jwt';

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: JWT_SECRET,
  }))
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
  .post('/api/chat', async ({ body, set, headers, jwt }) => {
    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 1000;

    try {
      // JWT Authentication
      const auth = await authenticateRequest(headers, jwt, set);
      if ('error' in auth) return auth; // Token hatası varsa döndür

      const validatedBody = chatSchema.parse(body);
      const { message, threadId } = validatedBody;

      // userId artık token'dan geliyor (güvenli)
      const uniqueUserId = auth.userId;

      // ThreadId zorunlu - yoksa hata döndür
      if (!threadId) {
        set.status = 400;
        return {
          success: false,
          error: 'threadId gerekli. Önce POST /api/thread/new ile yeni konuşma başlatın.',
        };
      }

      const uniqueThreadId = threadId;

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
      console.log('🔑 IDs:', { uniqueThreadId, uniqueUserId });

      let lastError: Error | null = null;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          console.log('🚀 Mastra Agent kullanılıyor...', { attempt: attempt + 1 });

          const contextMessage = `BUGÜN: ${todayStr} (${todayISO})\n\nKullanıcı mesajı: ${message}`;

          const result = await agent.generate(contextMessage, {
            threadId: uniqueThreadId,
            resourceId: uniqueUserId,
            maxSteps: 5,
          });

          console.log('✅ Agent yanıt aldı');
          console.log('📝 Response text:', result.text || 'BOŞ');
          console.log('📏 Text uzunluğu:', result.text?.length || 0);

          // Tool call syntax'ını temizle (örn: <function=createAppointmentTool>{...}</function>)
          let cleanMessage = result.text || 'Agent yanıt vermedi. Lütfen tekrar deneyin.';
          cleanMessage = cleanMessage.replace(/<function=[^>]*>.*?<\/function>/gs, '').trim();

          return {
            success: true,
            data: {
              message: cleanMessage,
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
  .post("/api/thread-list", async ({ body, set, headers, jwt }) => {
    try {
      // JWT Authentication
      const auth = await authenticateRequest(headers, jwt, set);
      if ('error' in auth) return auth; // Token hatası varsa döndür

      const validatedBody = newThreadSchema.parse(body)
      const { title } = validatedBody;

      // userId token'dan geliyor (güvenli)
      const uniqueUserId = auth.userId;
      const threadId = `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      return {
        success: true,
        data: {
          threadId,
          userId: uniqueUserId,
          title: title || "Yeni Sohbet",
          createdAt: new Date().toISOString()
        }
      }


    } catch (error) {
      console.error("New Thread Error", (error as Error).message)

      if (error instanceof ZodError) {
        set.status = 400;
        return {
          success: false,
          error: "Geçersiz istek formatı",
          details: (error as Error).message
        }
      }
      set.status = 500
    }
  })
  .get('/api/thread-list', async ({ query, set, headers, jwt }) => {
    try {
      const auth = await authenticateRequest(headers, jwt, set);
      if ('error' in auth) return auth;

      const uniqueUserId = auth.userId;

      return {
        success: true,
        data: {
          userId: uniqueUserId,
          threads: [],
          message: 'Thread list API hazır - Mastra storage entegrasyonu sonraki adımda',
        },
      };
    } catch (error) {
      console.error('❌ Thread list error:', error);

      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Thread listesi getirilemedi',
      };
    }
  })
  .post('/api/auth/register', async ({ body, set }) => {
    try {
      const { email, password, firstName, lastName } = body as any;

      if (!email || !password || !firstName || !lastName) {
        set.status = 400;
        return {
          success: false,
          error: 'Email, şifre, ad ve soyad zorunludur',
        };
      }

      const user = await authService.register({ email, password, firstName, lastName });

      return {
        success: true,
        data: {
          user,
          message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.',
        },
      };
    } catch (error) {
      console.error('❌ Register error:', error);
      set.status = 400;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Kayıt başarısız',
      };
    }
  })
  .post('/api/auth/login', async ({ body, jwt, set }) => {
    try {
      const { email, password } = body as any;

      if (!email || !password) {
        set.status = 400;
        return {
          success: false,
          error: 'Email ve şifre zorunludur',
        };
      }

      const user = await authService.login(email, password);

      // JWT token oluştur
      const token = await jwt.sign({
        userId: user.id,
        email: user.email,
      });

      return {
        success: true,
        data: {
          user,
          token,
          message: 'Giriş başarılı!',
        },
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      set.status = 401;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Giriş başarısız',
      };
    }
  })
  .listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });