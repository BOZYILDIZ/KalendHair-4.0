import type { Prisma } from "@prisma/client";

// ─── Types internes ────────────────────────────────────────────────────────────

type RuleCandidate = {
  id: string;
  employeeId: string | null;
  serviceId: string | null;
  productId: string | null;
  type: string;
  value: number;
  createdAt: Date;
};

type CommissionLineInput = {
  paymentLineId: string;
  employeeId: string;
  serviceId: string | null;
  productId: string | null;
  unitPriceCents: number;
  quantity: number;
  appointmentId: string | null;
};

// ─── Algorithme de priorité ────────────────────────────────────────────────────

function ruleSpecificity(rule: RuleCandidate): number {
  return (rule.employeeId !== null ? 2 : 0) +
    ((rule.serviceId !== null || rule.productId !== null) ? 1 : 0);
}

export function resolveRule(
  employeeId: string,
  serviceId: string | null,
  productId: string | null,
  rules: RuleCandidate[],
): RuleCandidate | null {
  const matching = rules.filter((r) => {
    const empMatch = r.employeeId === null || r.employeeId === employeeId;
    // Si la règle cible une prestation précise, elle ne correspond qu'à cette prestation
    if (r.serviceId !== null && r.serviceId !== serviceId) return false;
    // Si la règle cible un produit précis, elle ne correspond qu'à ce produit
    if (r.productId !== null && r.productId !== productId) return false;
    return empMatch;
  });

  if (matching.length === 0) return null;

  matching.sort((a, b) => {
    const diff = ruleSpecificity(b) - ruleSpecificity(a);
    if (diff !== 0) return diff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return matching[0] ?? null;
}

// ─── Calcul du montant de commission ─────────────────────────────────────────

function calculateCommissionCents(
  rule: RuleCandidate,
  unitPriceCents: number,
  quantity: number,
): number {
  const baseAmountCents = unitPriceCents * quantity;
  if (rule.type === "PERCENTAGE") {
    return Math.round((baseAmountCents * rule.value) / 100);
  }
  // FIXED_AMOUNT : montant fixe par unité
  return rule.value * quantity;
}

// ─── Formatage description snapshot ──────────────────────────────────────────

function buildDescription(
  rule: RuleCandidate,
  unitPriceCents: number,
  quantity: number,
): string {
  const baseAmountCents = unitPriceCents * quantity;
  const fmt = (cents: number): string =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
      cents / 100,
    );

  if (rule.type === "PERCENTAGE") {
    return `${rule.value} % sur ${fmt(baseAmountCents)}`;
  }
  return `${fmt(rule.value)} fixe × ${quantity} (base ${fmt(baseAmountCents)})`;
}

// ─── Fonction principale — appelée dans une $transaction ─────────────────────

export async function calculateAndRecordCommissions(
  tx: Prisma.TransactionClient,
  opts: {
    organizationId: string;
    salonId: string;
    paymentId: string;
    lines: CommissionLineInput[];
  },
): Promise<void> {
  if (opts.lines.length === 0) return;

  // Charger toutes les règles actives du salon en une seule requête
  const rules = await tx.commissionRule.findMany({
    where: { salonId: opts.salonId, isActive: true },
    select: {
      id: true, employeeId: true, serviceId: true, productId: true,
      type: true, value: true, createdAt: true,
    },
  });

  for (const line of opts.lines) {
    const rule = resolveRule(line.employeeId, line.serviceId, line.productId, rules);
    if (!rule) continue; // aucune règle applicable — skip silencieux

    const baseAmountCents = line.unitPriceCents * line.quantity;
    const commissionCents = calculateCommissionCents(
      rule, line.unitPriceCents, line.quantity,
    );
    const description = buildDescription(rule, line.unitPriceCents, line.quantity);

    await tx.commissionEntry.create({
      data: {
        organizationId:  opts.organizationId,
        salonId:         opts.salonId,
        employeeId:      line.employeeId,
        paymentId:       opts.paymentId,
        paymentLineId:   line.paymentLineId,
        appointmentId:   line.appointmentId,
        ruleId:          rule.id,
        type:            rule.type as never,
        baseAmountCents,
        commissionCents,
        status:          "PENDING" as never,
        description,
      },
    });
  }
}
