import { prisma } from "@/lib/db/prisma";
import { getNextReceiptNumber } from "./receipt.service";
import type {
  PaymentView,
  PaymentLineView,
  PaymentSummary,
  PaymentsPage,
  PaymentFilters,
  PaymentListItem,
  AppointmentPaymentState,
} from "./types";
import type {
  CreateAppointmentPaymentData,
  CreateFreePaymentData,
} from "./payment.schema";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computePaymentState(
  totalPaidCents: number,
  expectedCents: number,
): AppointmentPaymentState {
  if (totalPaidCents === 0)             return "unpaid";
  if (totalPaidCents < expectedCents)   return "partial";
  if (totalPaidCents === expectedCents) return "paid";
  return "overpaid";
}

function formatClientName(
  firstName: string | null,
  lastName: string | null,
  guestName: string | null,
): string | null {
  if (firstName) return `${firstName} ${lastName ?? ""}`.trim();
  return guestName ?? null;
}

type RawPayment = {
  id:                 string;
  organizationId:     string;
  salonId:            string;
  appointmentId:      string | null;
  clientId:           string | null;
  guestName:          string | null;
  method:             string;
  status:             string;
  amountCents:        number;
  paidAt:             Date;
  receiptNumber:      string | null;
  notes:              string | null;
  createdByProUserId: string | null;
  isActive:           boolean;
  createdAt:          Date;
  lines: {
    id:             string;
    label:          string;
    unitPriceCents: number;
    quantity:       number;
    totalCents:     number;
    serviceId:      string | null;
  }[];
  client: { firstName: string; lastName: string } | null;
  appointment: { service: { name: string } } | null;
};

function toPaymentView(raw: RawPayment): PaymentView {
  const lines: PaymentLineView[] = raw.lines.map((l) => ({
    id:             l.id,
    label:          l.label,
    unitPriceCents: l.unitPriceCents,
    quantity:       l.quantity,
    totalCents:     l.totalCents,
    serviceId:      l.serviceId,
  }));
  return {
    id:                 raw.id,
    organizationId:     raw.organizationId,
    salonId:            raw.salonId,
    appointmentId:      raw.appointmentId,
    clientId:           raw.clientId,
    guestName:          raw.guestName,
    method:             raw.method as PaymentView["method"],
    status:             raw.status as PaymentView["status"],
    amountCents:        raw.amountCents,
    paidAt:             raw.paidAt,
    receiptNumber:      raw.receiptNumber,
    notes:              raw.notes,
    createdByProUserId: raw.createdByProUserId,
    isActive:           raw.isActive,
    createdAt:          raw.createdAt,
    lines,
    clientName:       formatClientName(
      raw.client?.firstName ?? null,
      raw.client?.lastName  ?? null,
      raw.guestName,
    ),
    appointmentLabel: raw.appointment?.service.name ?? null,
  };
}

const PAYMENT_SELECT = {
  id:                 true,
  organizationId:     true,
  salonId:            true,
  appointmentId:      true,
  clientId:           true,
  guestName:          true,
  method:             true,
  status:             true,
  amountCents:        true,
  paidAt:             true,
  receiptNumber:      true,
  notes:              true,
  createdByProUserId: true,
  isActive:           true,
  createdAt:          true,
  lines: {
    select: {
      id:             true,
      label:          true,
      unitPriceCents: true,
      quantity:       true,
      totalCents:     true,
      serviceId:      true,
    },
  },
  client: {
    select: { firstName: true, lastName: true },
  },
  appointment: {
    select: { service: { select: { name: true } } },
  },
} as const;

// ─── Statuts encaissables ────────────────────────────────────────────────────

const PAYABLE_STATUSES = new Set(["CONFIRMED", "COMPLETED"]);

// ─── Create — lié à un RDV ───────────────────────────────────────────────────

export async function createPaymentForAppointment(
  salonId:        string,
  organizationId: string,
  appointmentId:  string,
  input:          CreateAppointmentPaymentData,
  proUserId:      string,
): Promise<PaymentView> {
  // Charger le RDV + service pour validation et snapshot
  const appt = await prisma.appointment.findFirst({
    where:  { id: appointmentId, salonId, organizationId, isActive: true },
    select: {
      status:              true,
      clientId:            true,
      guestFirstName:      true,
      guestLastName:       true,
      priceCentsSnapshot:  true,
      service: { select: { name: true, priceCents: true, id: true } },
    },
  });

  if (!appt) throw new Error("Rendez-vous introuvable.");
  if (!PAYABLE_STATUSES.has(appt.status as string)) {
    throw new Error(
      "Ce rendez-vous ne peut pas être encaissé (statut : " +
      (appt.status as string) +
      ").",
    );
  }

  const unitPriceCents = appt.priceCentsSnapshot ?? appt.service.priceCents;
  const quantity       = 1;
  const totalCents     = unitPriceCents * quantity; // toujours calculé côté service

  const paidAt = new Date(input.paidAt);
  const year   = paidAt.getUTCFullYear();

  const payment = await prisma.$transaction(async (tx) => {
    const receiptNumber = await getNextReceiptNumber(tx, salonId, year);

    const created = await tx.payment.create({
      data: {
        organizationId,
        salonId,
        appointmentId,
        clientId:           appt.clientId ?? null,
        method:             input.method as never,
        status:             "COMPLETED" as never,
        amountCents:        input.amountCents,
        paidAt,
        receiptNumber,
        notes:              input.notes ?? null,
        createdByProUserId: proUserId,
      },
      select: { id: true },
    });

    await tx.paymentLine.create({
      data: {
        paymentId:      created.id,
        label:          appt.service.name,
        unitPriceCents,
        quantity,
        totalCents,
        serviceId:      appt.service.id,
      },
    });

    return created;
  });

  const full = await prisma.payment.findUniqueOrThrow({
    where:  { id: payment.id },
    select: PAYMENT_SELECT,
  });

  return toPaymentView(full as unknown as RawPayment);
}

// ─── Create — paiement libre ─────────────────────────────────────────────────

export async function createFreePayment(
  salonId:        string,
  organizationId: string,
  input:          CreateFreePaymentData,
  proUserId:      string,
): Promise<PaymentView> {
  const { line } = input;
  const totalCents = line.unitPriceCents * line.quantity; // toujours calculé côté service
  const paidAt     = new Date(input.paidAt);
  const year       = paidAt.getUTCFullYear();

  const payment = await prisma.$transaction(async (tx) => {
    const receiptNumber = await getNextReceiptNumber(tx, salonId, year);

    const created = await tx.payment.create({
      data: {
        organizationId,
        salonId,
        clientId:           input.clientId ?? null,
        guestName:          input.guestName ?? null,
        method:             input.method as never,
        status:             "COMPLETED" as never,
        amountCents:        input.amountCents,
        paidAt,
        receiptNumber,
        notes:              input.notes ?? null,
        createdByProUserId: proUserId,
      },
      select: { id: true },
    });

    await tx.paymentLine.create({
      data: {
        paymentId:      created.id,
        label:          line.label,
        unitPriceCents: line.unitPriceCents,
        quantity:       line.quantity,
        totalCents,
        serviceId:      line.serviceId ?? null,
      },
    });

    return created;
  });

  const full = await prisma.payment.findUniqueOrThrow({
    where:  { id: payment.id },
    select: PAYMENT_SELECT,
  });

  return toPaymentView(full as unknown as RawPayment);
}

// ─── Cancel ──────────────────────────────────────────────────────────────────

export async function cancelPayment(
  salonId:        string,
  organizationId: string,
  paymentId:      string,
): Promise<void> {
  const existing = await prisma.payment.findFirst({
    where:  { id: paymentId, salonId, organizationId, isActive: true },
    select: { id: true },
  });
  if (!existing) throw new Error("Paiement introuvable.");

  await prisma.payment.update({
    where: { id: paymentId },
    data:  { status: "CANCELLED" as never, isActive: false },
  });
}

// ─── Read — liste paginée ────────────────────────────────────────────────────

export async function getPayments(
  salonId:        string,
  organizationId: string,
  filters:        PaymentFilters = {},
): Promise<PaymentsPage> {
  const PAGE_SIZE = 20;
  const page      = Math.max(1, filters.page ?? 1);

  const where: Record<string, unknown> = {
    salonId,
    organizationId,
    isActive: true,
  };

  if (filters.method && filters.method !== "ALL") {
    where["method"] = filters.method;
  }
  if (filters.status && filters.status !== "ALL") {
    where["status"] = filters.status;
  }
  if (filters.from ?? filters.to) {
    const paidAt: Record<string, Date> = {};
    if (filters.from) {
      paidAt["gte"] = new Date(`${filters.from}T00:00:00.000Z`);
    }
    if (filters.to) {
      paidAt["lte"] = new Date(`${filters.to}T23:59:59.999Z`);
    }
    where["paidAt"] = paidAt;
  }

  const [total, rawItems, aggregate] = await Promise.all([
    prisma.payment.count({ where: where as never }),
    prisma.payment.findMany({
      where:   where as never,
      orderBy: { paidAt: "desc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      select: {
        id:            true,
        appointmentId: true,
        guestName:     true,
        method:        true,
        status:        true,
        amountCents:   true,
        paidAt:        true,
        receiptNumber: true,
        isActive:      true,
        client: { select: { firstName: true, lastName: true } },
        appointment: { select: { service: { select: { name: true } } } },
      },
    }),
    prisma.payment.aggregate({
      where: { ...(where as Record<string, never>), status: "COMPLETED" as never },
      _sum: { amountCents: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);

  const items: PaymentListItem[] = rawItems.map((r) => ({
    id:               r.id,
    appointmentId:    r.appointmentId,
    clientName:       formatClientName(
      r.client?.firstName ?? null,
      r.client?.lastName  ?? null,
      r.guestName,
    ),
    appointmentLabel: r.appointment?.service.name ?? null,
    method:           r.method as PaymentListItem["method"],
    status:           r.status as PaymentListItem["status"],
    amountCents:      r.amountCents,
    paidAt:           r.paidAt,
    receiptNumber:    r.receiptNumber,
    isActive:         r.isActive,
  }));

  return {
    items,
    total,
    totalPages,
    page: safePage,
    totalAmountCents: aggregate._sum.amountCents ?? 0,
  };
}

// ─── Read — détail ───────────────────────────────────────────────────────────

export async function getPayment(
  salonId:        string,
  organizationId: string,
  paymentId:      string,
): Promise<PaymentView | null> {
  const raw = await prisma.payment.findFirst({
    where:  { id: paymentId, salonId, organizationId },
    select: PAYMENT_SELECT,
  });
  if (!raw) return null;
  return toPaymentView(raw as unknown as RawPayment);
}

// ─── Read — paiements d'un RDV ───────────────────────────────────────────────

export async function getPaymentsForAppointment(
  salonId:       string,
  appointmentId: string,
): Promise<PaymentView[]> {
  const rows = await prisma.payment.findMany({
    where:   { appointmentId, salonId, isActive: true },
    orderBy: { paidAt: "asc" },
    select:  PAYMENT_SELECT,
  });
  return rows.map((r) => toPaymentView(r as unknown as RawPayment));
}

// ─── Read — résumé paiement d'un RDV ────────────────────────────────────────

export async function getPaymentSummaryForAppointment(
  salonId:        string,
  appointmentId:  string,
  expectedCents:  number,
): Promise<PaymentSummary> {
  const payments = await getPaymentsForAppointment(salonId, appointmentId);
  const completed = payments.filter((p) => p.status === "COMPLETED");
  const totalPaidCents = completed.reduce((acc, p) => acc + p.amountCents, 0);
  const remainingCents = Math.max(0, expectedCents - totalPaidCents);
  const state          = computePaymentState(totalPaidCents, expectedCents);

  return { totalPaidCents, expectedCents, remainingCents, state, payments };
}

// ─── Read — CA réel encaissé ─────────────────────────────────────────────────

export async function getRevenueSummary(
  salonId:        string,
  organizationId: string,
  start:          Date,
  end:            Date,
): Promise<number> {
  const agg = await prisma.payment.aggregate({
    where: {
      salonId,
      organizationId,
      status:   "COMPLETED" as never,
      isActive: true,
      paidAt:   { gte: start, lt: end },
    },
    _sum: { amountCents: true },
  });
  return agg._sum.amountCents ?? 0;
}
