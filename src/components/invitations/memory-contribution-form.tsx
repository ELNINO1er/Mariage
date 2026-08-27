"use client";

import { Camera, Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { submitMemoryAction, type MemoryActionState } from "@/app/w/[weddingSlug]/invite/[token]/memories-actions";

const initial:MemoryActionState={};
export function MemoryContributionForm({weddingSlug,token}:{weddingSlug:string;token:string}){
  const[state,action,pending]=useActionState(submitMemoryAction,initial);const formRef=useRef<HTMLFormElement>(null);
  useEffect(()=>{if(state.ok)formRef.current?.reset();},[state.ok]);
  return <form ref={formRef} action={action} className="mx-auto mt-10 max-w-2xl rounded-[2rem] bg-white p-6 text-left text-[#49372f] shadow-xl sm:p-8"><input type="hidden" name="weddingSlug" value={weddingSlug}/><input type="hidden" name="token" value={token}/><label className="block text-sm font-semibold" htmlFor="memory-message">Votre mot pour les mariés</label><textarea id="memory-message" name="message" maxLength={1500} rows={4} placeholder="Partagez un souvenir, un vœu ou quelques mots…" className="mt-2 w-full rounded-xl border border-[#e7d9c8] bg-[#f8f3eb] p-4 outline-none focus:border-[#9b7258]"/>
    <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="rounded-xl border border-dashed border-[#b99d88] bg-[#f8f3eb] p-4 text-sm"><span className="flex items-center gap-2 font-semibold"><Camera size={17}/>Ajouter une photo</span><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-xs"/></label><label className="text-sm font-semibold">Légende facultative<input name="caption" maxLength={500} className="mt-2 w-full rounded-xl border border-[#e7d9c8] bg-[#f8f3eb] px-4 py-3 font-normal outline-none" placeholder="Ce beau moment…"/></label></div>
    <p className="mt-4 text-xs text-[#9b7258]">JPEG, PNG ou WebP · 8 Mo maximum. Votre contribution sera visible après validation.</p>{state.error&&<p aria-live="polite" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}{state.ok&&<p aria-live="polite" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Merci ! Votre souvenir a bien été envoyé pour validation.</p>}<button disabled={pending} className="button-primary mt-5 w-full">{pending?"Envoi en cours…":<><Send size={17}/>Partager ce souvenir</>}</button></form>;
}
