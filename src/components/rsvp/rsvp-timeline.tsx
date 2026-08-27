"use client";

import { useRef } from "react";
import { Clock3, X } from "lucide-react";

type Event = { id: string; type: string; createdAt: string; metadata: unknown };
const labels: Record<string,string> = { CREATED:"Invitation créée",SENT:"Invitation envoyée",OPENED:"Invitation ouverte",RSVP_SUBMITTED:"Confirmation reçue",RSVP_UPDATED:"Réponse modifiée",REMINDER_SENT:"Relance préparée",QR_SCANNED:"QR scanné",CHECKED_IN:"Arrivée enregistrée" };

export function RsvpTimeline({ guestName, events }: { guestName: string; events: Event[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <><button onClick={()=>dialog.current?.showModal()} className="inline-flex items-center gap-2 text-xs text-[var(--caramel)] underline"><Clock3 size={14}/> Historique</button><dialog ref={dialog} className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-white p-0 text-[var(--brown)] shadow-2xl backdrop:bg-[#342720]/60"><div className="p-6 sm:p-8"><div className="flex items-start justify-between"><div><p className="eyebrow">Chronologie</p><h2 className="serif mt-2 text-4xl">{guestName}</h2></div><button onClick={()=>dialog.current?.close()} className="rounded-full border border-[var(--beige)] p-2"><X size={18}/></button></div><div className="mt-8 space-y-0">{events.length ? events.map((event,index)=><div key={event.id} className="relative grid grid-cols-[24px_1fr] gap-4 pb-7"><div className="relative"><span className="absolute left-[7px] top-2 h-2.5 w-2.5 rounded-full bg-[var(--gold)]"/>{index<events.length-1 && <span className="absolute left-[11px] top-5 h-full w-px bg-[var(--beige)]"/>}</div><div><p className="font-semibold">{labels[event.type] ?? event.type}</p><p className="mt-1 text-xs text-[var(--caramel)]">{new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(event.createdAt))}</p>{event.type==="REMINDER_SENT" && isChannelMetadata(event.metadata) && <p className="mt-1 text-xs">Canal : {event.metadata.channel === "whatsapp" ? "WhatsApp" : "E-mail"}</p>}</div></div>) : <p className="text-sm text-[var(--caramel)]">Aucun événement enregistré.</p>}</div></div></dialog></>;
}

function isChannelMetadata(value: unknown): value is { channel: string } { return typeof value === "object" && value !== null && "channel" in value; }
