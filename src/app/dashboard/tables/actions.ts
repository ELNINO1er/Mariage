"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentMembership } from "@/server/auth/authorization";
import { capacityProjection } from "@/features/tables/capacity";

export type TableActionState = { ok?: boolean; error?: string };
export type AssignmentResult = { ok: boolean; error?: string; requiresConfirmation?: boolean; projected?: number; capacity?: number };

const tableSchema = z.object({
  name: z.string().trim().min(2, "Le nom est trop court").max(100),
  number: z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().int().min(1).max(999).optional()),
  capacity: z.coerce.number().int().min(1, "Une place minimum").max(100),
  description: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().trim().max(300).optional()),
});
const updateTableSchema = tableSchema.extend({ id: z.string().cuid() });
const assignmentSchema = z.object({ guestId: z.string().cuid(), tableId: z.string().cuid().nullable(), force: z.boolean().optional() });

async function requireTableEditor() {
  const membership = await getCurrentMembership();
  if (!membership) throw new Error("Mariage introuvable");
  if (!(["OWNER", "ADMIN", "ORGANIZER"] as string[]).includes(membership.role)) throw new Error("Permission insuffisante");
  return membership;
}

export async function createTableAction(_state: TableActionState, formData: FormData): Promise<TableActionState> {
  const parsed = tableSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Table invalide" };
  try {
    const membership = await requireTableEditor();
    await prisma.weddingTable.create({ data: { weddingId: membership.weddingId, ...parsed.data } });
    revalidatePath("/dashboard/tables");
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "Une table porte déjà ce nom." };
    return { error: error instanceof Error ? error.message : "Création impossible" };
  }
}

export async function updateTableAction(_state: TableActionState, formData: FormData): Promise<TableActionState> {
  const parsed = updateTableSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Table invalide" };
  try {
    const membership = await requireTableEditor();
    const { id, ...data } = parsed.data;
    const result = await prisma.weddingTable.updateMany({ where: { id, weddingId: membership.weddingId }, data });
    if (!result.count) return { error: "Table introuvable" };
    revalidatePath("/dashboard/tables");
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "Une table porte déjà ce nom." };
    return { error: error instanceof Error ? error.message : "Modification impossible" };
  }
}

export async function deleteTableAction(formData: FormData) {
  const tableId = z.string().cuid().safeParse(formData.get("id"));
  if (!tableId.success) return;
  const membership = await requireTableEditor();
  await prisma.weddingTable.deleteMany({ where: { id: tableId.data, weddingId: membership.weddingId } });
  revalidatePath("/dashboard/tables");
}

export async function assignGuestAction(input: { guestId: string; tableId: string | null; force?: boolean }): Promise<AssignmentResult> {
  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Attribution invalide" };
  try {
    const membership = await requireTableEditor();
    return await prisma.$transaction(async (transaction) => {
      const guest = await transaction.guest.findFirst({
        where: { id: parsed.data.guestId, weddingId: membership.weddingId, status: "CONFIRMED" },
        select: { id: true, rsvp: { select: { guestCount: true } } },
      });
      if (!guest?.rsvp || guest.rsvp.guestCount < 1) return { ok: false, error: "Seuls les invités confirmés peuvent être placés." };
      if (!parsed.data.tableId) {
        await transaction.tableAssignment.deleteMany({ where: { guestId: guest.id, table: { weddingId: membership.weddingId } } });
        return { ok: true };
      }
      const table = await transaction.weddingTable.findFirst({ where: { id: parsed.data.tableId, weddingId: membership.weddingId }, select: { id: true, capacity: true } });
      if (!table) return { ok: false, error: "Table introuvable" };
      const occupancy = await transaction.tableAssignment.aggregate({ where: { tableId: table.id, NOT: { guestId: guest.id } }, _sum: { seats: true } });
      const capacity = capacityProjection(occupancy._sum.seats ?? 0, guest.rsvp.guestCount, table.capacity);
      if (capacity.exceeded && !parsed.data.force) return { ok: false, requiresConfirmation: true, projected: capacity.projected, capacity: table.capacity };
      await transaction.tableAssignment.upsert({
        where: { guestId: guest.id },
        create: { guestId: guest.id, tableId: table.id, seats: guest.rsvp.guestCount },
        update: { tableId: table.id, seats: guest.rsvp.guestCount },
      });
      return { ok: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Attribution impossible" };
  } finally {
    revalidatePath("/dashboard/tables");
    revalidatePath("/dashboard/guests");
  }
}
