import { extractTokenFromHeader, isValidToken } from '../../utils/jwt';

export async function authenticateRequest(headers: any, jwt: any, set: any) {
  console.log('🔍 Headers:', headers);
  console.log('🔍 Authorization:', headers.authorization || headers.Authorization);
  
  const authHeader = headers.authorization || headers.Authorization;
  const token = extractTokenFromHeader(authHeader);
  
  console.log('🔍 Extracted token:', token?.substring(0, 20) + '...');
  
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