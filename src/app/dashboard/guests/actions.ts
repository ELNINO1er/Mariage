"use server";

import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { importedGuestSchema, guestInputSchema, guestUpdateSchema } from "@/features/guests/guest-schema";
import { getCurrentMembership } from "@/server/auth/authorization";
import { assertCapacity, limitsFor } from "@/server/billing/plans";

export type GuestActionState = { ok?: boolean; error?: string; imported?: number; skipped?: number };

async function requireEditableWedding() {
  const membership = await getCurrentMembership();
  if (!membership) throw new Error("Mariage introuvable");
  if (!(["OWNER", "ADMIN", "ORGANIZER"] as const).includes(membership.role as "OWNER" | "ADMIN" | "ORGANIZER")) {
    throw new Error("Vous n’avez pas la permission de modifier les invités");
  }
  return membership.wedding;
}

async function validateGroup(weddingId: string, groupId?: string) {
  if (!groupId) return undefined;
  const group = await prisma.guestGroup.findFirst({ where: { id: groupId, weddingId }, select: { id: true } });
  if (!group) throw new Error("Groupe invalide pour ce mariage");
  return group.id;
}

function secureToken() {
  return randomBytes(32).toString("base64url");
}

function formValues(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createGuestAction(_state: GuestActionState, formData: FormData): Promise<GuestActionState> {
  const parsed = guestInputSchema.safeParse(formValues(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Informations invalides" };

  try {
    const wedding = await requireEditableWedding();
    const currentCount=await prisma.guest.count({where:{weddingId:wedding.id}});assertCapacity("d’invités",currentCount,1,limitsFor(wedding.plan).guests);
    const groupId = await validateGroup(wedding.id, parsed.data.groupId);
    if (parsed.data.email) {
      const duplicate = await prisma.guest.findFirst({ where: { weddingId: wedding.id, email: parsed.data.email }, select: { id: true } });
      if (duplicate) return { error: "Un invité utilise déjà cette adresse e-mail." };
    }

    await prisma.guest.create({
      data: {
        weddingId: wedding.id,
        ...parsed.data,
        groupId,
        invitation: { create: { token: secureToken(), checkInToken: secureToken() } },
        events: { create: { type: "CREATED" } },
      },
    });
    revalidatePath("/dashboard/guests");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Impossible d’ajouter cet invité" };
  }
}

export async function updateGuestAction(_state: GuestActionState, formData: FormData): Promise<GuestActionState> {
  const parsed = guestUpdateSchema.safeParse(formValues(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Informations invalides" };

  try {
    const wedding = await requireEditableWedding();
    const current = await prisma.guest.findFirst({ where: { id: parsed.data.id, weddingId: wedding.id }, select: { id: true } });
    if (!current) return { error: "Invité introuvable" };
    const groupId = await validateGroup(wedding.id, parsed.data.groupId);
    if (parsed.data.email) {
      const duplicate = await prisma.guest.findFirst({ where: { weddingId: wedding.id, email: parsed.data.email, NOT: { id: parsed.data.id } }, select: { id: true } });
      if (duplicate) return { error: "Un invité utilise déjà cette adresse e-mail." };
    }
    const { id, ...data } = parsed.data;
    await prisma.guest.update({ where: { id }, data: { ...data, groupId } });
    revalidatePath("/dashboard/guests");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Impossible de modifier cet invité" };
  }
}

export async function deleteGuestAction(formData: FormData) {
  const guestId = z.string().cuid().safeParse(formData.get("id"));
  if (!guestId.success) return;
  const wedding = await requireEditableWedding();
  await prisma.guest.deleteMany({ where: { id: guestId.data, weddingId: wedding.id } });
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
}

export async function importGuestsAction(_state: GuestActionState, formData: FormData): Promise<GuestActionState> {
  const raw = formData.get("guests");
  if (typeof raw !== "string" || raw.length > 1_000_000) return { error: "Fichier invalide ou trop volumineux" };
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return { error: "Contenu CSV invalide" }; }
  const parsed = z.array(importedGuestSchema).min(1).max(1000).safeParse(json);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Import invalide" };

  try {
    const wedding = await requireEditableWedding();
    const [groups, existingGuests] = await Promise.all([
      prisma.guestGroup.findMany({ where: { weddingId: wedding.id }, select: { id: true, name: true } }),
      prisma.guest.findMany({ where: { weddingId: wedding.id }, select: { email: true, phone: true } }),
    ]);
    const groupMap = new Map(groups.map((group) => [group.name.toLocaleLowerCase("fr"), group.id]));
    const seen = new Set(existingGuests.flatMap((guest) => [guest.email && `e:${guest.email.toLowerCase()}`, guest.phone && `p:${guest.phone}`].filter(Boolean) as string[]));
    const accepted = parsed.data.filter((guest) => {
      const keys = [guest.email && `e:${guest.email}`, guest.phone && `p:${guest.phone}`].filter(Boolean) as string[];
      if (keys.some((key) => seen.has(key))) return false;
      keys.forEach((key) => seen.add(key));
      return true;
    });
    assertCapacity("d’invités",existingGuests.length,accepted.length,limitsFor(wedding.plan).guests);

    await prisma.$transaction(accepted.map((guest) => prisma.guest.create({
      data: {
        weddingId: wedding.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        maxGuests: guest.maxGuests,
        notes: guest.notes,
        groupId: guest.groupName ? groupMap.get(guest.groupName.toLocaleLowerCase("fr")) : undefined,
        invitation: { create: { token: secureToken(), checkInToken: secureToken() } },
        events: { create: { type: "CREATED", metadata: { source: "csv" } } },
      },
    })));
    revalidatePath("/dashboard/guests");
    revalidatePath("/dashboard");
    return { ok: true, imported: accepted.length, skipped: parsed.data.length - accepted.length };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) return { error: "Une donnée importée existe déjà." };
    return { error: error instanceof Error ? error.message : "Import impossible" };
  }
}
