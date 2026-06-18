import { prisma } from "@/lib/db/prisma";
import type { ClosedDayView } from "./types";

export async function getClosedDays(
  salonId: string,
  organizationId: string,
): Promise<ClosedDayView[]> {
  const salon = await prisma.salon.findFirst({
    where: { id: salonId, organizationId },
    select: { id: true },
  });
  if (!salon) return [];

  return prisma.closedDay.findMany({
    where: { salonId },
    select: { id: true, salonId: true, date: true, reason: true },
    orderBy: { date: "asc" },
  });
}

export type AddClosedDayResult =
  | { ok: true }
  | { ok: false; error: string };

export async function addClosedDay(
  salonId: string,
  organizationId: string,
  dateString: string,
  reason?: string,
): Promise<AddClosedDayResult> {
  const salon = await prisma.salon.findFirst({
    where: { id: salonId, organizationId },
    select: { id: true },
  });
  if (!salon) return { ok: false, error: "Salon introuvable ou non autorisé" };

  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 2000, (m ?? 1) - 1, d ?? 1));

  try {
    await prisma.closedDay.create({
      data: { salonId, date, reason: reason ?? null },
    });
    return { ok: true };
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return { ok: false, error: "Ce jour est déjà ajouté" };
    }
    throw e;
  }
}

export async function removeClosedDay(
  closedDayId: string,
  salonId: string,
  organizationId: string,
): Promise<void> {
  const salon = await prisma.salon.findFirst({
    where: { id: salonId, organizationId },
    select: { id: true },
  });
  if (!salon) return;

  await prisma.closedDay.deleteMany({
    where: { id: closedDayId, salonId },
  });
}
