import { prisma } from "@/lib/prisma";

export async function getTablePlanner(weddingId: string) {
  const [tables, unassigned, confirmedCount, expected] = await Promise.all([
    prisma.weddingTable.findMany({
      where: { weddingId },
      select: {
        id: true, name: true, number: true, capacity: true, description: true,
        assignments: {
          select: {
            id: true, seats: true,
            guest: { select: { id: true, firstName: true, lastName: true, group: { select: { name: true } }, rsvp: { select: { guestCount: true } } } },
          },
          orderBy: { guest: { lastName: "asc" } },
        },
      },
      orderBy: [{ number: "asc" }, { name: "asc" }],
    }),
    prisma.guest.findMany({
      where: { weddingId, status: "CONFIRMED", assignment: null, rsvp: { guestCount: { gt: 0 } } },
      select: { id: true, firstName: true, lastName: true, group: { select: { name: true } }, rsvp: { select: { guestCount: true } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.guest.count({ where: { weddingId, status: "CONFIRMED" } }),
    prisma.rsvp.aggregate({ where: { guest: { weddingId }, status: "CONFIRMED" }, _sum: { guestCount: true } }),
  ]);
  const assignedSeats = tables.reduce((sum, table) => sum + table.assignments.reduce((tableSum, assignment) => tableSum + assignment.seats, 0), 0);
  return { tables, unassigned, confirmedCount, expectedSeats: expected._sum.guestCount ?? 0, assignedSeats };
}
