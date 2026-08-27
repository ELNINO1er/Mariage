import type { Prisma, RsvpStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PAGE_SIZES = [25, 50, 100] as const;

export type GuestFilters = {
  page: number;
  pageSize: number;
  query?: string;
  status?: RsvpStatus;
  groupId?: string;
};

export async function getGuests(weddingId: string, filters: GuestFilters) {
  const where: Prisma.GuestWhereInput = {
    weddingId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.groupId ? { groupId: filters.groupId } : {}),
    ...(filters.query ? {
      OR: [
        { firstName: { contains: filters.query } },
        { lastName: { contains: filters.query } },
        { email: { contains: filters.query } },
        { phone: { contains: filters.query } },
      ],
    } : {}),
  };

  const [guests, total, groups] = await Promise.all([
    prisma.guest.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        maxGuests: true, notes: true, status: true, createdAt: true,
        group: { select: { id: true, name: true } },
        invitation: { select: { token: true, sentAt: true, openedAt: true } },
        rsvp: { select: { guestCount: true, respondedAt: true } },
        assignment: { select: { table: { select: { name: true } } } },
      },
      orderBy: [{ createdAt: "desc" }, { lastName: "asc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.guest.count({ where }),
    prisma.guestGroup.findMany({ where: { weddingId }, orderBy: { name: "asc" } }),
  ]);

  return {
    guests: guests.map((guest) => ({
      ...guest,
      createdAt: guest.createdAt.toISOString(),
      invitation: guest.invitation ? {
        ...guest.invitation,
        sentAt: guest.invitation.sentAt?.toISOString() ?? null,
        openedAt: guest.invitation.openedAt?.toISOString() ?? null,
      } : null,
      rsvp: guest.rsvp ? { ...guest.rsvp, respondedAt: guest.rsvp.respondedAt.toISOString() } : null,
    })),
    groups,
    total,
    pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}
