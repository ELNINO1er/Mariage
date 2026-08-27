"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";

export type RsvpActionState = {
  ok?: boolean;
  error?: string;
  status?: "CONFIRMED" | "DECLINED";
  guestCount?: number;
  updatedAt?: string;
};

const optionalText = (maximum: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(maximum).optional(),
);

const rsvpSchema = z.object({
  weddingSlug: z.string().trim().min(1).max(191),
  token: z.string().min(32).max(96),
  status: z.enum(["CONFIRMED", "DECLINED"]),
  guestCount: z.coerce.number().int().min(0).max(20),
  childrenCount: z.coerce.number().int().min(0).max(20),
  contactPhone: optionalText(40),
  message: optionalText(1000),
  companions: z.array(z.string().trim().min(2).max(120)).max(19),
});

export async function submitRsvpAction(_state: RsvpActionState, formData: FormData): Promise<RsvpActionState> {
  const parsed = rsvpSchema.safeParse({
    weddingSlug: formData.get("weddingSlug"),
    token: formData.get("token"),
    status: formData.get("status"),
    guestCount: formData.get("guestCount") ?? 0,
    childrenCount: formData.get("childrenCount") ?? 0,
    contactPhone: formData.get("contactPhone"),
    message: formData.get("message"),
    companions: formData.getAll("companions"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Réponse invalide" };

  const rateLimit = consumeRateLimit("rsvp", parsed.data.token);
  if (!rateLimit.allowed) return { error: `Trop de tentatives. Réessayez dans ${rateLimit.retryAfterSeconds} secondes.` };

  const invitation = await prisma.invitation.findFirst({
    where: { token: parsed.data.token, guest: { wedding: { slug: parsed.data.weddingSlug } } },
    select: { guestId: true, guest: { select: { maxGuests: true, rsvp: { select: { id: true } } } } },
  });
  if (!invitation) return { error: "Invitation introuvable ou expirée." };

  const confirmed = parsed.data.status === "CONFIRMED";
  const guestCount = confirmed ? parsed.data.guestCount : 0;
  const childrenCount = confirmed ? parsed.data.childrenCount : 0;
  const companions = confirmed ? parsed.data.companions : [];
  if (confirmed && (guestCount < 1 || guestCount > invitation.guest.maxGuests)) return { error: `Cette invitation autorise au maximum ${invitation.guest.maxGuests} personne(s).` };
  if (childrenCount > guestCount) return { error: "Le nombre d’enfants ne peut pas dépasser le nombre de personnes présentes." };
  if (companions.length > Math.max(0, guestCount - 1)) return { error: "Le nombre d’accompagnateurs dépasse le nombre de places sélectionné." };

  const now = new Date();
  await prisma.$transaction(async (transaction) => {
    await transaction.guest.update({ where: { id: invitation.guestId }, data: { status: parsed.data.status } });
    await transaction.rsvp.upsert({
      where: { guestId: invitation.guestId },
      create: { guestId: invitation.guestId, status: parsed.data.status, guestCount, childrenCount, contactPhone: parsed.data.contactPhone, message: parsed.data.message, respondedAt: now },
      update: { status: parsed.data.status, guestCount, childrenCount, contactPhone: parsed.data.contactPhone, message: parsed.data.message },
    });
    await transaction.companion.deleteMany({ where: { guestId: invitation.guestId } });
    if (companions.length) await transaction.companion.createMany({ data: companions.map((name) => ({ guestId: invitation.guestId, name })) });
    await transaction.invitationEvent.create({
      data: {
        guestId: invitation.guestId,
        type: invitation.guest.rsvp ? "RSVP_UPDATED" : "RSVP_SUBMITTED",
        metadata: { status: parsed.data.status, guestCount, childrenCount },
      },
    });
  });

  revalidatePath(`/w/${parsed.data.weddingSlug}/invite/${parsed.data.token}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/guests");
  return { ok: true, status: parsed.data.status, guestCount, updatedAt: now.toISOString() };
}
