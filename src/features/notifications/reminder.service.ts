import { prisma } from "@/lib/db/prisma";
import { sendAppointmentNotification } from "./notification.service";

type ReminderCandidate = {
  id:             string;
  organizationId: string;
  salonId:        string;
  startAt:        Date;
};

type ReminderReport = {
  processed: number;
  sent:      number;
  skipped:   number;
  failed:    number;
};

// Retourne les RDV CONFIRMED dans la fenêtre [windowStart, windowEnd]
// sans rappel SENT déjà enregistré — requête système sans filtre salonId.
async function getAppointmentsNeedingReminder(
  windowStart: Date,
  windowEnd:   Date,
): Promise<ReminderCandidate[]> {
  const rows = await prisma.appointment.findMany({
    where: {
      status:   "CONFIRMED" as never,
      isActive: true,
      startAt:  { gte: windowStart, lte: windowEnd },
      notifications: {
        none: {
          type:   "APPOINTMENT_REMINDER" as never,
          status: "SENT" as never,
        },
      },
    },
    select: {
      id:             true,
      organizationId: true,
      salonId:        true,
      startAt:        true,
    },
  });

  return rows;
}

// Traite tous les rappels en attente pour la fenêtre 22–26h à venir.
// Appelé par la route CRON /api/cron/reminders.
export async function processReminders(): Promise<ReminderReport> {
  const now         = new Date();
  const windowStart = new Date(now.getTime() + 22 * 60 * 60_000);
  const windowEnd   = new Date(now.getTime() + 26 * 60 * 60_000);

  const candidates = await getAppointmentsNeedingReminder(windowStart, windowEnd);

  let sent    = 0;
  let skipped = 0;
  let failed  = 0;

  for (const appt of candidates) {
    try {
      await sendAppointmentNotification(
        appt.id,
        appt.organizationId,
        "APPOINTMENT_REMINDER",
      );
      // sendAppointmentNotification log le résultat en DB.
      // On ne peut pas distinguer SENT/SKIPPED/FAILED ici sans relire la table —
      // on compte tous les appels traités sans erreur fatale comme "processed".
    } catch {
      failed++;
    }
  }

  // Relire les notifications créées pendant cet appel pour compter précisément
  if (candidates.length > 0) {
    const appointmentIds = candidates.map((c) => c.id);
    const logs = await prisma.notification.findMany({
      where: {
        appointmentId: { in: appointmentIds },
        type:          "APPOINTMENT_REMINDER" as never,
        createdAt:     { gte: now },
      },
      select: { status: true },
    });

    for (const log of logs) {
      const s = log.status as string;
      if (s === "SENT")    sent++;
      else if (s === "SKIPPED") skipped++;
      else if (s === "FAILED")  failed++;
    }
  }

  return {
    processed: candidates.length,
    sent,
    skipped,
    failed,
  };
}
