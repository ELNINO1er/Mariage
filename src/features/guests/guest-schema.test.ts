import { describe, expect, it } from "vitest";
import { guestInputSchema, importedGuestSchema } from "./guest-schema";

describe("guest validation", () => {
  it("normalizes optional fields and email", () => {
    const result=guestInputSchema.parse({firstName:"  Alice ",lastName:" Martin ",email:" ALICE@EXAMPLE.COM ",phone:"",groupId:"",maxGuests:"3",notes:""});
    expect(result).toMatchObject({firstName:"Alice",lastName:"Martin",email:"alice@example.com",maxGuests:3,phone:undefined});
  });
  it("rejects an invalid party size", () => expect(guestInputSchema.safeParse({firstName:"Alice",lastName:"Martin",maxGuests:21}).success).toBe(false));
  it("accepts a CSV group name", () => expect(importedGuestSchema.safeParse({firstName:"Alice",lastName:"Martin",maxGuests:1,groupName:"Famille"}).success).toBe(true));
});
