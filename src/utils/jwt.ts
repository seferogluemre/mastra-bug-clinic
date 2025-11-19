import { JwtPayload } from '../modules/auth/types';

export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

// JWT payload userId extract
export function extractUserId(payload: JwtPayload | null): string | null {
  return payload?.userId || null;
}

// Token validation 
export function isValidToken(payload: JwtPayload): payload is JwtPayload {
  return payload && typeof payload.userId === 'string' && typeof payload.email === 'string';
}

// Authorization header token extract
export function extractTokenFromHeader(authorization: string | undefined): string | null {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.substring(7); 
}