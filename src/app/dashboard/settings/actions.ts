"use server";

import { randomBytes,randomUUID } from "node:crypto";
import { mkdir,unlink,writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validatePhotoEnvelope } from "@/features/memories/upload-policy";
import { getCurrentMembership } from "@/server/auth/authorization";

export type SettingsState={ok?:boolean;error?:string};
const optional=(max:number)=>z.preprocess(value=>typeof value==="string"&&value.trim()===""?undefined:value,z.string().trim().max(max).optional());
const settingsSchema=z.object({partnerOne:z.string().trim().min(2).max(80),partnerTwo:z.string().trim().min(2).max(80),weddingDate:z.coerce.date(),rsvpDeadline:z.preprocess(value=>value===""?undefined:value,z.coerce.date().optional()),city:optional(100),country:optional(100),message:optional(3000),dressCode:optional(200),contactPhone:optional(40),theme:z.enum(["editorial","floral","minimal","luxury","tropical","royal"]),accentColor:z.enum(["coral","caramel","rose","sage","navy","gold","terracotta","lavender","emerald"]),siteLayout:z.enum(["editorial","cinematic","minimal","classic","split"])});
const imageKind=z.enum(["cover","partnerOne","partnerTwo"]);

async function editor(){const membership=await getCurrentMembership();if(!membership)throw new Error("Mariage introuvable");if(!(["OWNER","ADMIN","ORGANIZER"] as string[]).includes(membership.role))throw new Error("Permission insuffisante");return membership;}
function refresh(slug:string){revalidatePath("/dashboard/settings");revalidatePath("/dashboard/site-editor");revalidatePath(`/w/${slug}`,"layout");}

export async function updateWeddingSettingsAction(_state:SettingsState,formData:FormData):Promise<SettingsState>{const parsed=settingsSchema.safeParse(Object.fromEntries(formData));if(!parsed.success)return{error:parsed.error.issues[0]?.message??"Informations invalides"};try{const membership=await editor();await prisma.wedding.update({where:{id:membership.weddingId},data:parsed.data});refresh(membership.wedding.slug);return{ok:true};}catch(error){return{error:error instanceof Error?error.message:"Modification impossible"};}}

export async function uploadSiteImageAction(kind:string,_state:SettingsState,formData:FormData):Promise<SettingsState>{const parsedKind=imageKind.safeParse(kind);const file=formData.get("image");if(!parsedKind.success||!(file instanceof File))return{error:"Image invalide"};const envelopeError=validatePhotoEnvelope(file);if(envelopeError)return{error:envelopeError};let absolutePath="";try{const membership=await editor();const isCover=parsedKind.data==="cover";const processed=await sharp(Buffer.from(await file.arrayBuffer()),{failOn:"error",limitInputPixels:40_000_000}).rotate().resize({width:isCover?2400:1200,height:isCover?1500:1400,fit:"cover",position:"centre"}).webp({quality:85}).toBuffer();const directory=path.join(process.cwd(),"public","uploads","sites",membership.weddingId);await mkdir(directory,{recursive:true});absolutePath=path.join(directory,`${parsedKind.data}-${randomUUID()}.webp`);await writeFile(absolutePath,processed,{flag:"wx"});const imageUrl=`/uploads/sites/${membership.weddingId}/${path.basename(absolutePath)}`;const field=parsedKind.data==="cover"?"coverImageUrl":parsedKind.data==="partnerOne"?"partnerOneImageUrl":"partnerTwoImageUrl";const current=membership.wedding[field];await prisma.wedding.update({where:{id:membership.weddingId},data:{[field]:imageUrl}});if(current){const root=path.resolve(process.cwd(),"public","uploads","sites");const old=path.resolve(process.cwd(),"public",current.replace(/^\/+/,""));if(old.startsWith(`${root}${path.sep}`))await unlink(old).catch(()=>undefined);}refresh(membership.wedding.slug);return{ok:true};}catch(error){if(absolutePath)await unlink(absolutePath).catch(()=>undefined);return{error:error instanceof Error?error.message:"Envoi impossible"};}}

export async function setPublicGuestListAction(enabled:boolean):Promise<SettingsState>{try{const membership=await editor();await prisma.wedding.update({where:{id:membership.weddingId},data:{publicGuestListEnabled:enabled,...(enabled&&!membership.wedding.publicGuestListToken?{publicGuestListToken:randomBytes(32).toString("base64url")}:{})}});refresh(membership.wedding.slug);return{ok:true};}catch(error){return{error:error instanceof Error?error.message:"Action impossible"};}}
export async function regeneratePublicGuestListTokenAction():Promise<SettingsState>{try{const membership=await editor();await prisma.wedding.update({where:{id:membership.weddingId},data:{publicGuestListToken:randomBytes(32).toString("base64url"),publicGuestListEnabled:true}});refresh(membership.wedding.slug);return{ok:true};}catch(error){return{error:error instanceof Error?error.message:"Action impossible"};}}

export async function setCollectiveRsvpAction(enabled:boolean,maxGuests:number):Promise<SettingsState>{try{const membership=await editor();const safeMax=z.number().int().min(1).max(20).parse(maxGuests);await prisma.wedding.update({where:{id:membership.weddingId},data:{publicRsvpEnabled:enabled,publicRsvpMaxGuests:safeMax,...(enabled&&!membership.wedding.publicRsvpToken?{publicRsvpToken:randomBytes(32).toString("base64url")}:{})}});revalidatePath("/dashboard/share");return{ok:true};}catch(error){return{error:error instanceof Error?error.message:"Action impossible"};}}

export async function regenerateCollectiveRsvpTokenAction():Promise<SettingsState>{try{const membership=await editor();await prisma.wedding.update({where:{id:membership.weddingId},data:{publicRsvpToken:randomBytes(32).toString("base64url"),publicRsvpEnabled:true}});revalidatePath("/dashboard/share");return{ok:true};}catch(error){return{error:error instanceof Error?error.message:"Action impossible"};}}
