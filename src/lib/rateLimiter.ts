import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';

// Default rate limit: 20 requests per minute per IP. Values can be
// overridden with environment variables. The `points` defines how many
// requests are allowed in `duration` seconds.
const POINTS = parseInt(process.env.RATE_LIMIT_POINTS || '20', 10);
const DURATION = parseInt(process.env.RATE_LIMIT_DURATION || '60', 10);

let rateLimiter: RateLimiterMemory | RateLimiterRedis;

const redisUrl = process.env.REDIS_URL;
if (redisUrl) {
  // Use Redis to share rate limits across serverless invocations when available.
  const redisClient = createClient({ url: redisUrl });
  // Connection will be lazily established by rate-limiter-flexible on first call.
  rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rate_limit',
    points: POINTS,
    duration: DURATION,
  });
} else {
  // Fallback to in‑memory rate limiter. Suitable for single instance usage.
  rateLimiter = new RateLimiterMemory({ points: POINTS, duration: DURATION });
}

export interface RateLimitResult {
  allowed: boolean;
  /** Optional number of seconds until the next allowed request */
  retryAfter?: number;
}

/**
 * Consumes one point for the given identifier (e.g. IP). If no points remain
 * the request is denied and the caller receives the number of seconds to
 * wait before the next allowed request. On errors, the request is allowed.
 *
 * @param identifier A unique key (typically an IP address)
 */
export async function applyRateLimit(identifier: string): Promise<RateLimitResult> {
  try {
    await rateLimiter.consume(identifier);
    return { allowed: true };
  } catch (err: any) {
    const retryAfterSec = err.msBeforeNext ? Math.ceil(err.msBeforeNext / 1000) : undefined;
    return { allowed: false, retryAfter: retryAfterSec };
  }
}