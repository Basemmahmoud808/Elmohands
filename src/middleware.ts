import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { checkRateLimit, extractClientIp } from '@/lib/security';

const JWT_SECRET_VALUE = process.env.JWT_SECRET || '_build_placeholder_jwt_';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_VALUE);

interface TokenPayload {
  userId: string;
  phone: string;
  role: 'ADMIN' | 'STUDENT';
  fullName: string;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Extract Client IP Safely
  const clientIp = extractClientIp(request.headers);

  // 2. Multi-Tier Granular Rate Limiting (Anti-Brute Force & Anti-DDoS)
  const isAuthPath = pathname.startsWith('/api/auth') || pathname === '/sign-in' || pathname === '/sign-up';
  const isWebhookPath = pathname.startsWith('/api/webhooks');

  let rateLimitConfig = { maxRequests: 120, windowMs: 60000, tier: 'general' };

  if (isAuthPath) {
    // Strict limit on authentication endpoints to prevent credential stuffing and brute-force
    rateLimitConfig = { maxRequests: 15, windowMs: 60000, tier: 'auth' };
  } else if (isWebhookPath) {
    // Moderate limit on external webhooks
    rateLimitConfig = { maxRequests: 30, windowMs: 60000, tier: 'webhook' };
  }

  const rateCheck = checkRateLimit({
    key: `${rateLimitConfig.tier}_${clientIp}`,
    maxRequests: rateLimitConfig.maxRequests,
    windowMs: rateLimitConfig.windowMs,
  });

  if (!rateCheck.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `تنبيه حماية السيرفر: تم تجاوز الحد المسموح من المحاولات (${rateLimitConfig.maxRequests} طلب/دقيقة). يرجى الانتظار ${rateCheck.resetInSeconds} ثانية.`,
        retryAfter: rateCheck.resetInSeconds,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': String(rateCheck.resetInSeconds),
          'X-RateLimit-Limit': String(rateCheck.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateCheck.resetInSeconds),
        },
      }
    );
  }

  // 2. Auth Cookie Inspection
  const authToken = request.cookies.get('auth_token')?.value;
  const userPayload = authToken ? await verifyToken(authToken) : null;

  // 3. Protected Route Guards
  const isAdminRoute = pathname.startsWith('/admin');
  const isStudentRoute = pathname.startsWith('/student');
  const isAuthRoute = pathname === '/sign-in' || pathname === '/sign-up';

  // Redirect unauthenticated users trying to access protected routes
  if ((isAdminRoute || isStudentRoute) && !userPayload) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin route restriction: non-ADMIN users redirected to /student
  if (isAdminRoute && userPayload?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/student', request.url));
  }

  // Redirect already authenticated users away from /sign-in and /sign-up
  if (isAuthRoute && userPayload) {
    if (userPayload.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/student', request.url));
  }

  // 4. Security Response Headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed by Next.js dev mode
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://drive.google.com https://iframe.mediadelivery.net https://docs.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files & next assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
