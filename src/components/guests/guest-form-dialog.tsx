"use client";

import { useActionState, useEffect, useRef } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { createGuestAction, updateGuestAction, type GuestActionState } from "@/app/dashboard/guests/actions";

type Group = { id: string; name: string };
type EditableGuest = {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null;
  maxGuests: number; notes: string | null; group: Group | null;
};

export function GuestFormDialog({ groups, guest }: { groups: Group[]; guest?: EditableGuest }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const action = guest ? updateGuestAction : createGuestAction;
  const [state, formAction, pending] = useActionState<GuestActionState, FormData>(action, {});

  useEffect(() => { if (state.ok) dialog.current?.close(); }, [state.ok]);

  return <>
    <button onClick={() => dialog.current?.showModal()} className={guest ? "rounded-lg p-2 hover:bg-[var(--beige)]/50" : "button-primary"} aria-label={guest ? `Modifier ${guest.firstName}` : undefined}>
      {guest ? <Pencil size={16}/> : <><Plus size={16}/> Ajouter un invité</>}
    </button>
    <dialog ref={dialog} className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-3xl bg-white p-0 text-[var(--brown)] shadow-2xl backdrop:bg-[#342720]/60">
      <form action={formAction} className="p-6 sm:p-8">
        {guest && <input type="hidden" name="id" value={guest.id}/>} 
        <div className="flex items-start justify-between"><div><p className="eyebrow">Carnet d’invités</p><h2 className="serif mt-2 text-4xl">{guest ? "Modifier l’invité" : "Nouvel invité"}</h2></div><button type="button" onClick={() => dialog.current?.close()} className="rounded-full border border-[var(--beige)] p-2"><X size={18}/></button></div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2"><Field name="firstName" label="Prénom" defaultValue={guest?.firstName}/><Field name="lastName" label="Nom" defaultValue={guest?.lastName}/><Field name="email" label="E-mail" type="email" defaultValue={guest?.email ?? ""}/><Field name="phone" label="Téléphone / WhatsApp" type="tel" defaultValue={guest?.phone ?? ""}/><label className="block"><span className="mb-2 block text-sm">Groupe</span><select name="groupId" defaultValue={guest?.group?.id ?? ""} className="w-full rounded-xl border border-[var(--beige)] bg-white px-4 py-3.5"><option value="">Sans groupe</option>{groups.map((group)=><option key={group.id} value={group.id}>{group.name}</option>)}</select></label><Field name="maxGuests" label="Places autorisées" type="number" min="1" max="20" defaultValue={String(guest?.maxGuests ?? 1)}/></div>
        <label className="mt-5 block"><span className="mb-2 block text-sm">Notes internes</span><textarea name="notes" rows={3} defaultValue={guest?.notes ?? ""} className="w-full resize-none rounded-xl border border-[var(--beige)] px-4 py-3 outline-none focus:border-[var(--caramel)]"/></label>
        {state.error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="button-primary mt-7 w-full disabled:opacity-60">{pending ? "Enregistrement…" : guest ? "Enregistrer les modifications" : "Ajouter l’invité"}</button>
      </form>
    </dialog>
  </>;
}

function Field({ name, label, type = "text", defaultValue, min, max }: { name: string; label: string; type?: string; defaultValue?: string; min?: string; max?: string }) {
  return <label className="block"><span className="mb-2 block text-sm">{label}</span><input name={name} type={type} defaultValue={defaultValue} min={min} max={max} required={name === "firstName" || name === "lastName" || name === "maxGuests"} className="w-full rounded-xl border border-[var(--beige)] px-4 py-3.5 outline-none focus:border-[var(--caramel)]"/></label>;
}
