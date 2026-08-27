import "server-only";
import type { ModerationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getMemoryDashboard(weddingId:string,status?:ModerationStatus){
  const where={weddingId,...(status?{status}:{})};
  const[photos,entries,photoCounts,entryCounts]=await Promise.all([
    prisma.galleryPhoto.findMany({where,include:{guest:{select:{firstName:true,lastName:true}}},orderBy:{createdAt:"desc"}}),
    prisma.guestBookEntry.findMany({where,include:{guest:{select:{firstName:true,lastName:true}}},orderBy:{createdAt:"desc"}}),
    prisma.galleryPhoto.groupBy({by:["status"],where:{weddingId},_count:{_all:true}}),
    prisma.guestBookEntry.groupBy({by:["status"],where:{weddingId},_count:{_all:true}}),
  ]);
  const counts={PENDING:0,APPROVED:0,REJECTED:0};
  for(const row of [...photoCounts,...entryCounts])counts[row.status]+=row._count._all;
  return{photos:photos.map(photo=>({...photo,createdAt:photo.createdAt.toISOString(),updatedAt:photo.updatedAt.toISOString()})),entries:entries.map(entry=>({...entry,createdAt:entry.createdAt.toISOString(),updatedAt:entry.updatedAt.toISOString()})),counts};
}
