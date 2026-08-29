import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { checkIpRateLimit } from '@/lib/security';


const JWT_SECRET_VALUE = process.env.JWT_SECRET;
if (!JWT_SECRET_VALUE) throw new Error('FATAL: JWT_SECRET environment variable is not set.');
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

  // 1. Extract Client IP & Anti-DDoS Rate Limiting
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : request.ip || '127.0.0.1';
  const rateCheck = checkIpRateLimit(clientIp, 120, 60000);

  if (!rateCheck.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `تنبيه حماية السيرفر: تم تجاوز الحد المسموح من الطلبات (Anti-DDoS Shield). يرجى الانتظار ${rateCheck.resetInSeconds} ثانية.`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': String(rateCheck.resetInSeconds),
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
