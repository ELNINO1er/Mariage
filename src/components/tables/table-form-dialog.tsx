"use client";

import { useActionState, useRef } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { createTableAction, updateTableAction, type TableActionState } from "@/app/dashboard/tables/actions";

type TableValue = { id: string; name: string; number: number | null; capacity: number; description: string | null };

export function TableFormDialog({ table }: { table?: TableValue }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<TableActionState,FormData>(async (previous,formData)=>{
    const result = table ? await updateTableAction(previous,formData) : await createTableAction(previous,formData);
    if (result.ok) dialog.current?.close();
    return result;
  },{});
  return <><button onClick={()=>dialog.current?.showModal()} className={table?"rounded-lg p-2 hover:bg-[var(--beige)]/50":"button-primary"} aria-label={table?`Modifier ${table.name}`:undefined}>{table?<Pencil size={16}/>:<><Plus size={16}/> Créer une table</>}</button><dialog ref={dialog} className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-white p-0 text-[var(--brown)] shadow-2xl backdrop:bg-[#342720]/60"><form action={action} className="p-6 sm:p-8">{table&&<input type="hidden" name="id" value={table.id}/>}<div className="flex justify-between"><div><p className="eyebrow">Plan de salle</p><h2 className="serif mt-2 text-4xl">{table?"Modifier la table":"Nouvelle table"}</h2></div><button type="button" onClick={()=>dialog.current?.close()} className="rounded-full border border-[var(--beige)] p-2"><X size={18}/></button></div><div className="mt-7 space-y-5"><Field name="name" label="Nom de la table" defaultValue={table?.name}/><div className="grid grid-cols-2 gap-4"><Field name="number" label="Numéro" type="number" defaultValue={table?.number?.toString()}/><Field name="capacity" label="Capacité" type="number" required defaultValue={String(table?.capacity??10)}/></div><label className="block"><span className="mb-2 block text-sm">Description</span><textarea name="description" rows={3} defaultValue={table?.description??""} className="w-full resize-none rounded-xl border border-[var(--beige)] px-4 py-3 outline-none focus:border-[var(--caramel)]"/></label></div>{state.error&&<p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}<button disabled={pending} className="button-primary mt-7 w-full disabled:opacity-50">{pending?"Enregistrement…":table?"Enregistrer":"Créer la table"}</button></form></dialog></>;
}

function Field({name,label,type="text",defaultValue,required}:{name:string;label:string;type?:string;defaultValue?:string;required?:boolean}) { return <label className="block"><span className="mb-2 block text-sm">{label}</span><input name={name} type={type} min={type==="number"?1:undefined} max={name==="capacity"?100:undefined} defaultValue={defaultValue} required={required??name==="name"} className="w-full rounded-xl border border-[var(--beige)] px-4 py-3.5 outline-none focus:border-[var(--caramel)]"/></label>; }
