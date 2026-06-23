import { prisma } from "@/lib/db/prisma";
import type {
  ClientListItem,
  ClientView,
  ClientStats,
  ClientAppointmentRow,
  ClientsPage,
  ClientAppointmentsPage,
} from "./types";

const CLIENT_PAGE_SIZE = 20;
const HISTORY_PAGE_SIZE = 10;

function formatIso(date: Date): string {
  return date.toISOString();
}

function formatDateLocal(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function getClients(
  salonId: string,
  organizationId: string,
  opts: { search?: string; page?: number } = {},
): Promise<ClientsPage> {
  const page = Math.max(1, opts.page ?? 1);
  const search = opts.search?.trim() ?? "";

  const clientWhere = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const where = {
    salonId,
    client: clientWhere,
  };

  const [rawItems, total] = await Promise.all([
    prisma.salonClient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * CLIENT_PAGE_SIZE,
      take: CLIENT_PAGE_SIZE,
      include: { client: true },
    }),
    prisma.salonClient.count({ where }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / CLIENT_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const items: ClientListItem[] = rawItems.map((sc) => ({
    id: sc.client.id,
    firstName: sc.client.firstName,
    lastName: sc.client.lastName,
    email: sc.client.email,
    phone: sc.client.phone,
    isActive: sc.client.isActive,
    salonClientId: sc.id,
    notes: sc.notes,
    createdAt: formatIso(sc.createdAt),
  }));

  return { items, total, page: safePage, pageCount };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getClient(
  clientId: string,
  salonId: string,
  organizationId: string,
): Promise<ClientView | null> {
  const sc = await prisma.salonClient.findUnique({
    where: { salonId_clientId: { salonId, clientId } },
    include: { client: true },
  });

  if (!sc) return null;

  // Verify organizationId via salon relation (defense in depth)
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { organizationId: true },
  });
  if (!salon || salon.organizationId !== organizationId) return null;

  return {
    id: sc.client.id,
    firstName: sc.client.firstName,
    lastName: sc.client.lastName,
    email: sc.client.email,
    phone: sc.client.phone,
    isActive: sc.client.isActive,
    salonClientId: sc.id,
    notes: sc.notes,
    salonClientIsActive: sc.isActive,
    memberSince: formatIso(sc.createdAt),
  };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getClientStats(
  clientId: string,
  salonId: string,
  timezone: string,
): Promise<ClientStats> {
  const [completedAppts, cancelledCount, noShowCount, totalCount, lastCompleted] =
    await Promise.all([
      prisma.appointment.findMany({
        where: { clientId, salonId, status: "COMPLETED" },
        select: {
          priceCentsSnapshot: true,
          service: { select: { priceCents: true } },
        },
      }),
      prisma.appointment.count({ where: { clientId, salonId, status: "CANCELLED" } }),
      prisma.appointment.count({ where: { clientId, salonId, status: "NO_SHOW" } }),
      prisma.appointment.count({
        where: { clientId, salonId, status: { notIn: ["CANCELLED", "NO_SHOW"] } },
      }),
      prisma.appointment.findFirst({
        where: { clientId, salonId, status: "COMPLETED" },
        orderBy: { startAt: "desc" },
        select: { startAt: true },
      }),
    ]);

  const totalSpentCents = completedAppts.reduce(
    (sum, appt) => sum + (appt.priceCentsSnapshot ?? appt.service.priceCents),
    0,
  );

  return {
    totalAppointments: totalCount,
    totalSpentCents,
    cancellationCount: cancelledCount + noShowCount,
    noShowCount,
    lastVisitAt: lastCompleted
      ? formatDateLocal(lastCompleted.startAt, timezone)
      : null,
  };
}

// ─── Appointment history ──────────────────────────────────────────────────────

export async function getClientAppointments(
  clientId: string,
  salonId: string,
  timezone: string,
  opts: { page?: number } = {},
): Promise<ClientAppointmentsPage> {
  const page = Math.max(1, opts.page ?? 1);

  const where = { clientId, salonId };

  const [rawItems, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { startAt: "desc" },
      skip: (page - 1) * HISTORY_PAGE_SIZE,
      take: HISTORY_PAGE_SIZE,
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        priceCentsSnapshot: true,
        service: { select: { name: true, priceCents: true } },
        employee: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const items: ClientAppointmentRow[] = rawItems.map((appt) => ({
    id: appt.id,
    startAt: formatDateLocal(appt.startAt, timezone),
    endAt: formatDateLocal(appt.endAt, timezone),
    status: appt.status,
    serviceName: appt.service.name,
    effectivePriceCents: appt.priceCentsSnapshot ?? appt.service.priceCents,
    employeeFirstName: appt.employee.firstName,
    employeeLastName: appt.employee.lastName,
  }));

  return { items, total, page: safePage, pageCount };
}

// ─── Update notes ─────────────────────────────────────────────────────────────

export async function updateClientNotes(
  salonId: string,
  clientId: string,
  organizationId: string,
  notes: string | null,
): Promise<void> {
  // Verify SalonClient belongs to this salon (isolation)
  const sc = await prisma.salonClient.findUnique({
    where: { salonId_clientId: { salonId, clientId } },
    select: { id: true },
  });
  if (!sc) throw new Error("Client non trouvé dans ce salon.");

  await prisma.salonClient.update({
    where: { salonId_clientId: { salonId, clientId } },
    data: { notes },
  });
}

// ─── Convert guest → client ───────────────────────────────────────────────────

export async function convertGuestToClient(
  appointmentId: string,
  salonId: string,
  organizationId: string,
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        salonId: true,
        organizationId: true,
        clientId: true,
        guestFirstName: true,
        guestLastName: true,
        guestEmail: true,
        guestPhone: true,
      },
    });

    if (!appt) throw new Error("Rendez-vous introuvable.");
    if (appt.salonId !== salonId || appt.organizationId !== organizationId)
      throw new Error("Accès refusé.");
    if (appt.clientId) throw new Error("Ce rendez-vous est déjà lié à un client.");
    if (!appt.guestEmail) throw new Error("Impossible de convertir : aucun email invité.");

    const normalizedEmail = appt.guestEmail.trim().toLowerCase();

    let client = await tx.client.findFirst({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (!client) {
      client = await tx.client.create({
        data: {
          email: normalizedEmail,
          firstName: appt.guestFirstName ?? "",
          lastName: appt.guestLastName ?? "",
          phone: appt.guestPhone ?? null,
        },
        select: { id: true },
      });
    }

    await tx.salonClient.upsert({
      where: { salonId_clientId: { salonId, clientId: client.id } },
      create: { salonId, clientId: client.id },
      update: {},
    });

    // Set clientId only — guest* fields preserved as historical snapshot
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { clientId: client.id },
    });

    return client.id;
  });
}
