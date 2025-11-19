import { z } from 'zod';

export const chatSchema = z.object({
  message: z.string().min(1, 'Mesaj boş olamaz'),
  threadId: z.string().optional(),
  userId: z.string().optional(),
});

export const newThreadSchema = z.object({
  userId: z.string().optional(),
  title: z.string().max(100).optional(),
});

export const threadListSchema = z.object({
  userId: z.string().optional(),
});