// src/lib/rateLimit.ts

/**
 * Represents a record of requests for a single IP.
 */
type RateLimitRecord = {
  timestamp: number; // Time of first request in the current window
  count: number;     // Number of requests in the current window
};

/**
 * Stores rate limit data in-memory per IP address.
 * This map is reset automatically based on the window period.
 */
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Time window duration in milliseconds for rate limiting.
 * Clients can make up to `MAX_REQUESTS` requests within this period.
 * 
 * For example: 60,000 ms = 1 minute
 */
const WINDOW_MS = 60 * 1000;

/**
 * Maximum number of requests allowed from a single IP within the window.
 */
const MAX_REQUESTS = 10;

/**
 * Applies basic in-memory rate limiting based on IP address.
 * 
 * @param ip - The client's IP address (used as a key)
 * @returns `true` if the request is allowed, or `false` if the IP has exceeded the limit
 */
export function applyBasicRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { timestamp: now, count: 1 });
    return true;
  }

  if (now - record.timestamp > WINDOW_MS) {
    // Window has expired, reset the counter
    rateLimitMap.set(ip, { timestamp: now, count: 1 });
    return true;
  }

  if (record.count < MAX_REQUESTS) {
    record.count += 1;
    return true;
  }

  // Request exceeds allowed limit
  return false;
}