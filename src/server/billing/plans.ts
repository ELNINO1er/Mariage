import type { SubscriptionPlan } from "@prisma/client";
export const PLAN_LIMITS={FREE:{guests:100,tables:10,galleryPhotos:50,remindersPerDay:20,themes:["editorial","minimal"],customColors:false},ESSENTIAL:{guests:300,tables:30,galleryPhotos:500,remindersPerDay:200,themes:["editorial","minimal","floral","tropical"],customColors:true},PREMIUM:{guests:2000,tables:200,galleryPhotos:5000,remindersPerDay:2000,themes:["editorial","minimal","floral","tropical","luxury","royal"],customColors:true}} as const;
export function limitsFor(plan:SubscriptionPlan){return PLAN_LIMITS[plan]}
export function assertCapacity(label:string,current:number,adding:number,limit:number){if(current+adding>limit)throw new Error(`Limite ${label} atteinte (${limit}). Passez à une formule supérieure.`)}
export function assertTheme(plan:SubscriptionPlan,theme:string){if(!(limitsFor(plan).themes as readonly string[]).includes(theme))throw new Error("Ce thème n’est pas inclus dans votre abonnement.")}
