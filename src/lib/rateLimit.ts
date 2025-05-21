// src/lib/rateLimit.ts

import redis from './redis';

/**
 * Time window duration in seconds for rate limiting.
 * Clients can make up to `MAX_REQUESTS` requests within this period.
 *
 * For example: 60 seconds = 1 minute
 */
const WINDOW_SECONDS = 60;

/**
 * Maximum number of requests allowed from a single IP within the window.
 */
const MAX_REQUESTS = 100;

/**
 * Applies Redis-based rate limiting based on IP address.
 *
 * @param ip - The client's IP address (used as a Redis key)
 * @returns `true` if the request is allowed, or `false` if the limit is exceeded
 */
export async function applyRedisRateLimit(ip: string): Promise<boolean> {
  const key = `ratelimit:${ip}`;

  // Increment the request count for this IP
  const current = await redis.incr(key);

  // If this is the first request, set the expiration window
  if (current === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  return current <= MAX_REQUESTS;
}
