import { HeartOff } from "lucide-react";

export default function InvitationNotFound() {
  return <main className="paper grid min-h-screen place-items-center px-5 text-center"><div><HeartOff className="mx-auto text-[var(--caramel)]" size={42}/><p className="eyebrow mt-6">Invitation introuvable</p><h1 className="serif mt-3 text-5xl">Ce lien n’est plus disponible.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--caramel)]">Vérifiez le lien reçu ou contactez directement les mariés.</p></div></main>;
}
