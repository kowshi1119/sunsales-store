/** Simple in-memory rate limiter for development. 
 *  In production, replace with Redis-based rate limiting (Upstash). */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/** Helper for auth rate limiting */
export function rateLimitAuth(ip: string): RateLimitResult {
  return rateLimit(`auth:${ip}`, { maxRequests: 5, windowMs: 15 * 60 * 1000 });
}

/** Helper for OTP rate limiting */
export function rateLimitOTP(email: string): RateLimitResult {
  return rateLimit(`otp:${email}`, { maxRequests: 3, windowMs: 15 * 60 * 1000 });
}

/** Helper for general API rate limiting */
export function rateLimitAPI(identifier: string): RateLimitResult {
  return rateLimit(`api:${identifier}`, { maxRequests: 100, windowMs: 60 * 1000 });
}
