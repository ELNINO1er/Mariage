import { ArrowRight, Check, QrCode, Sparkles, Users } from "lucide-react";

const steps = ["Créez votre mariage", "Ajoutez vos invités", "Partagez les invitations", "Recevez les confirmations", "Organisez vos tables", "Accueillez vos proches"];

export default function HomePage() {
  return <main className="paper min-h-screen overflow-hidden">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10">
      <a href="#" className="serif text-3xl font-semibold">Noces<span className="text-[var(--gold)]">.</span></a>
      <div className="hidden items-center gap-8 text-sm lg:flex"><a href="#fonctionnalites">Fonctionnalités</a><a href="#parcours">Comment ça marche</a><a href="#tarifs">Tarifs</a></div>
      <a href="/register" className="button-primary text-sm">Créer mon mariage <ArrowRight size={15}/></a>
    </nav>

    <section className="mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[.9fr_1.1fr] lg:px-10">
      <div className="relative z-10">
        <p className="eyebrow mb-6">L'organisation, avec élégance</p>
        <h1 className="serif max-w-2xl text-6xl font-medium leading-[.88] tracking-[-.035em] sm:text-7xl lg:text-[6.5rem]">Votre mariage.<br/>Vos invités.<br/><em className="font-normal text-[var(--caramel)]">Tout simplement.</em></h1>
        <p className="mt-8 max-w-xl text-base leading-8 text-[color:rgba(73,55,47,.74)]">Créez une invitation digitale à votre image, suivez chaque confirmation et accueillez sereinement vos proches jusqu'au jour J.</p>
        <div className="mt-9 flex flex-wrap gap-3"><a href="/register" className="button-primary">Commencer gratuitement <ArrowRight size={16}/></a><a href="#parcours" className="button-secondary">Découvrir le parcours</a></div>
        <p className="mt-5 flex items-center gap-2 text-xs text-[var(--caramel)]"><Check size={14}/> Sans carte bancaire · Configuration guidée</p>
      </div>
      <div className="relative mx-auto h-[520px] w-full max-w-[650px] lg:h-[650px]">
        <div className="absolute inset-8 rotate-2 rounded-[45%_45%_30%_30%] bg-[var(--beige)]"/>
        <div className="absolute inset-x-20 inset-y-0 -rotate-2 overflow-hidden rounded-[48%_48%_22px_22px] bg-gradient-to-br from-[#7d5d4b] via-[#bda18e] to-[#efe2d1] shadow-2xl shadow-[#49372f]/15">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,transparent_0,transparent_18%,rgba(73,55,47,.28)_75%)]"/>
          <div className="absolute inset-x-0 bottom-14 text-center text-white"><p className="serif text-5xl">Bleu <span className="italic">&</span> Keren</p><p className="mt-2 text-xs uppercase tracking-[.3em]">20 · 12 · 2026</p></div>
        </div>
        <div className="absolute bottom-5 left-0 rotate-[-7deg] rounded-2xl bg-white p-3 shadow-xl"><div className="h-32 w-28 rounded-xl bg-gradient-to-br from-[#dac4ad] to-[#876858]"/><p className="serif pt-2 text-center text-lg italic">pour toujours</p></div>
        <div className="absolute right-0 top-16 rotate-6 rounded-2xl bg-white p-3 shadow-xl"><div className="h-28 w-24 rounded-xl bg-gradient-to-br from-[#f1dfc9] to-[#a6826b]"/></div>
        <div className="absolute right-2 top-1/2 rounded-full bg-white/90 p-4 shadow-lg"><Sparkles className="text-[var(--gold)]"/></div>
      </div>
    </section>

    <section id="fonctionnalites" className="bg-[var(--brown)] px-5 py-24 text-white lg:px-10">
      <div className="mx-auto max-w-7xl"><p className="eyebrow !text-[var(--beige)]">L'essentiel réuni</p><h2 className="serif mt-4 max-w-2xl text-5xl sm:text-6xl">Chaque invité, du premier message à son arrivée.</h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/15 md:grid-cols-3">
          {[{i:Users,t:"Invités & RSVP",d:"Importez, invitez et suivez les réponses en temps réel."},{i:QrCode,t:"QR & accueil",d:"Un QR sécurisé par invitation et un check-in pensé pour mobile."},{i:Sparkles,t:"Une expérience unique",d:"Une invitation émotionnelle, personnalisée à votre histoire."}].map(({i:Icon,t,d})=><article key={t} className="bg-[var(--brown)] p-8"><Icon className="text-[var(--beige)]"/><h3 className="serif mt-8 text-3xl">{t}</h3><p className="mt-3 text-sm leading-7 text-white/65">{d}</p></article>)}
        </div>
      </div>
    </section>

    <section id="parcours" className="mx-auto max-w-7xl px-5 py-24 lg:px-10"><p className="eyebrow">Un parcours fluide</p><h2 className="serif mt-4 text-5xl sm:text-6xl">Nous simplifions votre organisation</h2><div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{steps.map((step,index)=><div key={step} className="rounded-3xl border border-[var(--beige)] bg-white/65 p-7"><span className="serif text-2xl text-[var(--gold)]">0{index+1}</span><h3 className="serif mt-10 text-2xl">{step}</h3></div>)}</div></section>
  </main>;
}
