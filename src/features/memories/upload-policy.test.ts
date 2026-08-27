import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, validatePhotoEnvelope } from "./upload-policy";

describe("photo upload policy", () => {
  it("accepts supported images", () => expect(validatePhotoEnvelope({ size: 1024, type: "image/jpeg" })).toBeNull());
  it("rejects oversized files", () => expect(validatePhotoEnvelope({ size: MAX_PHOTO_BYTES + 1, type: "image/png" })).toContain("8 Mo"));
  it("rejects disguised unsupported files", () => expect(validatePhotoEnvelope({ size: 1024, type: "image/svg+xml" })).toContain("JPEG"));
});
