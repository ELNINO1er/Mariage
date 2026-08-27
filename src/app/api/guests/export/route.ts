import { prisma } from "@/lib/prisma";
import { getCurrentMembership } from "@/server/auth/authorization";

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const membership = await getCurrentMembership();
  if (!membership) return new Response("Non autorisé", { status: 401 });
  const guests = await prisma.guest.findMany({
    where: { weddingId: membership.weddingId },
    include: { group: true, rsvp: true, assignment: { include: { table: true } }, checkIn: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  const rows = [
    ["Nom","Téléphone","E-mail","Groupe","Statut","Nombre attendu","Table","Check-in","Date confirmation"],
    ...guests.map((guest)=>[
      `${guest.firstName} ${guest.lastName}`, guest.phone, guest.email, guest.group?.name, guest.status,
      guest.rsvp?.guestCount ?? 0, guest.assignment?.table.name, guest.checkIn ? "Oui" : "Non", guest.rsvp?.respondedAt.toISOString() ?? "",
    ]),
  ];
  const csv = rows.map((row)=>row.map(csvCell).join(";")).join("\r\n");
  return new Response(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=invites-${membership.wedding.slug}.csv`, "Cache-Control": "no-store" } });
}
