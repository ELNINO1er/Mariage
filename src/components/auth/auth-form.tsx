"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/(auth)/actions";

type Field = { name: string; label: string; type?: string; autoComplete?: string };

export function AuthForm({ action, fields, submitLabel, initialValues={} }: { action: (state: AuthState, formData: FormData) => Promise<AuthState>; fields: Field[]; submitLabel: string; initialValues?:Record<string,string> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="mt-8 space-y-5">
    {fields.map((field) => field.type==="hidden"?<input key={field.name} type="hidden" name={field.name} value={initialValues[field.name]??""}/>:<label key={field.name} className="block"><span className="mb-2 block text-sm">{field.label}</span><input className="w-full rounded-xl border border-[var(--beige)] bg-white px-4 py-3.5 outline-none transition focus:border-[var(--caramel)]" name={field.name} type={field.type ?? "text"} autoComplete={field.autoComplete} defaultValue={initialValues[field.name]} required /></label>)}
    {state.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
    {state.fields?.message&&<p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{state.fields.message}</p>}
    <button className="button-primary w-full disabled:opacity-60" disabled={pending}>{pending ? "Enregistrement…" : submitLabel}</button>
  </form>;
}
