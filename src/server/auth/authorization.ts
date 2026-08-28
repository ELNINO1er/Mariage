import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { MemberRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const requireUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const account = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true } });
  if (account?.status !== "ACTIVE") redirect("/login?error=account-suspended");
  return session.user;
});

export const getCurrentMembership = cache(async () => {
  const user = await requireUser();
  const [account, cookieStore] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { platformRole: true } }),
    cookies(),
  ]);
  if (account?.platformRole === "SUPER_ADMIN") {
    const supportId = cookieStore.get("noces_support_session")?.value;
    if (!supportId) return null;
    const support = await prisma.adminSupportSession.findFirst({
      where: { id: supportId, adminId: user.id, endedAt: null, expiresAt: { gt: new Date() } },
      include: { wedding: true },
    });
    if (support) return { id: `support:${support.id}`, userId: user.id, weddingId: support.weddingId, role: "OWNER" as const, createdAt: support.startedAt, wedding: support.wedding };
    return null;
  }
  const activeWeddingId = cookieStore.get("noces_active_wedding")?.value;
  if (activeWeddingId) {
    const preferred = await prisma.weddingMember.findFirst({where:{userId:user.id,weddingId:activeWeddingId,wedding:{status:"ACTIVE"}},include:{wedding:true}});
    if (preferred) return preferred;
  }
  return prisma.weddingMember.findFirst({
    where: { userId: user.id, wedding: { status: "ACTIVE" } },
    include: { wedding: true },
    orderBy: { createdAt: "asc" },
  });
});

export const requirePlatformAdmin = cache(async () => {
  const user = await requireUser();
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, firstName: true, lastName: true, platformRole: true } });
  if (account?.platformRole !== "SUPER_ADMIN") redirect("/dashboard");
  return account;
});

export const isPlatformAdmin = cache(async () => {
  const user = await requireUser();
  return (await prisma.user.findUnique({ where: { id: user.id }, select: { platformRole: true } }))?.platformRole === "SUPER_ADMIN";
});

export async function requireWeddingAccess(weddingId: string, allowedRoles?: MemberRole[]) {
  const user = await requireUser();
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { platformRole: true } });
  if (account?.platformRole === "SUPER_ADMIN") {
    const supportId = (await cookies()).get("noces_support_session")?.value;
    const support = supportId ? await prisma.adminSupportSession.findFirst({where:{id:supportId,adminId:user.id,weddingId,endedAt:null,expiresAt:{gt:new Date()}},include:{wedding:true}}) : null;
    if (support) return { id: `support:${support.id}`, userId: user.id, weddingId, role: "OWNER" as const, createdAt: support.startedAt, wedding: support.wedding };
    redirect("/admin/weddings?message=Une session d'assistance valide est requise");
  }
  const membership = await prisma.weddingMember.findUnique({
    where: { userId_weddingId: { userId: user.id, weddingId } },
    include: { wedding: true },
  });
  if (!membership || (allowedRoles && !allowedRoles.includes(membership.role))) redirect("/dashboard");
  return membership;
}

export const getActiveSupportSession = cache(async () => {
  const user = await requireUser();
  const supportId = (await cookies()).get("noces_support_session")?.value;
  if (!supportId) return null;
  return prisma.adminSupportSession.findFirst({where:{id:supportId,adminId:user.id,endedAt:null,expiresAt:{gt:new Date()}},include:{wedding:true}});
});
