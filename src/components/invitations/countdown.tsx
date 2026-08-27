"use client";

import { useEffect, useMemo, useState } from "react";

function getRemaining(target: string) {
  const difference = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function Countdown({ target }: { target: string }) {
  const initial = useMemo(() => getRemaining(target), [target]);
  const [remaining, setRemaining] = useState(initial);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  return <div className="grid grid-cols-4 gap-2 sm:gap-5">{[
    [remaining.days, "jours"], [remaining.hours, "heures"], [remaining.minutes, "minutes"], [remaining.seconds, "secondes"],
  ].map(([value,label])=><div key={label} className="rounded-2xl border border-white/20 bg-white/10 px-2 py-5 text-center backdrop-blur"><p className="serif text-3xl sm:text-5xl">{String(value).padStart(2,"0")}</p><p className="mt-1 text-[.6rem] uppercase tracking-[.16em] text-white/60 sm:text-xs">{label}</p></div>)}</div>;
}
