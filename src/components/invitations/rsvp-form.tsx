"use client";

import { useActionState, useState } from "react";
import { Check, Heart, Pencil, Users, X } from "lucide-react";
import { submitRsvpAction, type RsvpActionState } from "@/app/w/[weddingSlug]/invite/[token]/actions";

type InitialRsvp = {
  status: "CONFIRMED" | "DECLINED";
  guestCount: number;
  childrenCount: number;
  contactPhone: string | null;
  message: string | null;
  companions: string[];
} | null;

export function RsvpForm({ weddingSlug, token, firstName, maxGuests, initialRsvp }: { weddingSlug: string; token: string; firstName: string; maxGuests: number; initialRsvp: InitialRsvp }) {
  const [editing, setEditing] = useState(!initialRsvp);
  const [state, formAction, pending] = useActionState<RsvpActionState, FormData>(async (previousState, formData) => {
    const result = await submitRsvpAction(previousState, formData);
    if (result.ok) setEditing(false);
    return result;
  }, {});
  const current = state.ok ? { status: state.status!, guestCount: state.guestCount! } : initialRsvp;
  const [status, setStatus] = useState<"CONFIRMED" | "DECLINED" | null>(initialRsvp?.status ?? null);
  const [guestCount, setGuestCount] = useState(initialRsvp?.guestCount || 1);

  if (!editing && current) return <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-7 text-[#49372f] shadow-xl shadow-black/10 sm:p-10"><div className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${current.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" : "bg-[#f1e5db] text-[#9b7258]"}`}>{current.status === "CONFIRMED" ? <Check/> : <X/>}</div><h3 className="serif mt-6 text-4xl">Merci {firstName} !</h3><p className="mt-4 text-sm leading-7 text-[#715b50]">{current.status === "CONFIRMED" ? <>Votre présence est confirmée pour <strong>{current.guestCount} personne{current.guestCount > 1 ? "s" : ""}</strong>. Nous avons hâte de vous retrouver.</> : <>Votre absence a bien été enregistrée. Merci de nous avoir répondu.</>}</p><button type="button" onClick={()=>setEditing(true)} className="button-secondary mt-7 gap-2"><Pencil size={15}/> Modifier ma réponse</button></div>;

  return <form action={formAction} className="mx-auto max-w-2xl rounded-[2rem] bg-white p-6 text-left text-[#49372f] shadow-xl shadow-black/10 sm:p-10"><input type="hidden" name="weddingSlug" value={weddingSlug}/><input type="hidden" name="token" value={token}/><input type="hidden" name="status" value={status ?? ""}/><div className="text-center"><p className="eyebrow">Votre réponse</p><h3 className="serif mt-3 text-4xl sm:text-5xl">Serez-vous présent ?</h3></div>
    <div className="mt-8 grid gap-3 sm:grid-cols-2"><button type="button" onClick={()=>setStatus("CONFIRMED")} className={`rounded-2xl border-2 p-5 text-left transition ${status==="CONFIRMED"?"border-emerald-600 bg-emerald-50":"border-[#e7d9c8]"}`}><Heart className={status==="CONFIRMED"?"text-emerald-700":"text-[#9b7258]"} size={21}/><strong className="mt-4 block">Oui, je serai présent</strong></button><button type="button" onClick={()=>setStatus("DECLINED")} className={`rounded-2xl border-2 p-5 text-left transition ${status==="DECLINED"?"border-[#9b7258] bg-[#f8f3eb]":"border-[#e7d9c8]"}`}><X className="text-[#9b7258]" size={21}/><strong className="mt-4 block">Non, je ne pourrai pas venir</strong></button></div>
    {status === "CONFIRMED" && <div className="mt-8 space-y-6 border-t border-[#e7d9c8] pt-8"><div><label className="flex items-center gap-2 text-sm font-semibold" htmlFor="guestCount"><Users size={17}/> Nombre de personnes présentes</label><p className="mt-1 text-xs text-[#9b7258]">Votre invitation autorise jusqu’à {maxGuests} personne{maxGuests>1?"s":""}.</p><select id="guestCount" name="guestCount" value={guestCount} onChange={(event)=>setGuestCount(Number(event.target.value))} className="mt-3 w-full rounded-xl border border-[#e7d9c8] bg-white px-4 py-3.5">{Array.from({length:maxGuests},(_,index)=>index+1).map((count)=><option key={count} value={count}>{count}</option>)}</select></div>
      {guestCount > 1 && <div><p className="text-sm font-semibold">Nom des accompagnateurs</p><div className="mt-3 space-y-3">{Array.from({length:guestCount-1},(_,index)=><input key={index} name="companions" required placeholder={`Accompagnateur ${index+1}`} defaultValue={initialRsvp?.companions[index] ?? ""} className="w-full rounded-xl border border-[#e7d9c8] px-4 py-3.5 outline-none focus:border-[#9b7258]"/>)}</div></div>}
      <label className="block"><span className="text-sm font-semibold">Nombre d’enfants</span><select name="childrenCount" defaultValue={Math.min(initialRsvp?.childrenCount ?? 0, guestCount)} className="mt-2 w-full rounded-xl border border-[#e7d9c8] bg-white px-4 py-3.5">{Array.from({length:guestCount+1},(_,index)=>index).map((count)=><option key={count} value={count}>{count}</option>)}</select></label>
    </div>}
    {status && <div className="mt-6 space-y-5"><label className="block"><span className="text-sm font-semibold">Téléphone / WhatsApp</span><input name="contactPhone" type="tel" defaultValue={initialRsvp?.contactPhone ?? ""} placeholder="+225…" className="mt-2 w-full rounded-xl border border-[#e7d9c8] px-4 py-3.5 outline-none focus:border-[#9b7258]"/></label><label className="block"><span className="text-sm font-semibold">Un petit mot pour les mariés</span><textarea name="message" rows={4} maxLength={1000} defaultValue={initialRsvp?.message ?? ""} placeholder="Tous nos vœux de bonheur…" className="mt-2 w-full resize-none rounded-xl border border-[#e7d9c8] px-4 py-3.5 outline-none focus:border-[#9b7258]"/></label></div>}
    {state.error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
    <button disabled={pending || !status} className="button-primary mt-7 w-full disabled:opacity-40">{pending?"Enregistrement…":initialRsvp?"Mettre à jour ma réponse":"Confirmer ma réponse"}</button>{initialRsvp && <button type="button" onClick={()=>setEditing(false)} className="mt-3 w-full py-2 text-sm text-[#9b7258]">Annuler</button>}
  </form>;
}
