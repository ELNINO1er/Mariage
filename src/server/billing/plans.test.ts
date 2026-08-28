import { describe,expect,it } from "vitest";
import { assertCapacity,assertTheme,limitsFor } from "./plans";
describe("subscription limits",()=>{it("applies guest limits",()=>{expect(limitsFor("FREE").guests).toBe(100);expect(()=>assertCapacity("d’invités",100,1,100)).toThrow(/Limite/)});it("locks premium themes",()=>{expect(()=>assertTheme("FREE","luxury")).toThrow();expect(()=>assertTheme("PREMIUM","luxury")).not.toThrow()})});
