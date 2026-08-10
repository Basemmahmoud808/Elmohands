import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkIpRateLimit } from '@/lib/security';

export function middleware(request: NextRequest) {
  // Extract Client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : request.ip || '127.0.0.1';

  // Anti-DDoS Rate Limiting (Max 120 requests per minute per IP)
  const rateCheck = checkIpRateLimit(clientIp, 120, 60000);

  if (!rateCheck.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `تنبيه حماية السيرفر: تم تجاوز الحد المسموح من الطلبات أوتوماتيكياً (Anti-DDoS Shield). يرجى الانتظار ${rateCheck.resetInSeconds} ثانية.`,
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

  // Create Response with Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files & next internal assets:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
