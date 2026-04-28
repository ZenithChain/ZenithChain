import type { NextFunction, Request, Response } from "express";
import { clientIp } from "./zenith";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(opts: {
  windowMs: number;
  max: number;
  keyPrefix: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = clientIp(req);
    const key = `${opts.keyPrefix}:${ip}`;
    const now = Date.now();
    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }
    if (existing.count >= opts.max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter.toString());
      res.status(429).json({
        error: "Too many requests. Please slow down.",
        code: "RATE_LIMITED",
        retryAfterSeconds: retryAfter,
      });
      return;
    }
    existing.count += 1;
    next();
  };
}
