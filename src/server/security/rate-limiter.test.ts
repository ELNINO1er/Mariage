import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limiter";

describe("rate limiter", () => {
  it("blocks after the configured limit", () => { const limit=createRateLimiter(); expect(limit("login","user",2).allowed).toBe(true); expect(limit("login","user",2).allowed).toBe(true); expect(limit("login","user",2).allowed).toBe(false); });
  it("isolates scopes and secrets", () => { const limit=createRateLimiter(); limit("rsvp","a",1); expect(limit("gallery","a",1).allowed).toBe(true); expect(limit("rsvp","b",1).allowed).toBe(true); });
  it("resets an expired bucket", () => { let now=1_000; const limit=createRateLimiter(new Map(),()=>now); limit("x","y",1,1000); now=2_001; expect(limit("x","y",1,1000).allowed).toBe(true); });
});
