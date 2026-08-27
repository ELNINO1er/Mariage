import { createHash } from "node:crypto";

type Bucket = { count: number; resetAt: number };
export function createRateLimiter(buckets = new Map<string, Bucket>(), now = () => Date.now()) {
  return (scope: string, secret: string, limit = 8, windowMs = 60_000) => {
    const timestamp = now();
    const key = `${scope}:${createHash("sha256").update(secret).digest("hex")}`;
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= timestamp) {
      buckets.set(key, { count: 1, resetAt: timestamp + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (bucket.count >= limit) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - timestamp) / 1000)) };
    bucket.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  };
}
