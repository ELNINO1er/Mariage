"use client";

import { Copy, RefreshCw, UserRoundPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { regenerateCollectiveRsvpTokenAction, setCollectiveRsvpAction } from "@/app/dashboard/settings/actions";

export function CollectiveRsvpSettings({enabled,path,maxGuests}:{enabled:boolean;path:string|null;maxGuests:number}){
  const router=useRouter();
  const[pending,startTransition]=useTransition();
  const[limit,setLimit]=useState(maxGuests);
  const[message,setMessage]=useState("");
  const run=(promise:Promise<{ok?:boolean;error?:string}>)=>startTransition(async()=>{const result=await promise;setMessage(result.ok?"Modification enregistrée.":result.error??"Action impossible");router.refresh()});
  const copy=async()=>{if(!path)return;await navigator.clipboard.writeText(`${window.location.origin}${path}`);setMessage("Lien RSVP copié.")};
  return <section className="border border-[var(--beige)] bg-white p-6">
    <div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-2"><UserRoundPlus size={20}/><h2 className="serif text-3xl">RSVP collectif</h2></div><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--caramel)]">Toute personne possédant ce lien peut s’inscrire. Son invité, sa réponse et ses accompagnants apparaissent automatiquement dans le tableau de bord.</p></div><button disabled={pending} onClick={()=>run(setCollectiveRsvpAction(!enabled,limit))} className={enabled?"button-secondary":"button-primary"}>{enabled?"Désactiver":"Activer le lien"}</button></div>
    <label className="mt-5 block max-w-xs text-xs font-semibold uppercase tracking-wider text-[var(--caramel)]">Maximum par inscription<input type="number" min={1} max={20} value={limit} onChange={event=>setLimit(Number(event.target.value))} className="admin-input mt-2"/></label>
    <button disabled={pending} onClick={()=>run(setCollectiveRsvpAction(enabled,limit))} className="button-secondary mt-3 !px-4 !py-2 text-xs">Enregistrer la limite</button>
    {enabled&&path&&<div className="mt-5 bg-[var(--ivory)] p-4"><p className="break-all text-sm">{path}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={copy} className="button-primary !px-4 !py-2 text-xs"><Copy size={14}/>Copier</button><a href={path} target="_blank" rel="noreferrer" className="button-secondary !px-4 !py-2 text-xs">Ouvrir</a><button onClick={()=>window.confirm("L’ancien lien cessera de fonctionner. Continuer ?")&&run(regenerateCollectiveRsvpTokenAction())} className="button-secondary !px-4 !py-2 text-xs"><RefreshCw size={14}/>Régénérer</button></div></div>}
    {message&&<p className="mt-3 text-sm text-[var(--caramel)]">{message}</p>}
  </section>
}
