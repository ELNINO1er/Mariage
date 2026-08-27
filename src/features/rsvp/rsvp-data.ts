import type { Prisma, RsvpStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type RsvpFilters = { page: number; pageSize: number; query?: string; status?: RsvpStatus };

export async function getRsvpGuests(weddingId: string, filters: RsvpFilters) {
  const where: Prisma.GuestWhereInput = {
    weddingId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.query ? { OR: [
      { firstName: { contains: filters.query } }, { lastName: { contains: filters.query } },
      { email: { contains: filters.query } }, { phone: { contains: filters.query } },
    ] } : {}),
  };
  const [guests, total, counts] = await Promise.all([
    prisma.guest.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true, status: true, maxGuests: true,
        group: { select: { name: true } },
        invitation: { select: { token: true, sentAt: true, openedAt: true, lastReminderAt: true } },
        rsvp: { select: { guestCount: true, childrenCount: true, contactPhone: true, message: true, respondedAt: true, updatedAt: true } },
        events: { select: { id: true, type: true, metadata: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 20 },
      },
      orderBy: [{ status: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.guest.count({ where }),
    prisma.guest.groupBy({ by: ["status"], where: { weddingId }, _count: { _all: true } }),
  ]);
  const statusCounts = { PENDING: 0, CONFIRMED: 0, DECLINED: 0 };
  counts.forEach((count) => { statusCounts[count.status] = count._count._all; });
  return {
    total,
    statusCounts,
    pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
    guests: guests.map((guest) => ({
      ...guest,
      invitation: guest.invitation ? {
        ...guest.invitation,
        sentAt: guest.invitation.sentAt?.toISOString() ?? null,
        openedAt: guest.invitation.openedAt?.toISOString() ?? null,
        lastReminderAt: guest.invitation.lastReminderAt?.toISOString() ?? null,
      } : null,
      rsvp: guest.rsvp ? {
        ...guest.rsvp,
        respondedAt: guest.rsvp.respondedAt.toISOString(),
        updatedAt: guest.rsvp.updatedAt.toISOString(),
      } : null,
      events: guest.events.map((event) => ({ ...event, createdAt: event.createdAt.toISOString() })),
    })),
  };
}
