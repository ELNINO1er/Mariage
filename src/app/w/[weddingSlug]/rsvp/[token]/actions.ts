"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { publicRsvpSchema } from "@/features/rsvp/public-rsvp-schema";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { assertCapacity, limitsFor } from "@/server/billing/plans";

export type CollectiveRsvpState={ok?:boolean;error?:string;guestName?:string};
const secureToken=()=>randomBytes(32).toString("base64url");

export async function submitCollectiveRsvpAction(_state:CollectiveRsvpState,formData:FormData):Promise<CollectiveRsvpState>{
  const parsed=publicRsvpSchema.safeParse({weddingSlug:formData.get("weddingSlug"),token:formData.get("token"),firstName:formData.get("firstName"),lastName:formData.get("lastName"),email:formData.get("email"),phone:formData.get("phone"),status:formData.get("status"),guestCount:formData.get("guestCount")??0,childrenCount:formData.get("childrenCount")??0,companions:formData.getAll("companions"),message:formData.get("message"),website:formData.get("website")});
  if(!parsed.success)return{error:parsed.error.issues[0]?.message??"Réponse invalide"};
  if(parsed.data.website)return{ok:true,guestName:parsed.data.firstName};
  const contact=parsed.data.email??parsed.data.phone??"anonymous";
  const rate=consumeRateLimit("collective-rsvp",`${parsed.data.token}:${contact}`,3,60*60_000);
  if(!rate.allowed)return{error:`Trop de tentatives. Réessayez dans ${rate.retryAfterSeconds} secondes.`};
  const wedding=await prisma.wedding.findFirst({where:{slug:parsed.data.weddingSlug,publicRsvpToken:parsed.data.token,publicRsvpEnabled:true,status:"ACTIVE"},select:{id:true,slug:true,rsvpDeadline:true,publicRsvpMaxGuests:true,plan:true,_count:{select:{guests:true}}}});
  if(!wedding)return{error:"Ce lien RSVP est invalide ou désactivé."};
  if(wedding.rsvpDeadline&&wedding.rsvpDeadline<new Date())return{error:"La date limite de réponse est dépassée."};
  try{assertCapacity("d’invités",wedding._count.guests,1,limitsFor(wedding.plan).guests)}catch(error){return{error:error instanceof Error?error.message:"Capacité atteinte"}}
  const confirmed=parsed.data.status==="CONFIRMED";
  const guestCount=confirmed?parsed.data.guestCount:0;
  const childrenCount=confirmed?parsed.data.childrenCount:0;
  const companions=confirmed?parsed.data.companions:[];
  if(guestCount>wedding.publicRsvpMaxGuests)return{error:`Ce lien autorise au maximum ${wedding.publicRsvpMaxGuests} personnes par inscription.`};
  const duplicate=await prisma.guest.findFirst({where:{weddingId:wedding.id,OR:[...(parsed.data.email?[{email:parsed.data.email}]:[]),...(parsed.data.phone?[{phone:parsed.data.phone}]:[])]},select:{id:true}});
  if(duplicate)return{error:"Une inscription utilise déjà cet e-mail ou ce téléphone. Contactez les mariés pour la modifier."};
  const group=await prisma.guestGroup.upsert({where:{weddingId_name:{weddingId:wedding.id,name:"Inscriptions publiques"}},update:{},create:{weddingId:wedding.id,name:"Inscriptions publiques"},select:{id:true}});
  await prisma.$transaction(async transaction=>{const guest=await transaction.guest.create({data:{weddingId:wedding.id,groupId:group.id,firstName:parsed.data.firstName,lastName:parsed.data.lastName,email:parsed.data.email,phone:parsed.data.phone,maxGuests:Math.max(1,guestCount),status:parsed.data.status,notes:"Inscription via le lien RSVP collectif",invitation:{create:{token:secureToken(),checkInToken:secureToken()}},events:{create:{type:"CREATED",metadata:{source:"collective-rsvp"}}}}});await transaction.rsvp.create({data:{guestId:guest.id,status:parsed.data.status,guestCount,childrenCount,contactPhone:parsed.data.phone,message:parsed.data.message}});if(companions.length)await transaction.companion.createMany({data:companions.map(name=>({guestId:guest.id,name}))});await transaction.invitationEvent.create({data:{guestId:guest.id,type:"RSVP_SUBMITTED",metadata:{source:"collective-rsvp",status:parsed.data.status,guestCount,childrenCount}}})});
  revalidatePath("/dashboard");revalidatePath("/dashboard/guests");revalidatePath("/dashboard/rsvp");
  return{ok:true,guestName:parsed.data.firstName};
}
