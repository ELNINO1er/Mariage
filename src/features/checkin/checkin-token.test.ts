import { describe, expect, it } from "vitest";
import { checkInPayload, extractCheckInToken } from "./checkin-token";

describe("check-in tokens", () => {
  const token = "a".repeat(43);
  it("reads the native QR payload", () => expect(extractCheckInToken(checkInPayload(token))).toBe(token));
  it("reads a token URL", () => expect(extractCheckInToken(`https://noces.test/checkin?token=${token}`)).toBe(token));
  it("trims a manually entered token", () => expect(extractCheckInToken(`  ${token}  `)).toBe(token));
});
