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
  const activeWeddingId = cookieStore.get("noces_active_wedding")?.value;
  if (account?.platformRole === "SUPER_ADMIN" && activeWeddingId) {
    const wedding = await prisma.wedding.findUnique({ where: { id: activeWeddingId } });
    if (wedding) return { id: "platform-admin", userId: user.id, weddingId: wedding.id, role: "OWNER" as const, createdAt: new Date(0), wedding };
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
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
    if (wedding) return { id: "platform-admin", userId: user.id, weddingId, role: "OWNER" as const, createdAt: new Date(0), wedding };
  }
  const membership = await prisma.weddingMember.findUnique({
    where: { userId_weddingId: { userId: user.id, weddingId } },
    include: { wedding: true },
  });
  if (!membership || (allowedRoles && !allowedRoles.includes(membership.role))) redirect("/dashboard");
  return membership;
}
