import QRCode from "qrcode";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkInPayload } from "@/features/checkin/checkin-token";

export async function GET(_request: Request, context: { params: Promise<{ guestId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Non autorisé", { status: 401 });
  const { guestId } = await context.params;
  const parsed = z.string().cuid().safeParse(guestId);
  if (!parsed.success) return new Response("QR invalide", { status: 400 });
  const invitation = await prisma.invitation.findFirst({
    where: { guestId: parsed.data, checkInToken: { not: null }, guest: { wedding: { members: { some: { userId: session.user.id } } } } },
    select: { checkInToken: true },
  });
  if (!invitation?.checkInToken) return new Response("QR introuvable", { status: 404 });
  const png = await QRCode.toBuffer(checkInPayload(invitation.checkInToken), { type: "png", errorCorrectionLevel: "M", margin: 1, width: 240, color: { dark: "#49372f", light: "#ffffff" } });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" } });
}
