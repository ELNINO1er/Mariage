import { describe, expect, it } from "vitest";
import { capacityProjection } from "./capacity";

describe("table capacity", () => {
  it("accepts the exact capacity", () => expect(capacityProjection(6, 4, 10)).toEqual({ projected: 10, capacity: 10, exceeded: false, remaining: 0 }));
  it("detects an over-capacity assignment", () => expect(capacityProjection(9, 3, 10)).toMatchObject({ projected: 12, exceeded: true, remaining: 0 }));
  it("reports remaining seats", () => expect(capacityProjection(2, 3, 10).remaining).toBe(5));
});
