import { z } from 'zod';

export const chatSchema = z.object({
  message: z.string().optional(),
  messages: z.array(z.any()).optional(),
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