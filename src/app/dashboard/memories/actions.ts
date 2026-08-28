"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentMembership } from "@/server/auth/authorization";
import { deleteObjectByUrl } from "@/server/storage/object-storage";

const inputSchema=z.object({id:z.string().cuid(),kind:z.enum(["photo","entry"]),status:z.enum(["APPROVED","REJECTED"])});
async function editor(){const membership=await getCurrentMembership();if(!membership)throw new Error("Mariage introuvable");if(!(["OWNER","ADMIN","ORGANIZER"] as string[]).includes(membership.role))throw new Error("Permission insuffisante");return membership;}
export async function moderateMemoryAction(input:{id:string;kind:"photo"|"entry";status:"APPROVED"|"REJECTED"}){const parsed=inputSchema.safeParse(input);if(!parsed.success)return{ok:false,error:"Action invalide"};const membership=await editor();const result=parsed.data.kind==="photo"?await prisma.galleryPhoto.updateMany({where:{id:parsed.data.id,weddingId:membership.weddingId},data:{status:parsed.data.status}}):await prisma.guestBookEntry.updateMany({where:{id:parsed.data.id,weddingId:membership.weddingId},data:{status:parsed.data.status}});if(!result.count)return{ok:false,error:"Souvenir introuvable"};revalidatePath("/dashboard/memories");return{ok:true};}
export async function deleteMemoryAction(input:{id:string;kind:"photo"|"entry"}){const parsed=z.object({id:z.string().cuid(),kind:z.enum(["photo","entry"])}).safeParse(input);if(!parsed.success)return{ok:false,error:"Action invalide"};const membership=await editor();if(parsed.data.kind==="entry"){const result=await prisma.guestBookEntry.deleteMany({where:{id:parsed.data.id,weddingId:membership.weddingId}});revalidatePath("/dashboard/memories");return{ok:Boolean(result.count)};}
  const photo=await prisma.galleryPhoto.findFirst({where:{id:parsed.data.id,weddingId:membership.weddingId},select:{id:true,imageUrl:true}});if(!photo)return{ok:false,error:"Photo introuvable"};await prisma.galleryPhoto.delete({where:{id:photo.id}});await deleteObjectByUrl(photo.imageUrl).catch(()=>undefined);revalidatePath("/dashboard/memories");return{ok:true};}
