"use client";

import { Trash2 } from "lucide-react";
import { deleteGuestAction } from "@/app/dashboard/guests/actions";

export function DeleteGuestButton({ id, name }: { id: string; name: string }) {
  return <form action={deleteGuestAction} onSubmit={(event) => { if (!window.confirm(`Supprimer définitivement ${name} ?`)) event.preventDefault(); }}><input type="hidden" name="id" value={id}/><button className="rounded-lg p-2 text-red-700 hover:bg-red-50" aria-label={`Supprimer ${name}`}><Trash2 size={16}/></button></form>;
}
