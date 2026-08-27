import Image from "next/image";
import { ArrowRight, Check, CheckCircle2, Heart, Images, QrCode, Sparkles, Users, UtensilsCrossed } from "lucide-react";

import heroCouple from "../../public/noces-hero-couple.png";

const features = [
  { icon: Users, title: "Invités & RSVP", description: "Centralisez vos invités, partagez un lien unique et suivez les réponses en temps réel." },
  { icon: UtensilsCrossed, title: "Tables sans stress", description: "Composez votre plan de salle et contrôlez automatiquement chaque capacité." },
  { icon: QrCode, title: "QR & accueil", description: "Fluidifiez l’arrivée de vos proches grâce au QR code et au check-in mobile." },
  { icon: Images, title: "Souvenirs partagés", description: "Réunissez photos et messages dans une galerie et un livre d’or privés." },
];

const steps = [
  ["01", "Créez votre espace", "Renseignez votre date, votre lieu et choisissez l’univers visuel qui vous ressemble."],
  ["02", "Invitez vos proches", "Ajoutez vos invités, puis envoyez à chacun une invitation personnelle et sécurisée."],
  ["03", "Profitez du jour J", "Suivez les réponses, organisez les tables et accueillez vos invités sereinement."],
];

export default function HomePage() {
  return (
    <main className="paper min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10">
        <a href="#" className="serif text-3xl font-semibold">Noces<span className="text-[var(--gold)]">.</span></a>
        <div className="hidden items-center gap-8 text-sm lg:flex">
          <a className="transition hover:text-[var(--caramel)]" href="#fonctionnalites">Fonctionnalités</a>
          <a className="transition hover:text-[var(--caramel)]" href="#parcours">Comment ça marche</a>
          <a className="transition hover:text-[var(--caramel)]" href="#tarifs">Tarifs</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="hidden text-sm font-medium sm:block">Se connecter</a>
          <a href="/register" className="button-primary text-sm">Créer mon mariage <ArrowRight size={15} /></a>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-5 pb-24 pt-10 lg:grid-cols-[.9fr_1.1fr] lg:px-10">
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 border border-[#e9d4d6] bg-white/75 px-4 py-2 text-xs font-medium text-[var(--caramel)]"><Sparkles size={14} /> Votre mariage, organisé avec élégance</div>
          <h1 className="serif max-w-2xl text-6xl font-medium leading-[.9] tracking-[-.035em] sm:text-7xl lg:text-[6rem]">Un seul espace.<br /><em className="font-normal text-[var(--caramel)]">Tous vos invités.</em><br />Zéro stress.</h1>
          <p className="mt-8 max-w-xl text-base leading-8 text-[color:rgba(52,52,52,.72)] sm:text-lg">Invitations personnalisées, confirmations, tables, QR codes et souvenirs : pilotez chaque détail et offrez à vos proches une expérience inoubliable.</p>
          <div className="mt-9 flex flex-wrap gap-3"><a href="/register" className="button-primary">Créer mon espace gratuitement <ArrowRight size={16} /></a><a href="#parcours" className="button-secondary">Voir comment ça marche</a></div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[color:rgba(52,52,52,.65)]">
            {['Sans carte bancaire', 'Configuration guidée', 'Données sécurisées'].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[var(--caramel)]" /> {item}</span>)}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[620px] pb-8 pl-6 sm:pl-12">
          <div className="absolute -left-2 top-10 h-[88%] w-[88%] bg-[var(--beige)]" />
          <div className="relative aspect-[4/5] overflow-hidden shadow-2xl shadow-[#49372f]/20">
            <Image src={heroCouple} alt="Un couple de jeunes mariés heureux lors de leur réception" fill priority sizes="(max-width: 1024px) 90vw, 48vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2f211b]/65 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10"><p className="serif text-4xl sm:text-5xl">Aïcha <span className="italic text-[#ffd4d4]">&</span> Noah</p><p className="mt-2 text-xs uppercase tracking-[.28em] text-white/80">Notre histoire commence ici</p></div>
          </div>
          <div className="absolute -bottom-1 left-0 z-10 bg-white p-5 shadow-xl sm:left-3"><p className="text-xs uppercase tracking-[.16em] text-[var(--caramel)]">Confirmations</p><p className="serif mt-1 text-3xl">126 invités</p><p className="mt-1 flex items-center gap-2 text-xs text-[#777]"><Check size={13} /> mises à jour en temps réel</p></div>
          <div className="absolute -right-2 top-10 z-10 flex h-16 w-16 items-center justify-center bg-[var(--caramel)] text-white shadow-lg"><Heart fill="currentColor" size={23} /></div>
        </div>
      </section>

      <section className="border-y border-[#efdddf] bg-white/70 px-5 py-7 lg:px-10"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-3 text-center text-sm text-[#766866]"><span className="serif text-2xl text-[var(--brown)]">Tout votre mariage au même endroit</span><span>Invitations digitales</span><span>RSVP en direct</span><span>Plan de table</span><span>Check-in QR</span></div></section>

      <section id="fonctionnalites" className="bg-[var(--brown)] px-5 py-24 text-white lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-8"><div><p className="eyebrow !text-[#ffabab]">Pensé pour votre sérénité</p><h2 className="serif mt-4 max-w-3xl text-5xl sm:text-6xl">De la première invitation au dernier souvenir.</h2></div><p className="max-w-sm leading-7 text-white/60">Moins de tableaux dispersés, moins de messages perdus. Noces vous donne une vision claire de toute votre organisation.</p></div>
          <div className="mt-14 grid gap-px border border-white/15 bg-white/15 md:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, description }) => <article key={title} className="group bg-[var(--brown)] p-8 transition hover:bg-[#3e3a3a]"><Icon className="text-[#ffabab]" /><h3 className="serif mt-10 text-3xl">{title}</h3><p className="mt-3 text-sm leading-7 text-white/60">{description}</p></article>)}</div>
        </div>
      </section>

      <section id="parcours" className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <div><p className="eyebrow">Simple dès le premier clic</p><h2 className="serif mt-4 text-5xl sm:text-6xl">Votre organisation prend forme en quelques minutes.</h2><p className="mt-6 max-w-md leading-7 text-[#766866]">Vous restez maître de votre univers : couleurs, thème, photos et contenu de votre mini-site sont entièrement personnalisables.</p></div>
          <div className="border-t border-[#e6d4d6]">{steps.map(([number, title, description]) => <article key={number} className="grid gap-4 border-b border-[#e6d4d6] py-8 sm:grid-cols-[70px_1fr_1.2fr] sm:items-center"><span className="serif text-2xl text-[var(--caramel)]">{number}</span><h3 className="serif text-3xl">{title}</h3><p className="text-sm leading-7 text-[#766866]">{description}</p></article>)}</div>
        </div>
      </section>

      <section id="tarifs" className="px-5 pb-24 lg:px-10"><div className="mx-auto max-w-7xl bg-[var(--caramel)] px-7 py-16 text-center text-white sm:px-12 sm:py-20"><p className="text-xs font-semibold uppercase tracking-[.22em] text-white/75">Prêt à commencer ?</p><h2 className="serif mx-auto mt-4 max-w-3xl text-5xl sm:text-6xl">Créez aujourd’hui l’expérience que vos invités n’oublieront pas.</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-white/80">Ouvrez gratuitement votre espace, personnalisez votre mariage et invitez vos premiers proches.</p><a href="/register" className="mt-8 inline-flex items-center gap-2 bg-white px-6 py-4 text-sm font-semibold text-[var(--caramel)] transition hover:-translate-y-1">Créer mon mariage <ArrowRight size={16} /></a></div></section>

      <footer className="border-t border-[#eadadc] px-5 py-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><span className="serif text-2xl">Noces<span className="text-[var(--gold)]">.</span></span><p className="text-xs text-[#8a7a78]">Votre mariage, votre histoire, un seul espace.</p><a className="text-sm" href="/login">Connexion</a></div></footer>
    </main>
  );
}
