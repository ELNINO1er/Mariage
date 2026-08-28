"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentMembership } from "@/server/auth/authorization";
import { limitsFor } from "@/server/billing/plans";
import { sendEmail } from "@/server/notifications/email";

export type ReminderResult = { ok: boolean; error?: string; url?: string };

const reminderSchema = z.object({ guestId: z.string().cuid(), channel: z.enum(["whatsapp", "email"]) });

export async function prepareReminderAction(input: { guestId: string; channel: "whatsapp" | "email" }): Promise<ReminderResult> {
  const parsed = reminderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Relance invalide" };
  const membership = await getCurrentMembership();
  if (!membership) return { ok: false, error: "Mariage introuvable" };
  if (!(["OWNER", "ADMIN", "ORGANIZER"] as string[]).includes(membership.role)) return { ok: false, error: "Permission insuffisante" };
  const startOfDay=new Date();startOfDay.setHours(0,0,0,0);const sentToday=await prisma.invitationEvent.count({where:{guest:{weddingId:membership.weddingId},type:"REMINDER_SENT",createdAt:{gte:startOfDay}}});if(sentToday>=limitsFor(membership.wedding.plan).remindersPerDay)return{ok:false,error:"Limite quotidienne de relances atteinte pour votre abonnement."};

  const guest = await prisma.guest.findFirst({
    where: { id: parsed.data.guestId, weddingId: membership.weddingId, status: "PENDING" },
    select: {
      id: true, firstName: true, email: true, phone: true,
      invitation: { select: { id: true, token: true } },
      wedding: { select: { slug: true, partnerOne: true, partnerTwo: true, rsvpDeadline: true } },
    },
  });
  if (!guest?.invitation) return { ok: false, error: "Invitation introuvable ou réponse déjà reçue" };
  const contact = parsed.data.channel === "whatsapp" ? guest.phone : guest.email;
  if (!contact) return { ok: false, error: parsed.data.channel === "whatsapp" ? "Aucun numéro de téléphone renseigné" : "Aucune adresse e-mail renseignée" };

  const baseUrl = (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const inviteUrl = `${baseUrl}/w/${guest.wedding.slug}/invite/${guest.invitation.token}`;
  const deadline = guest.wedding.rsvpDeadline ? ` avant le ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Africa/Abidjan" }).format(guest.wedding.rsvpDeadline)}` : "";
  const message = `Bonjour ${guest.firstName},\n\nLe mariage de ${guest.wedding.partnerOne} & ${guest.wedding.partnerTwo} approche ❤️.\nNous n’avons pas encore reçu votre confirmation. Merci de nous répondre${deadline}.\n\n${inviteUrl}`;
  let url = parsed.data.channel === "whatsapp"
    ? `https://wa.me/${contact.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    : `mailto:${encodeURIComponent(contact)}?subject=${encodeURIComponent(`Confirmation — Mariage de ${guest.wedding.partnerOne} & ${guest.wedding.partnerTwo}`)}&body=${encodeURIComponent(message)}`;

  if(parsed.data.channel==="email"){
    const delivery=await sendEmail({to:contact,subject:"Confirmation — Mariage de "+guest.wedding.partnerOne+" & "+guest.wedding.partnerTwo,text:message,html:"<p>"+message.replace(/\n/g,"<br>")+"</p>"});
    if(!delivery.sent)return{ok:false,error:delivery.error};
    url="";
  }
  const now = new Date();
  await prisma.$transaction([
    prisma.invitation.update({ where: { id: guest.invitation.id }, data: { lastReminderAt: now } }),
    prisma.invitationEvent.create({ data: { guestId: guest.id, type: "REMINDER_SENT", metadata: { channel: parsed.data.channel } } }),
  ]);
  revalidatePath("/dashboard/rsvp");
  revalidatePath("/dashboard");
  return { ok: true, url };
}
