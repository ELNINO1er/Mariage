"use client";

import { useState, useTransition } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { prepareReminderAction } from "@/app/dashboard/rsvp/actions";

export function ReminderButtons({ guestId, hasPhone, hasEmail }: { guestId: string; hasPhone: boolean; hasEmail: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function remind(channel: "whatsapp" | "email") {
    const popup = window.open("about:blank", "_blank");
    setError("");
    startTransition(async () => {
      const result = await prepareReminderAction({ guestId, channel });
      if (result.ok && result.url) {
        if (popup) popup.location.href = result.url; else window.location.href = result.url;
      } else {
        popup?.close(); setError(result.error ?? "Relance impossible");
      }
    });
  }

  return <div><div className="flex flex-wrap gap-2"><button disabled={pending || !hasPhone} onClick={()=>remind("whatsapp")} className="inline-flex items-center gap-2 rounded-full bg-[#1f8f55] px-4 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-35"><MessageCircle size={14}/> WhatsApp</button><button disabled={pending || !hasEmail} onClick={()=>remind("email")} className="inline-flex items-center gap-2 rounded-full border border-[var(--beige)] px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-35"><Mail size={14}/> E-mail</button></div>{error && <p className="mt-2 text-xs text-red-700">{error}</p>}</div>;
}
