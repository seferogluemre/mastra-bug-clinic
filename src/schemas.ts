import { z } from 'zod';

export const chatSchema = z.object({
  message: z.string().min(1, 'Mesaj boş olamaz'),
  threadId: z.string().optional(),
  userId: z.string().optional(),
});