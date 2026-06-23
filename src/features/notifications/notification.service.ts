import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/send-email";
import { renderConfirmationEmail } from "./templates/appointment-confirmation.template";
import { renderCancellationEmail } from "./templates/appointment-cancellation.template";
import type { NotificationContext } from "./types";

type NotificationType   = "APPOINTMENT_CONFIRMATION" | "APPOINTMENT_CANCELLED";
type NotificationStatus = "SENT" | "FAILED" | "SKIPPED";

// ─── DB log ──────────────────────────────────────────────────────────────────

async function logNotification(
  appointmentId: string,
  salonId: string,
  clientId: string | null,
  type: NotificationType,
  status: NotificationStatus,
  sentAt?: Date,
  errorMessage?: string,
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        salonId,
        clientId:     clientId ?? null,
        appointmentId,
        channel:      "EMAIL",
        type:         type as never,
        status:       status as never,
        sentAt:       sentAt ?? null,
        errorMessage: errorMessage ?? null,
      },
    });
  } catch (err: unknown) {
    // Logging failure must never propagate — best-effort only
    console.error("[notification] failed to write log:", err);
  }
}

// ─── Context builder ─────────────────────────────────────────────────────────

async function buildNotificationContext(
  appointmentId: string,
  organizationId: string,
): Promise<NotificationContext | null> {
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, organizationId, isActive: true },
    select: {
      id:                true,
      salonId:           true,
      organizationId:    true,
      clientId:          true,
      guestFirstName:    true,
      guestLastName:     true,
      guestEmail:        true,
      priceCentsSnapshot: true,
      startAt:           true,
      salon: {
        select: {
          name:     true,
          phone:    true,
          email:    true,
          slug:     true,
          timezone: true,
        },
      },
      service: {
        select: {
          name:            true,
          durationMinutes: true,
          priceCents:      true,
        },
      },
      employee: {
        select: { firstName: true, lastName: true },
      },
      client: {
        select: { email: true, firstName: true, lastName: true },
      },
    },
  });

  if (!appt) return null;

  // Resolve recipient email: guest fields first, then CRM client
  const recipientEmail =
    appt.guestEmail ?? appt.client?.email ?? null;

  if (!recipientEmail) return null;

  return {
    appointmentId:         appt.id,
    organizationId:        appt.organizationId,
    salonId:               appt.salonId,
    salonName:             appt.salon.name,
    salonPhone:            appt.salon.phone,
    salonEmail:            appt.salon.email,
    salonSlug:             appt.salon.slug,
    salonTimezone:         appt.salon.timezone,
    serviceName:           appt.service.name,
    serviceDurationMinutes: appt.service.durationMinutes,
    servicePriceCents:     appt.service.priceCents,
    priceCentsSnapshot:    appt.priceCentsSnapshot,
    employeeFirstName:     appt.employee.firstName,
    employeeLastName:      appt.employee.lastName,
    recipientEmail,
    recipientFirstName:    appt.guestFirstName ?? appt.client?.firstName ?? "",
    recipientLastName:     appt.guestLastName  ?? appt.client?.lastName  ?? "",
    clientId:              appt.clientId,
    startAt:               appt.startAt,
  };
}

// ─── Preference check ────────────────────────────────────────────────────────

async function isNotificationEnabled(
  clientId: string | null,
  type: NotificationType,
): Promise<boolean> {
  if (!clientId) return true; // guests have no preferences — default send

  const pref = await prisma.notificationPreference.findUnique({
    where: {
      scope_scopeId_type_channel: {
        scope:   "CLIENT",
        scopeId: clientId,
        type:    type as never,
        channel: "EMAIL",
      },
    },
    select: { isEnabled: true },
  });

  // No record = implicit opt-in (default)
  return pref?.isEnabled ?? true;
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function sendAppointmentNotification(
  appointmentId: string,
  organizationId: string,
  type: NotificationType,
): Promise<void> {
  // 1. Build context (reads appointment + all relations)
  const ctx = await buildNotificationContext(appointmentId, organizationId);

  if (!ctx) {
    await logNotification(
      appointmentId,
      // salonId unknown if appointment not found — use placeholder
      "unknown",
      null,
      type,
      "SKIPPED",
      undefined,
      "Appointment not found or no recipient email",
    );
    return;
  }

  // 2. Check notification preference
  const enabled = await isNotificationEnabled(ctx.clientId, type);
  if (!enabled) {
    await logNotification(ctx.appointmentId, ctx.salonId, ctx.clientId, type, "SKIPPED");
    return;
  }

  // 3. Render template
  let subject: string;
  let html: string;

  if (type === "APPOINTMENT_CONFIRMATION") {
    ({ subject, html } = renderConfirmationEmail(ctx));
  } else {
    ({ subject, html } = renderCancellationEmail(ctx));
  }

  // 4. Send
  const result = await sendEmail({
    to:      ctx.recipientEmail,
    subject,
    html,
    replyTo: ctx.salonEmail ?? undefined,
  });

  // 5. Log result
  if (result.ok) {
    await logNotification(
      ctx.appointmentId, ctx.salonId, ctx.clientId, type, "SENT", new Date(),
    );
  } else {
    await logNotification(
      ctx.appointmentId, ctx.salonId, ctx.clientId, type, "FAILED",
      undefined,
      result.error,
    );
  }
}
