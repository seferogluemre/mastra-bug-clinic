import { extractTokenFromHeader, isValidToken } from '../../utils/jwt';
import prisma from '../../core/prisma';
import type { Elysia } from 'elysia';

export async function authenticateRequest(headers: any, jwt: any, set: any) {
  const authHeader = headers.authorization || headers.Authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    set.status = 401;
    return {
      success: false,
      error: 'Token bulunamadı. Lütfen giriş yapın.',
    };
  }

  const payload = await jwt.verify(token);

  if (!payload || !isValidToken(payload)) {
    set.status = 401;
    return {
      success: false,
      error: 'Geçersiz token. Lütfen tekrar giriş yapın.',
    };
  }

  return { userId: payload.userId, email: payload.email };
}

export const authPlugin = (app: Elysia) => app.derive(async ({ headers, jwt }: any) => {
  const authHeader = headers.authorization || headers.Authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) return { user: null };

  const payload = await jwt.verify(token);
  if (!payload || !isValidToken(payload)) return { user: null };

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      rolesSlugs: true,
    }
  });

  return { user };
});