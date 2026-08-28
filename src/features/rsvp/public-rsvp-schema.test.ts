import { describe, expect, it } from "vitest";
import { publicRsvpSchema } from "./public-rsvp-schema";

const base={weddingSlug:"romeo-juliette",token:"a".repeat(43),firstName:"Awa",lastName:"Koné",email:"awa@example.com",phone:"",status:"CONFIRMED",guestCount:"2",childrenCount:"0",companions:["Jean Koné"],message:"",website:""};
describe("publicRsvpSchema",()=>{
  it("valide et normalise une inscription collective",()=>{const result=publicRsvpSchema.parse(base);expect(result.email).toBe("awa@example.com");expect(result.guestCount).toBe(2)});
  it("exige un moyen de contact",()=>{expect(publicRsvpSchema.safeParse({...base,email:"",phone:""}).success).toBe(false)});
  it("refuse trop d’accompagnateurs",()=>{expect(publicRsvpSchema.safeParse({...base,guestCount:"1",companions:["Jean Koné"]}).success).toBe(false)});
});
