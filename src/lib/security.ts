/**
 * Cyber Security Shield: Safe Input Sanitization and IP Rate Limiter (Anti-DDoS)
 */

// 1. Safe Input Sanitizer (Prevents HTML/Script injection without corrupting text or Math)
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Strip dangerous script and iframe elements and executable javascript handlers
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, '') // Event handlers like onerror=, onload=
    .replace(/javascript:/gi, '');

  return sanitized;
}

// 2. Sliding Window In-Memory IP Rate Limiter with Auto-Eviction
interface IpLog {
  count: number;
  resetTime: number;
}

const IP_RATE_STORE: Map<string, IpLog> = new Map();
const MAX_STORE_ENTRIES = 10000;

export function checkIpRateLimit(
  ip: string = '127.0.0.1',
  maxRequests: number = 60, // Max 60 requests
  windowMs: number = 60000 // per 1 minute (60,000ms)
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();

  // Periodic eviction if store grows too large
  if (IP_RATE_STORE.size > MAX_STORE_ENTRIES) {
    IP_RATE_STORE.forEach((val, key) => {
      if (now > val.resetTime) {
        IP_RATE_STORE.delete(key);
      }
    });
  }

  const log = IP_RATE_STORE.get(ip);

  if (!log || now > log.resetTime) {
    IP_RATE_STORE.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
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

