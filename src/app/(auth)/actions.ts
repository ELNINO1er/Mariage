"use server";

import { hash } from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { sendEmail } from "@/server/notifications/email";

export type AuthState = { error?: string; fields?: Record<string, string> };

const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom trop court").max(80),
  lastName: z.string().trim().min(2, "Nom trop court").max(80),
  email: z.string().trim().email("Adresse e-mail invalide").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Utilisez au moins 8 caractères").max(128),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, { message: "Les mots de passe ne correspondent pas", path: ["passwordConfirmation"] });

export async function registerAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  if (!consumeRateLimit("register", parsed.data.email, 3, 60 * 60_000).allowed) return { error: "Trop de tentatives. Réessayez plus tard." };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (existing) return { error: "Un compte existe déjà avec cette adresse." };

  const user=await prisma.user.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      passwordHash: await hash(parsed.data.password, 12),
    },
  });
  const token=randomBytes(32).toString("base64url");await prisma.emailVerificationToken.create({data:{userId:user.id,tokenHash:createHash("sha256").update(token).digest("hex"),expiresAt:new Date(Date.now()+24*60*60_000)}});const base=(process.env.AUTH_URL??"http://localhost:3000").replace(/\/$/,"");const delivery=await sendEmail({to:user.email,subject:"Confirmez votre compte Noces",text:`Bienvenue sur Noces. Confirmez votre adresse : ${base}/verify-email?token=${token}`});
  redirect(delivery.sent?"/login?message=Consultez votre e-mail pour confirmer votre compte":"/login?message=Compte créé. Configurez le service e-mail puis demandez un nouveau lien.");
}

export async function requestPasswordResetAction(_state:AuthState,formData:FormData):Promise<AuthState>{const email=z.string().trim().toLowerCase().email().safeParse(formData.get("email"));if(!email.success)return{error:"Adresse e-mail invalide"};if(!consumeRateLimit("password-reset",email.data,3,60*60_000).allowed)return{error:"Trop de demandes. Réessayez plus tard."};const user=await prisma.user.findUnique({where:{email:email.data},select:{id:true,email:true}});if(user){const token=randomBytes(32).toString("base64url");await prisma.passwordResetToken.create({data:{userId:user.id,tokenHash:createHash("sha256").update(token).digest("hex"),expiresAt:new Date(Date.now()+60*60_000)}});const base=(process.env.AUTH_URL??"http://localhost:3000").replace(/\/$/,"");await sendEmail({to:user.email,subject:"Réinitialisation de votre mot de passe Noces",text:`Choisissez un nouveau mot de passe : ${base}/reset-password?token=${token}`});}return{fields:{message:"Si un compte correspond, un e-mail vient d’être envoyé."}}}

export async function resetPasswordAction(_state:AuthState,formData:FormData):Promise<AuthState>{const parsed=z.object({token:z.string().min(32).max(96),password:z.string().min(10).max(128),passwordConfirmation:z.string()}).refine(v=>v.password===v.passwordConfirmation,{message:"Les mots de passe ne correspondent pas"}).safeParse(Object.fromEntries(formData));if(!parsed.success)return{error:parsed.error.issues[0]?.message??"Lien invalide"};const tokenHash=createHash("sha256").update(parsed.data.token).digest("hex");const record=await prisma.passwordResetToken.findFirst({where:{tokenHash,usedAt:null,expiresAt:{gt:new Date()}}});if(!record)return{error:"Ce lien est invalide ou expiré."};await prisma.$transaction([prisma.user.update({where:{id:record.userId},data:{passwordHash:await hash(parsed.data.password,12)}}),prisma.passwordResetToken.update({where:{id:record.id},data:{usedAt:new Date()}})]);redirect("/login?message=Mot de passe modifié");}

export async function verifyEmailToken(token:string){const tokenHash=createHash("sha256").update(token).digest("hex");const record=await prisma.emailVerificationToken.findFirst({where:{tokenHash,usedAt:null,expiresAt:{gt:new Date()}}});if(!record)return false;await prisma.$transaction([prisma.user.update({where:{id:record.userId},data:{emailVerifiedAt:new Date()}}),prisma.emailVerificationToken.update({where:{id:record.id},data:{usedAt:new Date()}})]);return true;}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email=String(formData.get("email")??"").trim().toLowerCase();
  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "E-mail ou mot de passe incorrect." };
    throw error;
  }
  const account=await prisma.user.findUnique({where:{email},select:{platformRole:true}});
  redirect(account?.platformRole==="SUPER_ADMIN"?"/admin":"/dashboard");
}
