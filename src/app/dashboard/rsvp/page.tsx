import { Suspense } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, UserX, Users } from "lucide-react";
import type { RsvpStatus } from "@prisma/client";
import { GuestSearch } from "@/components/guests/guest-search";
import { ReminderButtons } from "@/components/rsvp/reminder-buttons";
import { RsvpTimeline } from "@/components/rsvp/rsvp-timeline";
import { getRsvpGuests } from "@/features/rsvp/rsvp-data";
import { getCurrentMembership } from "@/server/auth/authorization";

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };
const statuses = ["PENDING","CONFIRMED","DECLINED"] as const;
const labels: Record<RsvpStatus,string> = { PENDING:"En attente", CONFIRMED:"Confirmé", DECLINED:"Absent" };

export default async function RsvpPage({ searchParams }: Props) {
  const membership = await getCurrentMembership();
  if (!membership) return null;
  const params = await searchParams;
  const status = statuses.includes(params.status as RsvpStatus) ? params.status as RsvpStatus : undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getRsvpGuests(membership.weddingId, { page, pageSize: 25, query: params.q?.trim(), status });
  const canRemind = ["OWNER","ADMIN","ORGANIZER"].includes(membership.role);
  const url = (changes: Record<string,string|undefined>) => { const next=new URLSearchParams(Object.entries(params).filter((item):item is [string,string]=>Boolean(item[1]))); Object.entries(changes).forEach(([key,value])=>value?next.set(key,value):next.delete(key)); return `/dashboard/rsvp?${next}`; };
  const tabs = [{status:undefined,label:"Tous",count:Object.values(data.statusCounts).reduce((sum,count)=>sum+count,0)},{status:"CONFIRMED",label:"Confirmés",count:data.statusCounts.CONFIRMED},{status:"DECLINED",label:"Absents",count:data.statusCounts.DECLINED},{status:"PENDING",label:"En attente",count:data.statusCounts.PENDING}] as const;

  return <div className="mx-auto max-w-7xl"><div><p className="eyebrow">Confirmations</p><h1 className="serif mt-2 text-4xl sm:text-5xl">Suivi RSVP</h1><p className="mt-3 text-sm text-[var(--caramel)]">Suivez chaque réponse et relancez les invités qui n’ont pas encore confirmé.</p></div>
    <section className="mt-8 grid gap-4 sm:grid-cols-3"><Stat icon={CheckCircle2} label="Confirmés" value={data.statusCounts.CONFIRMED}/><Stat icon={UserX} label="Absents" value={data.statusCounts.DECLINED}/><Stat icon={Clock3} label="Sans réponse" value={data.statusCounts.PENDING}/></section>
    <div className="mt-7 flex gap-2 overflow-x-auto pb-2">{tabs.map((tab)=><a key={tab.label} href={url({status:tab.status,page:undefined})} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm ${status===tab.status?"bg-[var(--brown)] text-white":"border border-[var(--beige)] bg-white"}`}>{tab.label} <span className="ml-1 opacity-65">{tab.count}</span></a>)}</div>
    <section className="mt-4 rounded-2xl border border-[var(--beige)] bg-white p-4"><Suspense><GuestSearch initialValue={params.q ?? ""}/></Suspense></section>
    {data.guests.length===0 ? <div className="mt-6 grid min-h-72 place-items-center rounded-2xl border border-dashed border-[var(--taupe)] bg-white/50 text-center"><div><Users className="mx-auto text-[var(--taupe)]"/><h2 className="serif mt-4 text-3xl">Aucune réponse trouvée</h2></div></div> : <div className="mt-6 space-y-3">{data.guests.map((guest)=><article key={guest.id} className="grid gap-5 rounded-2xl border border-[var(--beige)] bg-white p-5 lg:grid-cols-[1.1fr_.7fr_.7fr_1fr] lg:items-center"><div><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ivory)] font-semibold">{guest.firstName[0]}{guest.lastName[0]}</div><div><h2 className="font-semibold">{guest.firstName} {guest.lastName}</h2><p className="text-xs text-[var(--caramel)]">{guest.group?.name ?? "Sans groupe"} · {guest.email || guest.phone || "Aucun contact"}</p></div></div></div><div><span className={`rounded-full px-3 py-1.5 text-xs ${guest.status==="CONFIRMED"?"bg-emerald-50 text-emerald-800":guest.status==="DECLINED"?"bg-red-50 text-red-700":"bg-amber-50 text-amber-800"}`}>{labels[guest.status]}</span>{guest.rsvp && <p className="mt-2 text-xs text-[var(--caramel)]">{guest.rsvp.guestCount} personne{guest.rsvp.guestCount>1?"s":""} · {guest.rsvp.childrenCount} enfant{guest.rsvp.childrenCount>1?"s":""}</p>}</div><div><RsvpTimeline guestName={`${guest.firstName} ${guest.lastName}`} events={guest.events}/>{guest.invitation?.lastReminderAt && <p className="mt-2 text-xs text-[var(--caramel)]">Dernière relance : {new Intl.DateTimeFormat("fr-FR",{dateStyle:"short"}).format(new Date(guest.invitation.lastReminderAt))}</p>}</div><div>{guest.status==="PENDING" && canRemind ? <ReminderButtons guestId={guest.id} hasPhone={Boolean(guest.phone)} hasEmail={Boolean(guest.email)}/> : guest.rsvp?.message ? <blockquote className="line-clamp-3 border-l-2 border-[var(--gold)] pl-3 text-xs italic text-[var(--caramel)]">“{guest.rsvp.message}”</blockquote> : <span className="text-xs text-[var(--caramel)]">—</span>}</div></article>)}</div>}
    <footer className="mt-6 flex items-center justify-between text-sm"><p>{data.total} résultat{data.total>1?"s":""} · page {page}/{data.pageCount}</p><div className="flex gap-2"><a aria-disabled={page<=1} href={url({page:String(page-1)})} className={`button-secondary !p-2 ${page<=1?"pointer-events-none opacity-40":""}`}><ChevronLeft size={17}/></a><a aria-disabled={page>=data.pageCount} href={url({page:String(page+1)})} className={`button-secondary !p-2 ${page>=data.pageCount?"pointer-events-none opacity-40":""}`}><ChevronRight size={17}/></a></div></footer>
  </div>;
}

function Stat({icon:Icon,label,value}:{icon:typeof CheckCircle2;label:string;value:number}) { return <article className="rounded-2xl border border-[var(--beige)] bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-[var(--caramel)]">{label}</p><Icon size={17}/></div><p className="serif mt-5 text-4xl">{value}</p></article>; }
