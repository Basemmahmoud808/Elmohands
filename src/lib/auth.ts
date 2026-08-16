import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabase/admin';

const JWT_SECRET_RAW = process.env.JWT_SECRET || 'almohands-platform-secure-jwt-secret-key-2026-math-reda-kheyrat';
const REFRESH_SECRET_RAW = process.env.REFRESH_TOKEN_SECRET || 'almohands-platform-secure-refresh-token-secret-2026';

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);
const REFRESH_SECRET = new TextEncoder().encode(REFRESH_SECRET_RAW);

export interface TokenPayload {
  userId: string;
  phone: string;
  role: 'ADMIN' | 'STUDENT';
  fullName: string;
}

/**
 * Hash plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify plain text password against hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create JWT Access Token (7 days validity)
 */
export async function createAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(JWT_SECRET);
}

/**
 * Create JWT Refresh Token (30 days validity)
 */
export async function createRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(REFRESH_SECRET);
}

/**
 * Verify JWT Access Token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Verify JWT Refresh Token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as { userId: string };
  } catch (err) {
    return null;
  }
}

/**
 * Set HttpOnly Auth & Refresh cookies
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();

  cookieStore.set('auth_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60, // 30 minutes
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Clear HttpOnly Auth cookies
 */
export async function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('refresh_token');
}

/**
 * Read auth_token from cookies
 */
export async function getAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get('auth_token')?.value || null;
}

/**
 * Read refresh_token from cookies
 */
export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get('refresh_token')?.value || null;
}

/**
 * Get current authenticated user payload from cookies
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getAuthTokenFromCookies();
  if (!token) return null;
  return verifyAccessToken(token);
}

/**
 * Store session record in DB (public.sessions)
 */
export async function createSessionRecord(
  userId: string,
  refreshToken: string,
  userAgent?: string,
  ipAddress?: string
) {
  try {
    const refreshTokenHash = await hashPassword(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: userId,
        refresh_token_hash: refreshTokenHash,
        user_agent: userAgent || 'Unknown',
        ip_address: ipAddress || '127.0.0.1',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Database session record creation error:', error.message);
    }
    return data;
  } catch (e) {
    console.error('Session record exception:', e);
    return null;
  }
}

/**
 * Revoke all active sessions for a user
 */
export async function revokeUserSessions(userId: string) {
  try {
    await supabaseAdmin
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null);
  } catch (e) {
    console.error('Revoke sessions error:', e);
  }
}
