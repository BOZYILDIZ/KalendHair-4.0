import type { Prisma } from "@prisma/client";

export function formatReceiptNumber(year: number, seq: number): string {
  return `${year}-${String(seq).padStart(5, "0")}`;
}

// Appelé UNIQUEMENT à l'intérieur d'une $transaction Prisma.
// L'upsert + increment est atomique — deux transactions concurrentes
// pour le même salon obtiennent des séquences distinctes via le verrouillage PostgreSQL.
export async function getNextReceiptNumber(
  tx: Prisma.TransactionClient,
  salonId: string,
  year: number,
): Promise<string> {
  const counter = await tx.salonReceiptCounter.upsert({
    where:  { salonId_year: { salonId, year } },
    create: { salonId, year, lastSeq: 1 },
    update: { lastSeq: { increment: 1 } },
    select: { lastSeq: true },
  });

  return formatReceiptNumber(year, counter.lastSeq);
}
