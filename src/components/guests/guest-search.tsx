"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";

export function GuestSearch({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("q", value.trim()); else params.delete("q");
      params.delete("page");
      if (params.toString() !== searchParams.toString()) router.replace(`${pathname}?${params.toString()}` as Route);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [pathname, router, searchParams, value]);

  return <label className="relative block min-w-64 flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--caramel)]" size={17}/><span className="sr-only">Rechercher</span><input value={value} onChange={(event)=>setValue(event.target.value)} placeholder="Nom, e-mail ou téléphone…" className="w-full rounded-xl border border-[var(--beige)] bg-white py-3 pl-10 pr-4 outline-none focus:border-[var(--caramel)]"/></label>;
}
