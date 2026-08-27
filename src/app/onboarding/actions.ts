"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth/authorization";

export type OnboardingState = { error?: string };

const weddingSchema = z.object({
  partnerOne: z.string().trim().min(2).max(80),
  partnerTwo: z.string().trim().min(2).max(80),
  weddingDate: z.coerce.date().refine((date) => date > new Date(), "La date doit être dans le futur"),
  city: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100),
  theme: z.enum(["editorial", "floral", "minimal"]),
  accentColor: z.enum(["caramel", "rose", "sage", "navy", "gold"]),
  siteLayout: z.enum(["editorial", "cinematic", "minimal"]),
});

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function createWeddingAction(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await requireUser();
  const parsed = weddingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Informations invalides" };

  const existingMembership = await prisma.weddingMember.findFirst({ where: { userId: user.id }, select: { id: true } });
  if (existingMembership) redirect("/dashboard");

  const baseSlug = slugify(`${parsed.data.partnerOne}-${parsed.data.partnerTwo}`);
  await prisma.wedding.create({
    data: {
      ...parsed.data,
      slug: `${baseSlug}-${randomBytes(3).toString("hex")}`,
      groups: { create: ["Famille mariée", "Famille marié", "Amis", "Travail", "VIP", "Autres"].map((name) => ({ name })) },
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });
  redirect("/dashboard");
}
