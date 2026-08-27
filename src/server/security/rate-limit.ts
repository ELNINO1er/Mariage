import "server-only";
import { createRateLimiter } from "./rate-limiter";

const globalRateLimits = globalThis as unknown as { nocesRateLimit?: ReturnType<typeof createRateLimiter> };
const limiter = globalRateLimits.nocesRateLimit ?? createRateLimiter();
globalRateLimits.nocesRateLimit = limiter;

export function consumeRateLimit(scope: string, secret: string, limit = 8, windowMs = 60_000) {
  return limiter(scope, secret, limit, windowMs);
}
