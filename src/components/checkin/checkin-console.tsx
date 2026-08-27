"use client";

import { Camera, CheckCircle2, RotateCcw, Search, UserCheck, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { manualCheckInAction, scanCheckInAction, undoCheckInAction, type CheckInResult } from "@/app/dashboard/checkin/actions";

type Guest = { id:string; firstName:string; lastName:string; expectedCount:number; tableName:string|null; checkedInAt:string|null; checkedInCount:number|null };
type Detector = { detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string }>> };
type DetectorConstructor = new (options: { formats: string[] }) => Detector;

export function CheckInConsole({ guests }: { guests: Guest[] }) {
  const [query,setQuery]=useState(""); const [message,setMessage]=useState<CheckInResult|null>(null); const [scanning,setScanning]=useState(false); const [pending,startTransition]=useTransition();
  const videoRef=useRef<HTMLVideoElement>(null); const streamRef=useRef<MediaStream|null>(null); const frameRef=useRef<number|null>(null); const lastScan=useRef("");
  const visible=useMemo(()=>{const q=query.toLocaleLowerCase("fr").trim(); return guests.filter((g)=>!q||`${g.firstName} ${g.lastName} ${g.tableName??""}`.toLocaleLowerCase("fr").includes(q));},[guests,query]);
  const stopCamera=useCallback(()=>{if(frameRef.current)cancelAnimationFrame(frameRef.current);streamRef.current?.getTracks().forEach((track)=>track.stop());streamRef.current=null;setScanning(false);},[]);
  const handleResult=useCallback((promise:Promise<CheckInResult>)=>{startTransition(async()=>{const result=await promise;setMessage(result);if(result.ok)stopCamera();});},[stopCamera]);

  async function startCamera(){
    setMessage(null); const DetectorClass=(window as unknown as {BarcodeDetector?:DetectorConstructor}).BarcodeDetector;
    if(!DetectorClass){setMessage({ok:false,error:"Le scanner caméra n’est pas disponible dans ce navigateur. Utilisez Chrome/Edge récent ou la recherche manuelle."});return;}
    try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}});streamRef.current=stream;setScanning(true);if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      const detector=new DetectorClass({formats:["qr_code"]}); const scan=async()=>{const video=videoRef.current;if(!video||!streamRef.current)return;try{const codes=await detector.detect(video);const value=codes[0]?.rawValue;if(value&&value!==lastScan.current){lastScan.current=value;handleResult(scanCheckInAction(value));return;}}catch{}frameRef.current=requestAnimationFrame(scan);};frameRef.current=requestAnimationFrame(scan);
    }catch{setMessage({ok:false,error:"Accès à la caméra refusé ou indisponible."});stopCamera();}
  }
  useEffect(() => () => stopCamera(), [stopCamera]);

  return <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
    <section className="rounded-2xl border border-[var(--beige)] bg-white p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Scanner</p><h2 className="serif mt-2 text-3xl">Lecture du QR</h2></div><Camera/></div>
      <div className="mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-[#201914]"><video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${scanning?"block":"hidden"}`}/>{!scanning&&<div className="grid h-full place-items-center px-6 text-center text-sm text-white/65">Activez la caméra et présentez le QR code de l’invité.</div>}</div>
      <button type="button" disabled={pending} onClick={scanning?stopCamera:startCamera} className="button-primary mt-4 w-full">{scanning?<><XCircle size={18}/>Arrêter</>:<><Camera size={18}/>Scanner un QR code</>}</button>
      {message&&<ResultMessage result={message}/>}</section>
    <section><label className="flex items-center gap-3 rounded-2xl border border-[var(--beige)] bg-white px-4"><Search size={18}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Rechercher un invité ou une table…" className="w-full bg-transparent py-4 outline-none"/></label>
      <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1">{visible.map((guest)=><article key={guest.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--beige)] bg-white p-4"><div><p className="font-semibold">{guest.firstName} {guest.lastName}</p><p className="mt-1 text-xs text-[var(--caramel)]">{guest.expectedCount} personne{guest.expectedCount>1?"s":""} · {guest.tableName??"Table non attribuée"}</p>{guest.checkedInAt&&<p className="mt-1 text-xs text-emerald-700">Arrivé à {new Intl.DateTimeFormat("fr-FR",{hour:"2-digit",minute:"2-digit"}).format(new Date(guest.checkedInAt))}</p>}</div>
        {guest.checkedInAt?<button type="button" disabled={pending} onClick={()=>handleResult(undoCheckInAction(guest.id))} className="button-secondary !px-3 !py-2 text-xs"><RotateCcw size={15}/> Annuler</button>:<button type="button" disabled={pending} onClick={()=>handleResult(manualCheckInAction({guestId:guest.id,guestCount:guest.expectedCount}))} className="button-primary !px-3 !py-2 text-xs"><UserCheck size={15}/> Pointer</button>}</article>)}{!visible.length&&<p className="rounded-2xl border border-dashed border-[var(--taupe)] p-8 text-center text-sm text-[var(--caramel)]">Aucun invité trouvé.</p>}</div>
    </section>
  </div>;
}

function ResultMessage({result}:{result:CheckInResult}){return <div className={`mt-4 rounded-xl p-4 text-sm ${result.ok?"bg-emerald-50 text-emerald-800":"bg-red-50 text-red-700"}`}><div className="flex gap-2">{result.ok?<CheckCircle2 className="shrink-0" size={18}/>:<XCircle className="shrink-0" size={18}/>}<div>{result.guest?<><p className="font-semibold">{result.guest.name}</p><p>{result.alreadyCheckedIn?"Déjà enregistré":"Entrée enregistrée"} · {result.guest.guestCount} personne{result.guest.guestCount>1?"s":""}{result.guest.tableName?` · ${result.guest.tableName}`:""}</p></>:<p>{result.error??"Opération terminée."}</p>}</div></div></div>}
