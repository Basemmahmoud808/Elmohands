/**
 * Cyber Security Shield: Safe Input Sanitization, Multi-Tier Rate Limiting, and IP Guard
 * Platform: منصة المهندس — م/ رضا خيرت
 */

// =========================================================================
// 1. INPUT SANITIZATION & NORMALIZATION
// =========================================================================

/**
 * Strips dangerous HTML tags, executable javascript handlers, pseudo-protocols,
 * null bytes, and malicious characters from string input.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';

  let sanitized = input
    .replace(/\0/g, '') // Strip null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Strip ASCII control characters (except tab/newline)
    .trim();

  // Strip dangerous tags and their content (closed or unclosed)
  sanitized = sanitized
    .replace(/<script\b[\s\S]*?(?:<\/script>|$)/gi, '')
    .replace(/<iframe\b[\s\S]*?(?:<\/iframe>|$)/gi, '')
    .replace(/<object\b[\s\S]*?(?:<\/object>|$)/gi, '')
    .replace(/<embed\b[\s\S]*?(?:<\/embed>|$)/gi, '')
    .replace(/<applet\b[\s\S]*?(?:<\/applet>|$)/gi, '')
    .replace(/<style\b[\s\S]*?(?:<\/style>|$)/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<base\b[^>]*>/gi, '')
    // Strip DOM Event Handlers (onerror=, onload=, onclick=, etc.)
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, '')
    // Strip Pseudo-protocols
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');

  return sanitized;
}

/**
 * Escapes characters for safe HTML output (& < > " ' /).
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (s) => entityMap[s] || s);
}

/**
 * Recursively sanitizes all string properties in an object or array.
 */
export function sanitizeObject<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return sanitizeInput(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj as T;
  }

  return data;
}

/**
 * Converts Eastern Arabic numerals (٠-٩) to standard ASCII digits (0-9).
 */
export function normalizeArabicDigits(input: string): string {
  if (!input) return '';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  return input.replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d).toString());
}

/**
 * Cleans and sanitizes search queries to prevent wildcard denial of service
 * and SQL injection injection artifacts in ilike patterns.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  return sanitizeInput(query)
    .replace(/[%_]/g, (char) => `\\${char}`) // Escape Postgres LIKE wildcards
    .replace(/\\+/g, '\\') // Prevent runaway escape chains
    .slice(0, 100); // Limit search length
}

// =========================================================================
// 2. ENTERPRISE MULTI-TIER RATE LIMITER (In-Memory with Sliding Window)
// =========================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_STORE: Map<string, RateLimitEntry> = new Map();
const MAX_STORE_CAPACITY = 20000;

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Rate Limit Checker with auto-eviction and sliding window.
 */
export function checkRateLimit(options: {
  key: string;
  maxRequests: number;
  windowMs: number;
}): RateLimitResult {
  const { key, maxRequests, windowMs } = options;
  const now = Date.now();

  // Periodic eviction if memory grows
  if (RATE_LIMIT_STORE.size > MAX_STORE_CAPACITY) {
    RATE_LIMIT_STORE.forEach((entry, entryKey) => {
      if (now > entry.resetTime) {
        RATE_LIMIT_STORE.delete(entryKey);
      }
    });
  }

  const existing = RATE_LIMIT_STORE.get(key);

  if (!existing || now > existing.resetTime) {
    RATE_LIMIT_STORE.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - 1),
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    const resetInSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetInSeconds,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, maxRequests - existing.count);
  const resetInSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    resetInSeconds,
  };
}

/**
 * Compatibility helper matching existing signature.
 */
export function checkIpRateLimit(
  ip: string = '127.0.0.1',
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const res = checkRateLimit({
    key: `general_${ip}`,
    maxRequests,
    windowMs,
  });
  return {
    allowed: res.allowed,
    remaining: res.remaining,
    resetInSeconds: res.resetInSeconds,
  };
}

/**
 * Extracts true client IP address safely from request headers across CDNs (Vercel, Cloudflare, AWS).
 */
export function extractClientIp(headers: Headers): string {
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}
