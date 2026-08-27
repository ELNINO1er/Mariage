"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="grid min-h-screen place-items-center bg-[var(--ivory)] px-5 text-center"><div><p className="eyebrow">Une erreur est survenue</p><h1 className="serif mt-4 text-5xl">Nous n’avons pas pu afficher cette page.</h1><p className="mt-4 text-sm text-[var(--caramel)]">Vous pouvez réessayer sans perdre votre session.</p><button type="button" onClick={reset} className="button-primary mt-7">Réessayer</button></div></main>;
}
