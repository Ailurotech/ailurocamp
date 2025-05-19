// src/lib/rateLimit.ts

type RateLimitRecord = {
    timestamp: number;
    count: number;
  };
  
  const rateLimitMap = new Map<string, RateLimitRecord>();
  const WINDOW_MS = 60 * 1000;
  const MAX_REQUESTS = 10;     
  
  export function applyBasicRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);
  
    if (!record) {
      rateLimitMap.set(ip, { timestamp: now, count: 1 });
      return true;
    }
  
    if (now - record.timestamp > WINDOW_MS) {
      rateLimitMap.set(ip, { timestamp: now, count: 1 });
      return true;
    }
  
    if (record.count < MAX_REQUESTS) {
      record.count += 1;
      return true;
    }
  
    return false;
  }