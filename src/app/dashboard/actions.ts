"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth/authorization";

export async function selectWeddingAction(formData:FormData){
  const user=await requireUser();
  const weddingId=z.string().cuid().parse(formData.get("weddingId"));
  const membership=await prisma.weddingMember.findUnique({where:{userId_weddingId:{userId:user.id,weddingId}},include:{wedding:true}});
  if(!membership||membership.wedding.status!=="ACTIVE")redirect("/dashboard");
  (await cookies()).set("noces_active_wedding",weddingId,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
  redirect("/dashboard");
}
