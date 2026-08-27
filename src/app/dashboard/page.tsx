import { ArrowUpRight, Clock3, MailCheck, UserCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentMembership } from "@/server/auth/authorization";

export default async function DashboardPage() {
  const membership = await getCurrentMembership();
  if (!membership) return null;
  const weddingId = membership.weddingId;
  const [total, confirmed, declined, invitationsSent, expected, groups] = await Promise.all([
    prisma.guest.count({ where: { weddingId } }),
    prisma.guest.count({ where: { weddingId, status: "CONFIRMED" } }),
    prisma.guest.count({ where: { weddingId, status: "DECLINED" } }),
    prisma.invitation.count({ where: { guest: { weddingId }, sentAt: { not: null } } }),
    prisma.rsvp.aggregate({ where: { guest: { weddingId }, status: "CONFIRMED" }, _sum: { guestCount: true } }),
    prisma.guestGroup.findMany({ where: { weddingId }, select: { name: true, _count: { select: { guests: true } } }, orderBy: { name: "asc" } }),
  ]);
  const pending = Math.max(0, total - confirmed - declined);
  const responseRate = total ? Math.round(((confirmed + declined) / total) * 1000) / 10 : 0;
  const metrics = [
    { label: "Invitations envoyées", value: invitationsSent.toLocaleString("fr-FR"), icon: MailCheck },
    { label: "Invitations confirmées", value: confirmed.toLocaleString("fr-FR"), icon: UserCheck },
    { label: "Personnes attendues", value: (expected._sum.guestCount ?? 0).toLocaleString("fr-FR"), icon: Users },
    { label: "Taux de réponse", value: `${responseRate.toLocaleString("fr-FR")} %`, icon: ArrowUpRight },
  ];
  const distribution = [
    { label: "Confirmés", value: confirmed, color: "#49372f" },
    { label: "Absents", value: declined, color: "#b99d88" },
    { label: "En attente", value: pending, color: "#e7d9c8" },
  ];

  return <div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Vue d’ensemble</p><h1 className="serif mt-2 text-4xl sm:text-5xl">Votre mariage en un regard</h1></div><a href="/dashboard/guests" className="button-primary">Gérer les invités</a></div>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({label,value,icon:Icon})=><article key={label} className="rounded-2xl border border-[var(--beige)] bg-white p-6"><div className="flex items-center justify-between"><p className="text-xs text-[var(--caramel)]">{label}</p><Icon size={17}/></div><p className="serif mt-7 text-4xl">{value}</p></article>)}</section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.8fr]"><article className="min-h-80 rounded-2xl border border-[var(--beige)] bg-white p-6"><h2 className="serif text-2xl">Répartition RSVP</h2>{total === 0 ? <div className="grid h-52 place-items-center text-center text-sm text-[var(--caramel)]">Ajoutez vos premiers invités pour afficher les statistiques.</div> : <div className="mt-10 flex h-40 items-end gap-5">{distribution.map(({label,value,color})=>{ const percent=Math.round(value/total*100); return <div key={label} className="flex flex-1 flex-col items-center gap-3"><span className="text-sm">{percent}%</span><div className="w-full max-w-28 rounded-t-2xl" style={{height:`${Math.max(8,percent*1.6)}px`,background:color}}/><span className="text-xs text-[var(--caramel)]">{label}</span></div>; })}</div>}<div className="mt-7 flex flex-wrap gap-4 border-t border-[var(--beige)] pt-5 text-xs text-[var(--caramel)]">{groups.map((group)=><span key={group.name}>{group.name} : <strong className="text-[var(--brown)]">{group._count.guests}</strong></span>)}</div></article>
      <article className="rounded-2xl bg-[var(--brown)] p-7 text-white"><Clock3 className="text-[var(--beige)]"/><p className="eyebrow mt-8 !text-[var(--beige)]">À relancer</p><p className="serif mt-3 text-5xl">{pending}</p><p className="mt-2 text-sm leading-6 text-white/65">invité{pending>1?"s":""} n’ont pas encore répondu à votre invitation.</p><a href="/dashboard/guests?status=PENDING" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm text-[var(--brown)]">Voir les invités</a></article></section>
  </div>;
}
