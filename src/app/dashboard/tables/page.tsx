import { Armchair, CircleGauge, UsersRound } from "lucide-react";
import { TableFormDialog } from "@/components/tables/table-form-dialog";
import { TablePlanner } from "@/components/tables/table-planner";
import { getTablePlanner } from "@/features/tables/table-data";
import { getCurrentMembership } from "@/server/auth/authorization";

export default async function TablesPage() {
  const membership=await getCurrentMembership(); if(!membership)return null;
  const data=await getTablePlanner(membership.weddingId); const canEdit=["OWNER","ADMIN","ORGANIZER"].includes(membership.role); const remaining=Math.max(0,data.expectedSeats-data.assignedSeats);
  return <div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Plan de salle</p><h1 className="serif mt-2 text-4xl sm:text-5xl">Gestion des tables</h1><p className="mt-3 text-sm text-[var(--caramel)]">Glissez les invités confirmés vers une table ou utilisez le sélecteur sur mobile.</p></div>{canEdit&&<TableFormDialog/>}</div><section className="mt-8 grid gap-4 sm:grid-cols-3"><Stat icon={Armchair} label="Tables" value={data.tables.length}/><Stat icon={UsersRound} label="Personnes placées" value={data.assignedSeats}/><Stat icon={CircleGauge} label="Personnes à placer" value={remaining}/></section><div className="mt-7"><TablePlanner tables={data.tables} unassigned={data.unassigned} canEdit={canEdit}/></div></div>;
}

function Stat({icon:Icon,label,value}:{icon:typeof Armchair;label:string;value:number}){return <article className="rounded-2xl border border-[var(--beige)] bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-[var(--caramel)]">{label}</p><Icon size={17}/></div><p className="serif mt-5 text-4xl">{value}</p></article>;}
