"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";

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

  await prisma.user.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      passwordHash: await hash(parsed.data.password, 12),
    },
  });

  await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirect: false });
  redirect("/onboarding");
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "E-mail ou mot de passe incorrect." };
    throw error;
  }
  redirect("/dashboard");
}
