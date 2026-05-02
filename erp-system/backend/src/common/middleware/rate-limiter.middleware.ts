import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  skipPaths?: string[];
}

const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  skipPaths: ['/api/health'],
};

const store = new Map<string, RateLimitEntry>();

export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const options = DEFAULT_OPTIONS;

  if (options.skipPaths.some((path) => req.path.startsWith(path))) {
    next();
    return;
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    store.set(ip, entry);
    next();
    return;
  }

  entry.count++;

  res.set('X-RateLimit-Limit', String(options.maxRequests));
  res.set('X-RateLimit-Remaining', String(Math.max(0, options.maxRequests - entry.count)));
  res.set('X-RateLimit-Reset', String(entry.resetTime));

  if (entry.count > options.maxRequests) {
    res.status(429).json({
      statusCode: 429,
      message: '请求过于频繁，请稍后再试',
      error: 'Too Many Requests',
    });
    return;
  }

  next();
}

// Cleanup expired entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(ip);
    }
  }
}, 60 * 60 * 1000);
