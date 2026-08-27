"use client";

import { Printer } from "lucide-react";
import Image from "next/image";

type Card={id:string;firstName:string;lastName:string;expectedCount:number;tableName:string|null;qrUrl:string|null};
export function QrCards({cards,weddingName}:{cards:Card[];weddingName:string}){
  const printable=cards.filter((card)=>card.qrUrl);
  return <section className="mt-8"><div className="no-print flex items-center justify-between gap-4"><div><p className="eyebrow">Badges</p><h2 className="serif mt-2 text-3xl">QR codes individuels</h2></div><button type="button" onClick={()=>window.print()} disabled={!printable.length} className="button-secondary"><Printer size={17}/> Imprimer</button></div>
    <div className="qr-print-grid mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{printable.map((card)=><article key={card.id} className="qr-print-card rounded-2xl border border-[var(--beige)] bg-white p-5 text-center"><p className="text-xs uppercase tracking-[.18em] text-[var(--caramel)]">{weddingName}</p><Image unoptimized src={card.qrUrl!} alt={`QR code de ${card.firstName} ${card.lastName}`} width={240} height={240} className="mx-auto my-3 h-44 w-44"/><h3 className="serif text-2xl">{card.firstName} {card.lastName}</h3><p className="mt-1 text-xs text-[var(--caramel)]">{card.expectedCount} personne{card.expectedCount>1?"s":""} · {card.tableName??"Table à confirmer"}</p></article>)}</div>
  </section>;
}
