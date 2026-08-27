import { prisma } from "@/lib/prisma";

function icsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replaceAll("\n", "\\n");
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token.length < 32 || token.length > 96) return new Response("Invitation introuvable", { status: 404 });
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    select: { guest: { select: { wedding: { select: { partnerOne: true, partnerTwo: true, weddingDate: true, venues: { take: 1, orderBy: { startsAt: "asc" } } } } } } },
  });
  if (!invitation) return new Response("Invitation introuvable", { status: 404 });
  const wedding = invitation.guest.wedding;
  const end = new Date(wedding.weddingDate.getTime() + 8 * 60 * 60 * 1000);
  const location = wedding.venues[0]?.address ?? "";
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Noces//Invitation mariage//FR","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:${token}@noces`,`DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(wedding.weddingDate)}`,`DTEND:${icsDate(end)}`,`SUMMARY:${escapeIcs(`Mariage de ${wedding.partnerOne} & ${wedding.partnerTwo}`)}`,`LOCATION:${escapeIcs(location)}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  return new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename=mariage-${wedding.partnerOne.toLowerCase()}-${wedding.partnerTwo.toLowerCase()}.ics`, "Cache-Control": "private, no-store" } });
}
