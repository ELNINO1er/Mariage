"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { validatePhotoEnvelope } from "@/features/memories/upload-policy";
import { deleteObjectByUrl, uploadObject } from "@/server/storage/object-storage";
import { assertCapacity, limitsFor } from "@/server/billing/plans";

export type MemoryActionState = { ok?: boolean; error?: string };
const text = (max:number) => z.preprocess((value)=>typeof value === "string" && value.trim() ? value : undefined,z.string().trim().max(max).optional());
const schema=z.object({weddingSlug:z.string().trim().min(1).max(191),token:z.string().min(32).max(96),message:text(1500),caption:text(500)});

export async function submitMemoryAction(_state:MemoryActionState,formData:FormData):Promise<MemoryActionState>{
  const parsed=schema.safeParse({weddingSlug:formData.get("weddingSlug"),token:formData.get("token"),message:formData.get("message"),caption:formData.get("caption")});
  if(!parsed.success)return{error:parsed.error.issues[0]?.message??"Contribution invalide."};
  const photo=formData.get("photo"); const hasPhoto=photo instanceof File&&photo.size>0;
  if(!hasPhoto&&!parsed.data.message)return{error:"Ajoutez une photo ou écrivez un message."};
  const limit=consumeRateLimit("memories",parsed.data.token,5,10*60_000);if(!limit.allowed)return{error:`Trop d’envois. Réessayez dans ${limit.retryAfterSeconds} secondes.`};
  const invitation=await prisma.invitation.findFirst({where:{token:parsed.data.token,guest:{wedding:{slug:parsed.data.weddingSlug}}},select:{guestId:true,guest:{select:{weddingId:true,wedding:{select:{plan:true,_count:{select:{galleryPhotos:true}}}}}}}});
  if(!invitation)return{error:"Invitation introuvable ou expirée."};

  let image: {url:string;width:number;height:number}|null=null;
  try{
    if(hasPhoto){
      assertCapacity("de photos",invitation.guest.wedding._count.galleryPhotos,1,limitsFor(invitation.guest.wedding.plan).galleryPhotos);
      const envelopeError=validatePhotoEnvelope(photo);if(envelopeError)return{error:envelopeError};
      const processed=await sharp(Buffer.from(await photo.arrayBuffer()),{failOn:"error",limitInputPixels:40_000_000}).rotate().resize({width:2400,height:2400,fit:"inside",withoutEnlargement:true}).webp({quality:82}).toBuffer({resolveWithObject:true});
      if(!processed.info.width||!processed.info.height)throw new Error("Dimensions de photo invalides.");
      const fileName=`${randomUUID()}.webp`;const url=await uploadObject(`gallery/${invitation.guest.weddingId}/${fileName}`,processed.data,"image/webp");
      image={url,width:processed.info.width,height:processed.info.height};
    }
    await prisma.$transaction(async(transaction)=>{
      if(image)await transaction.galleryPhoto.create({data:{weddingId:invitation.guest.weddingId,guestId:invitation.guestId,imageUrl:image.url,width:image.width,height:image.height,caption:parsed.data.caption}});
      if(parsed.data.message)await transaction.guestBookEntry.create({data:{weddingId:invitation.guest.weddingId,guestId:invitation.guestId,message:parsed.data.message}});
    });
    revalidatePath(`/w/${parsed.data.weddingSlug}/invite/${parsed.data.token}`);revalidatePath("/dashboard/memories");
    return{ok:true};
  }catch(error){
    if(image)await deleteObjectByUrl(image.url).catch(()=>undefined);
    return{error:error instanceof Error?error.message:"Envoi impossible."};
  }
}
