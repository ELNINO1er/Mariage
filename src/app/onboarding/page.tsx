import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getCurrentMembership, requireUser } from "@/server/auth/authorization";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const user=await requireUser();
  if (await getCurrentMembership()) redirect("/dashboard");
  const blocked=await prisma.weddingMember.findFirst({where:{userId:user.id,wedding:{status:{not:"ACTIVE"}}},select:{wedding:{select:{status:true}}}});
  if(blocked) return <main className="grid min-h-screen place-items-center bg-[var(--ivory)] px-5 text-center"><div><p className="eyebrow">Espace indisponible</p><h1 className="serif mt-3 text-5xl">Ce mariage est {blocked.wedding.status==="SUSPENDED"?"suspendu":"archivé"}.</h1><p className="mt-4 text-[var(--caramel)]">Contactez l’administrateur de la plateforme pour le réactiver.</p></div></main>;
  return <main className="paper min-h-screen px-5 py-10"><a href="/" className="serif mx-auto block max-w-2xl text-3xl">Noces.</a><div className="mx-auto mb-9 mt-12 max-w-2xl"><p className="eyebrow">Bienvenue</p><h1 className="serif mt-3 text-5xl">Créons votre mariage</h1><p className="mt-3 text-[var(--caramel)]">Quelques informations suffisent pour préparer votre espace.</p></div><OnboardingForm/></main>;
}
