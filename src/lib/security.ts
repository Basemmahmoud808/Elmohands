/**
 * Cyber Security Shield: Input Sanitization (Anti-SQLi & Anti-XSS) and IP Rate Limiter (Anti-DDoS)
 */

// 1. Anti-SQL Injection & Anti-XSS Input Sanitizer
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Strip HTML / Script Tags (Anti-XSS)
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');

  // Strip Dangerous SQL Injection Keywords & Syntax
  sanitized = sanitized
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/\b(DROP|DELETE|UPDATE|INSERT|EXEC|UNION|SELECT|ALTER|CREATE|TRUNCATE)\b/gi, '');

  return sanitized;
}

// 2. Sliding Window In-Memory IP Rate Limiter (Anti-DDoS & Flooding)
interface IpLog {
  count: number;
  resetTime: number;
}

const IP_RATE_STORE: Record<string, IpLog> = {};

export function checkIpRateLimit(
  ip: string = '127.0.0.1',
  maxRequests: number = 60, // Max 60 requests
  windowMs: number = 60000 // per 1 minute (60,000ms)
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const log = IP_RATE_STORE[ip];

  if (!log || now > log.resetTime) {
    IP_RATE_STORE[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  if (log.count >= maxRequests) {
    const resetInSeconds = Math.ceil((log.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  log.count += 1;
  const remaining = maxRequests - log.count;
  const resetInSeconds = Math.ceil((log.resetTime - now) / 1000);

  return { allowed: true, remaining, resetInSeconds };
}
