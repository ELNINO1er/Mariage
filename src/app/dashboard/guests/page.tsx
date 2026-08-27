import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Download, Link2, UsersRound } from "lucide-react";
import type { RsvpStatus } from "@prisma/client";
import { DeleteGuestButton } from "@/components/guests/delete-guest-button";
import { CopyInvitationButton } from "@/components/guests/copy-invitation-button";
import { GuestFormDialog } from "@/components/guests/guest-form-dialog";
import { GuestSearch } from "@/components/guests/guest-search";
import { ImportGuestsDialog } from "@/components/guests/import-guests-dialog";
import { StyledSelect } from "@/components/ui/styled-select";
import { getGuests, PAGE_SIZES } from "@/features/guests/guest-data";
import { getCurrentMembership } from "@/server/auth/authorization";

type Props = { searchParams: Promise<{ q?: string; status?: string; group?: string; page?: string; size?: string }> };
const statuses = ["PENDING", "CONFIRMED", "DECLINED"] as const;
const labels: Record<RsvpStatus,string> = { PENDING:"En attente", CONFIRMED:"Confirmé", DECLINED:"Absent" };

export default async function GuestsPage({ searchParams }: Props) {
  const membership = await getCurrentMembership();
  if (!membership) return null;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const requestedSize = Number(params.size) || 25;
  const pageSize = PAGE_SIZES.includes(requestedSize as 25|50|100) ? requestedSize : 25;
  const status = statuses.includes(params.status as RsvpStatus) ? params.status as RsvpStatus : undefined;
  const data = await getGuests(membership.weddingId, { page, pageSize, query: params.q?.trim(), status, groupId: params.group });
  const canEdit = ["OWNER","ADMIN","ORGANIZER"].includes(membership.role);
  const makeUrl = (changes: Record<string,string|undefined>) => { const next = new URLSearchParams(Object.entries(params).filter((entry): entry is [string,string]=>Boolean(entry[1]))); Object.entries(changes).forEach(([key,value])=>value?next.set(key,value):next.delete(key)); return `/dashboard/guests?${next}`; };

  return <div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Carnet d’invités</p><h1 className="serif mt-2 text-4xl sm:text-5xl">Vos invités <span className="text-[var(--caramel)]">({data.total})</span></h1></div>{canEdit && <div className="flex flex-wrap gap-3"><ImportGuestsDialog/><GuestFormDialog groups={data.groups}/></div>}</div>
    <section className="mt-8 border border-[var(--beige)] bg-white p-4"><div className="flex flex-wrap gap-3"><Suspense><GuestSearch initialValue={params.q ?? ""}/></Suspense><form className="flex flex-wrap gap-3">{params.q && <input type="hidden" name="q" value={params.q}/>}<StyledSelect name="status" label="Statut" defaultValue={status??""} options={[{value:"",label:"Tous les statuts"},...statuses.map(item=>({value:item,label:labels[item]}))]}/><StyledSelect name="group" label="Groupe" defaultValue={params.group??""} options={[{value:"",label:"Tous les groupes"},...data.groups.map(group=>({value:group.id,label:group.name}))]}/><StyledSelect name="size" label="Résultats par page" defaultValue={String(pageSize)} options={PAGE_SIZES.map(size=>({value:String(size),label:`${size} / page`}))}/><button className="button-secondary">Filtrer</button></form><a href="/api/guests/export" className="button-secondary gap-2"><Download size={16}/> Exporter</a></div></section>
    {data.guests.length===0 ? <section className="mt-6 grid min-h-80 place-items-center rounded-2xl border border-dashed border-[var(--taupe)] bg-white/50 text-center"><div><UsersRound className="mx-auto text-[var(--taupe)]" size={38}/><h2 className="serif mt-4 text-3xl">Aucun invité trouvé</h2><p className="mt-2 text-sm text-[var(--caramel)]">Ajoutez votre premier invité ou modifiez les filtres.</p></div></section> : <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--beige)] bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[var(--ivory)] text-xs uppercase tracking-wider text-[var(--caramel)]"><tr><th className="p-4">Invité</th><th className="p-4">Groupe</th><th className="p-4">Statut</th><th className="p-4">Places</th><th className="p-4">Présents</th><th className="p-4">Table</th><th className="p-4">Invitation</th><th className="p-4">Actions</th></tr></thead><tbody>{data.guests.map((guest)=><tr key={guest.id} className="border-t border-[var(--beige)] hover:bg-[var(--ivory)]/55"><td className="p-4"><p className="font-semibold">{guest.firstName} {guest.lastName}</p><p className="mt-1 text-xs text-[var(--caramel)]">{guest.email || guest.phone || "Aucun contact"}</p></td><td className="p-4">{guest.group?.name ?? "—"}</td><td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${guest.status==="CONFIRMED"?"bg-emerald-50 text-emerald-800":guest.status==="DECLINED"?"bg-red-50 text-red-700":"bg-amber-50 text-amber-800"}`}>{labels[guest.status]}</span></td><td className="p-4">{guest.maxGuests}</td><td className="p-4">{guest.rsvp?.guestCount ?? "—"}</td><td className="p-4">{guest.assignment?.table.name ?? "—"}</td><td className="p-4">{guest.invitation?<a title="Ouvrir le lien" className="inline-flex items-center gap-1 text-[var(--caramel)] underline" href={`/w/${membership.wedding.slug}/invite/${guest.invitation.token}`}><Link2 size={14}/> Lien</a>:"—"}</td><td className="p-4"><div className="flex">{canEdit && <><GuestFormDialog groups={data.groups} guest={guest}/><DeleteGuestButton id={guest.id} name={`${guest.firstName} ${guest.lastName}`}/></>}</div></td></tr>)}</tbody></table></div></section>}
    {data.guests.some(guest=>guest.invitation)&&<section className="mt-5 border border-[var(--beige)] bg-white p-4"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--caramel)]">Copier une invitation</p><div className="flex flex-wrap gap-x-6 gap-y-2">{data.guests.filter(guest=>guest.invitation).map(guest=><CopyInvitationButton key={guest.id} path={`/w/${membership.wedding.slug}/invite/${guest.invitation!.token}`} name={`${guest.firstName} ${guest.lastName}`}/>)}</div></section>}
    <footer className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm"><p>{data.total} résultat{data.total>1?"s":""} · page {page} sur {data.pageCount}</p><div className="flex items-center gap-2"><a aria-disabled={page<=1} className={`button-secondary !p-2 ${page<=1?"pointer-events-none opacity-40":""}`} href={makeUrl({page:String(page-1)})}><ChevronLeft size={17}/></a><a aria-disabled={page>=data.pageCount} className={`button-secondary !p-2 ${page>=data.pageCount?"pointer-events-none opacity-40":""}`} href={makeUrl({page:String(page+1)})}><ChevronRight size={17}/></a></div></footer>
  </div>;
}
