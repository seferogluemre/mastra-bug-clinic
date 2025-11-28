import { Elysia } from 'elysia';
import { mastra } from './providers/mastra/instance';
import { newThreadSchema } from './schemas';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { ZodError } from 'zod/v4';
import { jwt } from '@elysiajs/jwt';
import { authService, authenticateRequest, authPlugin } from './modules/auth';
import { rolesController } from './modules/auth/roles';
import { JWT_SECRET } from './utils/jwt';
import prisma from './core/prisma';

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: JWT_SECRET,
  }))
  .use(authPlugin)
  .use(rolesController)
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
  .delete("/api/thread-list/:id", async ({ body, set, headers, jwt, params }) => {
    try {
      const auth = authenticateRequest(headers, jwt, set);
      if ('error' in auth) return auth;

      const uniqueUserId = (await auth).userId;
      const threadId = params.id;

      if (!mastra.storage) {
        throw new Error("Storage not initialized")
      }

      const userThreads = await mastra.storage.getThreadsByResourceId({ resourceId: uniqueUserId as string })

      const threadExists = userThreads?.find((thread) => thread.id == threadId)?.id;

      if (!threadExists) {
        set.status = 404;
        return {
          success: false,
          error: "Thread not found or you not have authority"
        }
      }

      await mastra.storage.deleteThread({ threadId: threadExists })

      return {
        success: true,
        message: "Thread Başarıyla silindi"
      }
    } catch (error) {
      throw new Error(`Thread Silerken hata oluştu! ${(error as Error).message}`)
    }
  })
  .post('/api/chat', async ({ body, set, headers, jwt }) => {
    try {
      const auth = await authenticateRequest(headers, jwt, set);
      if ('error' in auth) return auth;

      // Handle both single message and messages array (from useChat)
      const { messages, threadId, message: singleMessage } = body as any;

      let userMessage = singleMessage;
      if (!userMessage && Array.isArray(messages)) {
        const lastUserMessage = messages.reverse().find((m: any) => m.role === 'user');
        if (lastUserMessage) {
          userMessage = lastUserMessage.content;
        }
      }

      const uniqueUserId = auth.userId;

      if (!threadId) {
        set.status = 400;
        return { success: false, error: 'threadId gerekli' };
      }

      if (!userMessage) {
        set.status = 400;
        return { success: false, error: 'Mesaj bulunamadı' };
      }

      const user = await prisma.user.findUnique({
        where: { id: uniqueUserId },
        select: { firstName: true, lastName: true, email: true },
      });

      let patientInfo = '';
      if (user?.email) {
        const patient = await prisma.patient.findUnique({
          where: { email: user.email },
          select: { id: true, name: true }
        });
        if (patient) {
          patientInfo = `CURRENT_PATIENT_ID: ${patient.id}\nCURRENT_PATIENT_NAME: ${patient.name}`;
        }
      }

      const uniqueThreadId = threadId;
      const agent = mastra.getAgent('clinicAgent');
      if (!agent) {
        set.status = 500;
        return { success: false, error: 'Clinic agent bulunamadı' };
      }

      const today = new Date();
      const todayStr = today.toLocaleDateString('tr-TR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const todayISO = today.toISOString().split('T')[0];

      console.log('📅 Context:', { todayStr, todayISO, message: userMessage, user: user?.firstName });

      const userInfo = user ? `KULLANICI: ${user.firstName} ${user.lastName}` : '';
      const contextMessage = `${userInfo ? userInfo + '\n' : ''}${patientInfo ? patientInfo + '\n' : ''}BUGÜN: ${todayStr} (${todayISO})\n\nKullanıcı mesajı: ${userMessage}`;

      // Manually save user message to ensure persistence
      if (mastra.storage) {
        await mastra.storage.saveMessages({
          messages: [{
            id: crypto.randomUUID(),
            threadId: uniqueThreadId,
            resourceId: uniqueUserId,
            role: 'user',
            content: userMessage,
            createdAt: new Date(),
            type: 'text',
          }]
        });
      }

      // Use stream instead of generate
      const streamResult = await agent.stream(contextMessage, {
        threadId: uniqueThreadId,
        resourceId: uniqueUserId,
      });

      // Return the stream directly
      return streamResult.textStream;
    } catch (error) {
      console.error('❌ Chat error:', error);
      set.status = 500;
      return { success: false, error: error instanceof Error ? error.message : 'Hata' };
    }
  })
  .post("/api/thread-list", async ({ body, set, headers, jwt }) => {
    try {
      const auth = await authenticateRequest(headers, jwt, set);
      if ('error' in auth) return auth;

      const validatedBody = newThreadSchema.parse(body)
      const { title } = validatedBody;

      const uniqueUserId = auth.userId;

      if (!mastra.storage) {
        throw new Error('Storage not initialized');
      }

      const threadId = `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newThread = {
        id: threadId,
        resourceId: uniqueUserId,
        title: title || "Yeni Sohbet",
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const savedThread = await mastra.storage.saveThread({ thread: newThread });

      return {
        success: true,
        data: {
          threadId: savedThread.id,
          userId: uniqueUserId,
          title: savedThread.title,
          createdAt: savedThread.createdAt
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
      return {
        success: false,
        error: "Thread oluşturulamadı"
      }
    }
  })
  .get('/api/thread-list', async ({ set, headers, jwt }) => {
    try {
      const auth = await authenticateRequest(headers, jwt, set);
      if ('error' in auth) return auth;

      const uniqueUserId = auth.userId;

      try {
        if (!mastra.storage) {
          throw new Error('Storage not initialized');
        }
        const userThreads = await mastra.storage.getThreadsByResourceId({
          resourceId: uniqueUserId,
        });

        console.log('🔍 User threads from storage:', userThreads?.length || 0);

        const threadsWithMessages = await Promise.all(
          (userThreads || []).map(async (thread: any) => {
            try {
              const messages = await mastra.storage?.getMessages({
                threadId: thread.id,
              });

              const sortedMessages = Array.isArray(messages)
                ? messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                : [];

              return {
                threadId: thread.id,
                title: thread.title,
                resourceId: thread.resourceId,
                createdAt: thread.createdAt,
                updatedAt: thread.updatedAt,
                messages: sortedMessages.map((m: any) => {
                  let content = m.content;
                  // Clean up the system context prefix if present
                  if (m.role === 'user' && typeof content === 'string') {
                    const prefixMatch = content.match(/BUGÜN:.*?\n\nKullanıcı mesajı:\s*/s);
                    if (prefixMatch) {
                      content = content.replace(prefixMatch[0], '');
                    }
                  }

                  return {
                    id: m.id,
                    role: m.role,
                    content: content,
                    createdAt: m.createdAt
                  };
                })
              };
            } catch (err) {
              console.error(`Failed to fetch messages for thread ${thread.id}`, err);
              return {
                threadId: thread.id,
                title: thread.title,
                resourceId: thread.resourceId,
                createdAt: thread.createdAt,
                updatedAt: thread.updatedAt,
                messages: []
              };
            }
          })
        );

        return {
          success: true,
          data: {
            userId: uniqueUserId,
            threads: threadsWithMessages,
          },
        };
      } catch (storageError) {
        console.error('❌ Storage error:', storageError);
        return {
          success: true,
          data: {
            userId: uniqueUserId,
            threads: [],
            message: 'Storage API henüz hazır değil',
          },
        };
      }
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
  .listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });