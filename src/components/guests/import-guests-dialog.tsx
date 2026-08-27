"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import { importGuestsAction, type GuestActionState } from "@/app/dashboard/guests/actions";

type PreviewRow = { firstName: string; lastName: string; email?: string; phone?: string; groupName?: string; maxGuests: number; notes?: string; error?: string };

export function ImportGuestsDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileError, setFileError] = useState("");
  const [state, formAction, pending] = useActionState<GuestActionState, FormData>(importGuestsAction, {});
  const validRows = useMemo(() => rows.filter((row) => !row.error), [rows]);

  async function readFile(file?: File) {
    setFileError(""); setRows([]);
    if (!file) return;
    if (file.size > 1_000_000) { setFileError("Le fichier dépasse 1 Mo."); return; }
    const parsed = parseCsv(await file.text());
    if (parsed.length < 2) { setFileError("Le fichier CSV ne contient aucune donnée."); return; }
    const headers = parsed[0].map((header) => header.trim().toLowerCase());
    const required = ["prenom", "nom", "places"];
    if (required.some((header) => !headers.includes(header))) { setFileError("Colonnes requises : prenom, nom, places."); return; }
    const mapped = parsed.slice(1).filter((row) => row.some(Boolean)).slice(0, 1000).map((row) => {
      const get = (name: string) => row[headers.indexOf(name)]?.trim() ?? "";
      const maxGuests = Number(get("places"));
      const email = get("email").toLowerCase();
      const result: PreviewRow = { firstName: get("prenom"), lastName: get("nom"), email: email || undefined, phone: get("telephone") || undefined, groupName: get("groupe") || undefined, maxGuests, notes: get("notes") || undefined };
      const duplicate = email && parsed.slice(1).filter((candidate) => candidate[headers.indexOf("email")]?.trim().toLowerCase() === email).length > 1;
      if (!result.firstName || !result.lastName) result.error = "Nom ou prénom manquant";
      else if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 20) result.error = "Nombre de places invalide";
      else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) result.error = "E-mail invalide";
      else if (duplicate) result.error = "E-mail dupliqué dans le fichier";
      return result;
    });
    setRows(mapped);
  }

  const payload = validRows.map((row) => ({ firstName: row.firstName, lastName: row.lastName, email: row.email, phone: row.phone, groupName: row.groupName, maxGuests: row.maxGuests, notes: row.notes }));
  return <><button onClick={()=>dialog.current?.showModal()} className="button-secondary gap-2"><FileUp size={16}/> Importer CSV</button><dialog ref={dialog} className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-3xl bg-white p-0 text-[var(--brown)] shadow-2xl backdrop:bg-[#342720]/60"><form action={formAction} className="p-6 sm:p-8"><input type="hidden" name="guests" value={JSON.stringify(payload)}/><div className="flex justify-between"><div><p className="eyebrow">Import en masse</p><h2 className="serif mt-2 text-4xl">Importer des invités</h2></div><button type="button" onClick={()=>dialog.current?.close()} className="rounded-full border border-[var(--beige)] p-2"><X size={18}/></button></div><div className="mt-6 flex flex-wrap items-center gap-3"><label className="button-primary cursor-pointer"><FileUp size={16}/> Choisir un CSV<input className="sr-only" type="file" accept=".csv,text/csv" onChange={(event)=>readFile(event.target.files?.[0])}/></label><a className="text-sm underline" href="/api/guests/template">Télécharger le modèle CSV</a></div>{fileError && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{fileError}</p>}{rows.length>0 && <div className="mt-6"><p className="mb-3 text-sm"><strong>{validRows.length}</strong> valides · <strong>{rows.length-validRows.length}</strong> erreurs</p><div className="max-h-72 overflow-auto rounded-xl border border-[var(--beige)]"><table className="w-full min-w-[650px] text-left text-sm"><thead className="sticky top-0 bg-[var(--ivory)]"><tr><th className="p-3">Invité</th><th className="p-3">Contact</th><th className="p-3">Groupe</th><th className="p-3">Places</th><th className="p-3">Validation</th></tr></thead><tbody>{rows.map((row,index)=><tr key={index} className="border-t border-[var(--beige)]"><td className="p-3">{row.firstName} {row.lastName}</td><td className="p-3">{row.email || row.phone || "—"}</td><td className="p-3">{row.groupName || "—"}</td><td className="p-3">{row.maxGuests || "—"}</td><td className={`p-3 ${row.error?"text-red-700":"text-emerald-700"}`}>{row.error || "Valide"}</td></tr>)}</tbody></table></div></div>}{state.error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}{state.ok && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{state.imported} invités importés, {state.skipped} doublons ignorés.</p>}<button disabled={pending || validRows.length===0} className="button-primary mt-7 w-full disabled:opacity-40">{pending?"Importation…":`Importer ${validRows.length} invités`}</button></form></dialog></>;
}

function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let index=0; index<text.length; index++) { const char=text[index]; const next=text[index+1]; if(char==='"'&&quoted&&next==='"'){cell+='"';index++;}else if(char==='"'){quoted=!quoted;}else if((char===','||char===';')&&!quoted){row.push(cell);cell="";}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&next==='\n')index++;row.push(cell);rows.push(row);row=[];cell="";}else{cell+=char;} } if(cell||row.length){row.push(cell);rows.push(row);} return rows;
}
