"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
export function CopyInvitationButton({path,name}:{path:string;name:string}){const[copied,setCopied]=useState(false);async function copy(){await navigator.clipboard.writeText(`${window.location.origin}${path}`);setCopied(true);window.setTimeout(()=>setCopied(false),1800)}return <button type="button" onClick={copy} title={`Copier l’invitation de ${name}`} className="inline-flex items-center gap-2 border border-[var(--beige)] bg-[#fbf8f3] px-3 py-2 text-xs transition hover:border-[var(--brown)] hover:bg-white">{copied?<Check size={14}/>:<Copy size={14}/>} {copied?"Lien copié !":name}</button>}
