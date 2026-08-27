import { Heart } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="paper grid min-h-screen lg:grid-cols-[.85fr_1.15fr]">
    <section className="flex items-center justify-center px-5 py-12">{children}</section>
    <section className="relative hidden overflow-hidden bg-[var(--brown)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <a href="/" className="serif relative z-10 text-3xl">Noces.</a>
      <div className="absolute -right-28 top-20 h-[520px] w-[520px] rounded-full border border-white/10"/><div className="absolute -right-4 top-48 h-[370px] w-[370px] rounded-full bg-[var(--taupe)]/35"/>
      <blockquote className="serif relative z-10 max-w-xl text-5xl leading-[1.05]">“Chaque grand jour commence par une invitation.”</blockquote>
      <p className="relative z-10 flex items-center gap-2 text-sm text-white/60"><Heart size={15}/> Pensé pour vos plus beaux souvenirs</p>
    </section>
  </main>;
}
