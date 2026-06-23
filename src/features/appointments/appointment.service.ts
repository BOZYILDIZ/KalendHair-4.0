import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { isEmployeeAvailable } from "@/features/schedules/availability.service";
import { logModification } from "./appointment-modification.service";
import {
  ALLOWED_TRANSITIONS,
  type AppointmentListView,
  type AppointmentDetailView,
  type AppointmentFilters,
  type AppointmentStatus,
  type EmployeeBasicView,
  type ServiceBasicView,
} from "./types";
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "./appointment.schema";

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeEmail(email?: string | null): string | undefined {
  if (!email?.trim()) return undefined;
  return email.trim().toLowerCase();
}

function buildLocalDateAsUTC(dateStr: string): Date {
  const parts = dateStr.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  return new Date(Date.UTC(y, m - 1, d));
}

function buildStartMinute(timeStr: string): number {
  const parts = timeStr.split(":");
  const h   = parseInt(parts[0] ?? "0", 10);
  const min = parseInt(parts[1] ?? "0", 10);
  return h * 60 + min;
}

// ─── Client resolution ──────────────────────────────────────────────────────

async function resolveOrCreateClient(
  tx: Prisma.TransactionClient,
  salonId: string,
  firstName: string,
  lastName: string,
  email?: string,
  phone?: string,
): Promise<string | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  let client = await tx.client.findFirst({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (!client) {
    client = await tx.client.create({
      data: {
        email:     normalizedEmail,
        firstName,
        lastName,
        phone:     phone ?? null,
      },
      select: { id: true },
    });
  }

  await tx.salonClient.upsert({
    where:  { salonId_clientId: { salonId, clientId: client.id } },
    create: { salonId, clientId: client.id },
    update: {},
  });

  return client.id;
}

// ─── Select shape ────────────────────────────────────────────────────────────

const LIST_SELECT = {
  id:             true,
  organizationId: true,
  salonId:        true,
  employeeId:     true,
  serviceId:      true,
  clientId:       true,
  guestFirstName: true,
  guestLastName:  true,
  guestEmail:     true,
  guestPhone:     true,
  startAt:        true,
  endAt:          true,
  status:         true,
  notes:          true,
  employee: {
    select: { id: true, firstName: true, lastName: true, color: true },
  },
  service: {
    select: { id: true, name: true, durationMinutes: true, priceCents: true },
  },
} as const;

function mapToListView(row: {
  id: string;
  organizationId: string;
  salonId: string;
  employeeId: string;
  serviceId: string;
  clientId: string | null;
  guestFirstName: string | null;
  guestLastName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  startAt: Date;
  endAt: Date;
  status: string;
  notes: string | null;
  employee: { id: string; firstName: string; lastName: string; color: string | null };
  service: { id: string; name: string; durationMinutes: number; priceCents: number };
}): AppointmentListView {
  return {
    ...row,
    status: row.status as AppointmentStatus,
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAppointments(
  salonId: string,
  organizationId: string,
  filters: AppointmentFilters = {},
): Promise<AppointmentListView[]> {
  const where: Prisma.AppointmentWhereInput = {
    salonId,
    organizationId,
    isActive: true,
  };

  if (filters.status) {
    where.status = filters.status as never;
  }
  if (filters.employeeId) {
    where.employeeId = filters.employeeId;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.startAt = {};
    if (filters.dateFrom) {
      where.startAt.gte = new Date(`${filters.dateFrom}T00:00:00.000Z`);
    }
    if (filters.dateTo) {
      where.startAt.lte = new Date(`${filters.dateTo}T23:59:59.999Z`);
    }
  }

  const rows = await prisma.appointment.findMany({
    where,
    select: LIST_SELECT,
    orderBy: { startAt: "asc" },
    take: 100,
  });

  return rows.map(mapToListView);
}

export async function getAppointment(
  id: string,
  organizationId: string,
): Promise<AppointmentDetailView | null> {
  const row = await prisma.appointment.findFirst({
    where: { id, organizationId, isActive: true },
    select: {
      ...LIST_SELECT,
      modifications: {
        orderBy: { createdAt: "desc" },
        select: {
          id:               true,
          appointmentId:    true,
          modifiedById:     true,
          modificationType: true,
          previousStartAt:  true,
          previousEndAt:    true,
          previousStatus:   true,
          note:             true,
          createdAt:        true,
        },
      },
    },
  });
  if (!row) return null;

  return {
    ...mapToListView(row),
    modifications: row.modifications.map((m) => ({
      id:               m.id,
      appointmentId:    m.appointmentId,
      modifiedById:     m.modifiedById,
      modificationType: m.modificationType as never,
      previousStartAt:  m.previousStartAt,
      previousEndAt:    m.previousEndAt,
      previousStatus:   m.previousStatus as never,
      note:             m.note,
      createdAt:        m.createdAt,
    })),
  };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export type CreateResult =
  | { ok: true; appointmentId: string }
  | { ok: false; error: string };

export async function createAppointment(
  salonId: string,
  organizationId: string,
  data: CreateAppointmentInput,
  createdById?: string,
): Promise<CreateResult> {
  // Load salon for timezone
  const salon = await prisma.salon.findFirst({
    where: { id: salonId, organizationId },
    select: { timezone: true },
  });
  if (!salon) return { ok: false, error: "Salon introuvable" };

  const timezone = salon.timezone ?? "Europe/Paris";

  // Load service to get duration
  const service = await prisma.service.findFirst({
    where: { id: data.serviceId, organizationId, isActive: true },
    select: { id: true, durationMinutes: true },
  });
  if (!service) return { ok: false, error: "Service introuvable" };

  // Build UTC times from local input
  const startAt = fromZonedTime(`${data.date}T${data.startTime}:00`, timezone);
  const endAt   = new Date(startAt.getTime() + service.durationMinutes * 60_000);

  // Availability check (schedule + conflict)
  const localDateAsUTC = buildLocalDateAsUTC(data.date);
  const startMinute    = buildStartMinute(data.startTime);

  const availability = await isEmployeeAvailable(
    data.employeeId,
    organizationId,
    localDateAsUTC,
    startMinute,
    service.durationMinutes,
    { startAtUTC: startAt },
  );
  if (!availability.available) {
    return { ok: false, error: availability.reason ?? "Créneau non disponible" };
  }

  // Persist in transaction
  const result = await prisma.$transaction(async (tx) => {
    const clientId = await resolveOrCreateClient(
      tx,
      salonId,
      data.guestFirstName,
      data.guestLastName,
      data.guestEmail,
      data.guestPhone,
    );

    const appt = await tx.appointment.create({
      data: {
        organizationId,
        salonId,
        employeeId:    data.employeeId,
        serviceId:     data.serviceId,
        clientId,
        guestFirstName: data.guestFirstName,
        guestLastName:  data.guestLastName,
        guestEmail:     normalizeEmail(data.guestEmail) ?? null,
        guestPhone:     data.guestPhone ?? null,
        startAt,
        endAt,
        notes: data.notes ?? null,
      },
      select: { id: true },
    });

    await logModification(tx, appt.id, {
      type:        "CREATED",
      modifiedById: createdById ?? null,
    });

    return appt.id;
  });

  return { ok: true, appointmentId: result };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export type UpdateResult = { ok: true } | { ok: false; error: string };

export async function updateAppointment(
  id: string,
  organizationId: string,
  data: UpdateAppointmentInput,
  updatedById?: string,
): Promise<UpdateResult> {
  const appt = await prisma.appointment.findFirst({
    where: { id, organizationId, isActive: true },
    select: {
      id: true, salonId: true, employeeId: true, serviceId: true,
      startAt: true, endAt: true, status: true, notes: true,
    },
  });
  if (!appt) return { ok: false, error: "Rendez-vous introuvable" };

  const terminalStatuses = ["CANCELLED", "NO_SHOW", "COMPLETED"] as AppointmentStatus[];
  if (terminalStatuses.includes(appt.status as AppointmentStatus)) {
    return { ok: false, error: "Impossible de modifier un rendez-vous terminé ou annulé" };
  }

  const isReschedule = !!data.date && !!data.startTime;
  const newEmployeeId = data.employeeId ?? appt.employeeId;

  let newStartAt = appt.startAt;
  let newEndAt   = appt.endAt;

  if (isReschedule) {
    const salon = await prisma.salon.findFirst({
      where: { id: appt.salonId, organizationId },
      select: { timezone: true },
    });
    if (!salon) return { ok: false, error: "Salon introuvable" };

    const timezone = salon.timezone ?? "Europe/Paris";
    const service  = await prisma.service.findFirst({
      where: { id: appt.serviceId, organizationId },
      select: { durationMinutes: true },
    });
    if (!service) return { ok: false, error: "Service introuvable" };

    newStartAt = fromZonedTime(`${data.date}T${data.startTime}:00`, timezone);
    newEndAt   = new Date(newStartAt.getTime() + service.durationMinutes * 60_000);

    const localDateAsUTC = buildLocalDateAsUTC(data.date!);
    const startMinute    = buildStartMinute(data.startTime!);

    const availability = await isEmployeeAvailable(
      newEmployeeId,
      organizationId,
      localDateAsUTC,
      startMinute,
      service.durationMinutes,
      { excludeAppointmentId: id, startAtUTC: newStartAt },
    );
    if (!availability.available) {
      return { ok: false, error: availability.reason ?? "Créneau non disponible" };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id },
      data: {
        employeeId: newEmployeeId,
        startAt:    newStartAt,
        endAt:      newEndAt,
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });

    if (isReschedule) {
      await logModification(tx, id, {
        type:            "RESCHEDULED",
        modifiedById:    updatedById ?? null,
        previousStartAt: appt.startAt,
        previousEndAt:   appt.endAt,
      });
    } else if (data.notes !== undefined) {
      await logModification(tx, id, {
        type:         "NOTE_UPDATED",
        modifiedById: updatedById ?? null,
        note:         data.notes ?? null,
      });
    }
  });

  return { ok: true };
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

export type CancelResult = { ok: true } | { ok: false; error: string };

export async function cancelAppointment(
  id: string,
  organizationId: string,
  reason?: string,
  cancelledById?: string,
): Promise<CancelResult> {
  const appt = await prisma.appointment.findFirst({
    where: { id, organizationId, isActive: true },
    select: { id: true, status: true },
  });
  if (!appt) return { ok: false, error: "Rendez-vous introuvable" };

  const status = appt.status as AppointmentStatus;
  if (!ALLOWED_TRANSITIONS[status].includes("CANCELLED")) {
    return { ok: false, error: `Impossible d'annuler un rendez-vous avec le statut "${status}"` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id },
      data: { status: "CANCELLED" as never },
    });

    await logModification(tx, id, {
      type:           "CANCELLED",
      modifiedById:   cancelledById ?? null,
      previousStatus: status,
      note:           reason ?? null,
    });
  });

  return { ok: true };
}

// ─── Status update ────────────────────────────────────────────────────────────

export type StatusResult = { ok: true } | { ok: false; error: string };

export async function updateAppointmentStatus(
  id: string,
  organizationId: string,
  newStatus: "CONFIRMED" | "NO_SHOW" | "COMPLETED",
  updatedById?: string,
): Promise<StatusResult> {
  const appt = await prisma.appointment.findFirst({
    where: { id, organizationId, isActive: true },
    select: { id: true, status: true },
  });
  if (!appt) return { ok: false, error: "Rendez-vous introuvable" };

  const currentStatus = appt.status as AppointmentStatus;
  if (!ALLOWED_TRANSITIONS[currentStatus].includes(newStatus)) {
    return {
      ok: false,
      error: `Transition invalide : ${currentStatus} → ${newStatus}`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id },
      data: { status: newStatus as never },
    });

    await logModification(tx, id, {
      type:           "STATUS_CHANGED",
      modifiedById:   updatedById ?? null,
      previousStatus: currentStatus,
    });
  });

  return { ok: true };
}

// ─── Selectors for form data ──────────────────────────────────────────────────

export async function getEmployeesForService(
  salonId: string,
  serviceId: string,
  organizationId: string,
): Promise<EmployeeBasicView[]> {
  const rows = await prisma.employeeService.findMany({
    where: {
      serviceId,
      employee: { salonId, organizationId, isActive: true },
    },
    select: {
      employee: { select: { id: true, firstName: true, lastName: true, color: true } },
    },
  });

  return rows.map((r) => r.employee);
}

export async function getActiveServices(
  salonId: string,
  organizationId: string,
): Promise<ServiceBasicView[]> {
  const rows = await prisma.service.findMany({
    where: { salonId, organizationId, isActive: true },
    select: { id: true, name: true, durationMinutes: true, priceCents: true },
    orderBy: { name: "asc" },
  });

  return rows;
}

export async function getServiceEmployeesMap(
  salonId: string,
  organizationId: string,
): Promise<Record<string, EmployeeBasicView[]>> {
  const services = await getActiveServices(salonId, organizationId);
  const map: Record<string, EmployeeBasicView[]> = {};

  await Promise.all(
    services.map(async (s) => {
      map[s.id] = await getEmployeesForService(salonId, s.id, organizationId);
    }),
  );

  return map;
}
