"use server";

import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentMembership, requireUser } from "@/server/auth/authorization";
import { extractCheckInToken } from "@/features/checkin/checkin-token";

export type CheckInResult = {
  ok: boolean;
  error?: string;
  alreadyCheckedIn?: boolean;
  guest?: { id: string; name: string; guestCount: number; tableName: string | null; checkedInAt: string };
};

const tokenSchema = z.string().trim().min(32).max(160);
const guestSchema = z.object({ guestId: z.string().cuid(), guestCount: z.number().int().min(1).max(100) });

async function requireCheckInAccess() {
  const [membership, user] = await Promise.all([getCurrentMembership(), requireUser()]);
  if (!membership) throw new Error("Mariage introuvable");
  if (!( ["OWNER", "ADMIN", "ORGANIZER", "CHECKIN_STAFF"] as string[]).includes(membership.role)) throw new Error("Permission insuffisante");
  return { membership, user };
}

async function saveCheckIn(guestId: string, guestCount: number): Promise<CheckInResult> {
  const { membership, user } = await requireCheckInAccess();
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const guest = await transaction.guest.findFirst({
        where: { id: guestId, weddingId: membership.weddingId, status: "CONFIRMED" },
        select: { id: true, firstName: true, lastName: true, rsvp: { select: { guestCount: true } }, assignment: { select: { table: { select: { name: true } } } }, checkIn: true },
      });
      if (!guest) return { ok: false, error: "Invité confirmé introuvable." } as CheckInResult;
      const expected = guest.rsvp?.guestCount ?? 1;
      if (guestCount > expected) return { ok: false, error: `Ce RSVP prévoit ${expected} personne${expected > 1 ? "s" : ""}.` } as CheckInResult;
      if (guest.checkIn) {
        return { ok: true, alreadyCheckedIn: true, guest: { id: guest.id, name: `${guest.firstName} ${guest.lastName}`, guestCount: guest.checkIn.guestCount, tableName: guest.assignment?.table.name ?? null, checkedInAt: guest.checkIn.checkedInAt.toISOString() } } as CheckInResult;
      }
      const checkIn = await transaction.checkIn.create({ data: { guestId: guest.id, checkedInAt: new Date(), checkedInBy: user.id, guestCount } });
      await transaction.invitationEvent.create({ data: { guestId: guest.id, type: "CHECKED_IN", metadata: { guestCount, checkedInBy: user.id } } });
      return { ok: true, guest: { id: guest.id, name: `${guest.firstName} ${guest.lastName}`, guestCount, tableName: guest.assignment?.table.name ?? null, checkedInAt: checkIn.checkedInAt.toISOString() } } as CheckInResult;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { ok: false, error: "Cet invité vient déjà d’être pointé." };
    return { ok: false, error: error instanceof Error ? error.message : "Check-in impossible" };
  } finally {
    revalidatePath("/dashboard/checkin");
    revalidatePath("/dashboard");
  }
}

export async function scanCheckInAction(rawValue: string): Promise<CheckInResult> {
  const parsed = tokenSchema.safeParse(extractCheckInToken(rawValue));
  if (!parsed.success) return { ok: false, error: "QR code invalide." };
  const { membership } = await requireCheckInAccess();
  const invitation = await prisma.invitation.findFirst({
    where: { checkInToken: parsed.data, guest: { weddingId: membership.weddingId } },
    select: { guestId: true, guest: { select: { rsvp: { select: { guestCount: true } } } } },
  });
  if (!invitation) return { ok: false, error: "Ce QR code n’appartient pas à ce mariage." };
  await prisma.invitationEvent.create({ data: { guestId: invitation.guestId, type: "QR_SCANNED" } });
  return saveCheckIn(invitation.guestId, invitation.guest.rsvp?.guestCount ?? 1);
}

export async function manualCheckInAction(input: { guestId: string; guestCount: number }): Promise<CheckInResult> {
  const parsed = guestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Informations de pointage invalides." };
  return saveCheckIn(parsed.data.guestId, parsed.data.guestCount);
}

export async function undoCheckInAction(guestId: string): Promise<CheckInResult> {
  const parsed = z.string().cuid().safeParse(guestId);
  if (!parsed.success) return { ok: false, error: "Invité invalide." };
  const { membership } = await requireCheckInAccess();
  const result = await prisma.checkIn.deleteMany({ where: { guestId: parsed.data, guest: { weddingId: membership.weddingId } } });
  revalidatePath("/dashboard/checkin");
  revalidatePath("/dashboard");
  return result.count ? { ok: true } : { ok: false, error: "Aucun check-in à annuler." };
}

export async function generateMissingQrCodesAction(): Promise<CheckInResult> {
  const { membership } = await requireCheckInAccess();
  if (!( ["OWNER", "ADMIN", "ORGANIZER"] as string[]).includes(membership.role)) return { ok: false, error: "Permission insuffisante." };
  const invitations = await prisma.invitation.findMany({ where: { checkInToken: null, guest: { weddingId: membership.weddingId } }, select: { id: true } });
  await prisma.$transaction(invitations.map((invitation) => prisma.invitation.update({ where: { id: invitation.id }, data: { checkInToken: randomBytes(32).toString("base64url") } })));
  revalidatePath("/dashboard/checkin");
  return { ok: true };
}
