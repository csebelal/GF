import { extractClientIp, logSecurityEvent } from "./audit";

/**
 * Sliding Window & Lockout Rate Limiter
 * In-memory token bucket/sliding window counter to prevent brute-force attacks and API abuse.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  lockedUntil?: number;
}

const store = new Map<string, RateLimitRecord>();

// Periodically clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt < now && (!record.lockedUntil || record.lockedUntil < now)) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Unref in Node environment so this interval doesn't hold open test scripts
  if (cleanupTimer && typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }
}

export interface RateLimitOptions {
  /** Maximum number of allowed requests in the window */
  max: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** If set, lock out the IP for this many seconds if max is exceeded */
  lockoutSeconds?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds?: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
  req?: Request | Headers | { headers: Headers }
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const record = store.get(key);

  // Check if actively locked out
  if (record?.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    if (req) {
      logSecurityEvent("RATE_LIMIT_TRIGGERED", {
        req,
        status: "BLOCKED",
        details: { key, retryAfterSeconds, locked: true },
      });
    }
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      reset: Math.ceil(record.lockedUntil / 1000),
      retryAfterSeconds,
    };
  }

  // If no record or expired window, start fresh
  if (!record || record.resetAt < now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit: options.max,
      remaining: Math.max(0, options.max - 1),
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  // Increment within window
  record.count += 1;

  if (record.count > options.max) {
    let retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);

    if (options.lockoutSeconds) {
      record.lockedUntil = now + options.lockoutSeconds * 1000;
      retryAfterSeconds = options.lockoutSeconds;
    }

    if (req) {
      logSecurityEvent("RATE_LIMIT_TRIGGERED", {
        req,
        status: "BLOCKED",
        details: { key, count: record.count, limit: options.max, retryAfterSeconds },
      });
    }

    return {
      success: false,
      limit: options.max,
      remaining: 0,
      reset: Math.ceil((record.lockedUntil || record.resetAt) / 1000),
      retryAfterSeconds,
    };
  }

  return {
    success: true,
    limit: options.max,
    remaining: Math.max(0, options.max - record.count),
    reset: Math.ceil(record.resetAt / 1000),
  };
}

/** Reset rate limit key (e.g. on successful login) */
export function resetRateLimit(key: string) {
  store.delete(key);
}

/** Pre-configured rate limiting profiles */
export const RateLimiters = {
  /** Login endpoint: 5 attempts per 15 minutes per IP, with 15-minute lockout */
  authLogin: (ip: string, req?: Request) =>
    checkRateLimit(`login:${ip}`, { max: 5, windowSeconds: 15 * 60, lockoutSeconds: 15 * 60 }, req),

  /** Login endpoint per-account limiter: prevents distributed/XFF-spoofed brute force */
  authLoginEmail: (email: string, req?: Request) =>
    checkRateLimit(`login_email:${email.toLowerCase().trim()}`, { max: 8, windowSeconds: 15 * 60, lockoutSeconds: 15 * 60 }, req),

  /** Password change: 5 attempts per 10 minutes */
  passwordChange: (ip: string, req?: Request) =>
    checkRateLimit(`pwd_change:${ip}`, { max: 5, windowSeconds: 10 * 60 }, req),

  /** File upload: 20 uploads per 10 minutes */
  fileUpload: (ip: string, req?: Request) =>
    checkRateLimit(`upload:${ip}`, { max: 20, windowSeconds: 10 * 60 }, req),

  /** General Admin API: 120 requests per minute */
  adminApi: (ip: string, req?: Request) =>
    checkRateLimit(`admin_api:${ip}`, { max: 120, windowSeconds: 60 }, req),

  /** Public analytics beacon: 60 events per minute per IP */
  analyticsTrack: (ip: string, req?: Request) =>
    checkRateLimit(`analytics:${ip}`, { max: 60, windowSeconds: 60 }, req),
};

export function getRateLimitStats(): { activeBuckets: number; lockedBuckets: number } {
  const now = Date.now();
  let activeBuckets = 0;
  let lockedBuckets = 0;

  for (const record of store.values()) {
    if (record.lockedUntil && record.lockedUntil > now) {
      lockedBuckets += 1;
      activeBuckets += 1;
    } else if (record.resetAt > now) {
      activeBuckets += 1;
    }
  }

  return { activeBuckets, lockedBuckets };
}
