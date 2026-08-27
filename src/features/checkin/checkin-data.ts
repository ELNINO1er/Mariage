import "server-only";

import { prisma } from "@/lib/prisma";

export async function getCheckInDashboard(weddingId: string) {
  const guests = await prisma.guest.findMany({
    where: { weddingId, status: "CONFIRMED" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rsvp: { select: { guestCount: true } },
      invitation: { select: { checkInToken: true } },
      assignment: { select: { table: { select: { name: true } } } },
      checkIn: { select: { checkedInAt: true, guestCount: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const rows = guests.map((guest) => ({
    id: guest.id,
    firstName: guest.firstName,
    lastName: guest.lastName,
    expectedCount: guest.rsvp?.guestCount ?? 1,
    tableName: guest.assignment?.table.name ?? null,
    checkedInAt: guest.checkIn?.checkedInAt.toISOString() ?? null,
    checkedInCount: guest.checkIn?.guestCount ?? null,
    hasQrCode: Boolean(guest.invitation?.checkInToken),
    qrUrl: guest.invitation?.checkInToken ? `/api/checkin/qr/${guest.id}` : null,
  }));

  return {
    guests: rows,
    expectedPeople: rows.reduce((sum, guest) => sum + guest.expectedCount, 0),
    checkedInPeople: rows.reduce((sum, guest) => sum + (guest.checkedInCount ?? 0), 0),
    checkedInInvitations: rows.filter((guest) => guest.checkedInAt).length,
    missingTokens: rows.filter((guest) => !guest.hasQrCode).length,
  };
}
