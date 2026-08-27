"use client";

import { QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { generateMissingQrCodesAction } from "@/app/dashboard/checkin/actions";

export function GenerateQrButton({count}:{count:number}){const router=useRouter();const[pending,startTransition]=useTransition();const[error,setError]=useState("");return <div><button type="button" disabled={pending} onClick={()=>startTransition(async()=>{const result=await generateMissingQrCodesAction();if(!result.ok)setError(result.error??"Échec");else router.refresh();})} className="button-primary"><QrCode size={17}/>{pending?"Génération…":`Générer ${count} QR code${count>1?"s":""}`}</button>{error&&<p className="mt-2 text-xs text-red-700">{error}</p>}</div>}
