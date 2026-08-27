"use client";

import { Trash2 } from "lucide-react";
import { deleteTableAction } from "@/app/dashboard/tables/actions";

export function DeleteTableButton({id,name}:{id:string;name:string}) { return <form action={deleteTableAction} onSubmit={(event)=>{if(!window.confirm(`Supprimer ${name} ? Les invités placés redeviendront non attribués.`))event.preventDefault();}}><input type="hidden" name="id" value={id}/><button className="rounded-lg p-2 text-red-700 hover:bg-red-50" aria-label={`Supprimer ${name}`}><Trash2 size={16}/></button></form>; }
