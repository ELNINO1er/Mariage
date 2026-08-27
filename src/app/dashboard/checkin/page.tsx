import { CircleGauge, QrCode, UserCheck } from "lucide-react";
import { CheckInConsole } from "@/components/checkin/checkin-console";
import { GenerateQrButton } from "@/components/checkin/generate-qr-button";
import { QrCards } from "@/components/checkin/qr-cards";
import { getCheckInDashboard } from "@/features/checkin/checkin-data";
import { getCurrentMembership } from "@/server/auth/authorization";

export default async function CheckInPage(){
  const membership=await getCurrentMembership();if(!membership)return null;
  const data=await getCheckInDashboard(membership.weddingId);const canGenerate=["OWNER","ADMIN","ORGANIZER"].includes(membership.role);
  return <div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Accueil des invités</p><h1 className="serif mt-2 text-4xl sm:text-5xl">QR & Check-in</h1><p className="mt-3 text-sm text-[var(--caramel)]">Scannez les invitations, contrôlez les doublons et suivez les arrivées en direct.</p></div>{data.missingTokens>0&&canGenerate&&<GenerateQrButton count={data.missingTokens}/>}</div>
    <section className="mt-8 grid gap-4 sm:grid-cols-3"><Stat icon={QrCode} label="Invitations attendues" value={data.guests.length}/><Stat icon={UserCheck} label="Invitations arrivées" value={data.checkedInInvitations}/><Stat icon={CircleGauge} label="Personnes présentes" value={`${data.checkedInPeople}/${data.expectedPeople}`}/></section>
    <div className="mt-7"><CheckInConsole guests={data.guests}/></div>
    <QrCards cards={data.guests} weddingName={`${membership.wedding.partnerOne} & ${membership.wedding.partnerTwo}`}/>
  </div>;
}
function Stat({icon:Icon,label,value}:{icon:typeof QrCode;label:string;value:number|string}){return <article className="rounded-2xl border border-[var(--beige)] bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-[var(--caramel)]">{label}</p><Icon size={17}/></div><p className="serif mt-5 text-4xl">{value}</p></article>}
