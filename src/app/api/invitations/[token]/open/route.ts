import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token.length < 32 || token.length > 96) return Response.json({ ok: false }, { status: 404 });

  const invitation = await prisma.invitation.findUnique({ where: { token }, select: { id: true, guestId: true, openedAt: true } });
  if (!invitation) return Response.json({ ok: false }, { status: 404 });
  if (!invitation.openedAt) {
    await prisma.$transaction([
      prisma.invitation.update({ where: { id: invitation.id }, data: { openedAt: new Date() } }),
      prisma.invitationEvent.create({ data: { guestId: invitation.guestId, type: "OPENED" } }),
    ]);
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
