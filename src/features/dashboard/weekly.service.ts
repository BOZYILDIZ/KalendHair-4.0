import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/db/prisma";
import { getSalon } from "@/features/salons/salon.service";
import type { SessionUser } from "@/features/auth/types";
import type { WeeklyPoint } from "@/features/dashboard/components/week-sparkline-widget";

// ─── Constantes ───────────────────────────────────────────────────────────────

const FR_DAY_LABELS: Record<number, string> = {
  0: "Dim", 1: "Lun", 2: "Mar", 3: "Mer", 4: "Jeu", 5: "Ven", 6: "Sam",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retourne les 7 dates de la semaine courante (lun → dim) dans le timezone
 * du salon, à partir de la date d'aujourd'hui.
 */
function getCurrentWeekDates(timezone: string): Array<{ dateStr: string; dayLabel: string }> {
  const todayStr = new Intl.DateTimeFormat("fr-CA", { timeZone: timezone }).format(new Date());
  const [yStr, mStr, dStr] = todayStr.split("-");
  const y = parseInt(yStr ?? "2000", 10);
  const m = parseInt(mStr ?? "1", 10);
  const d = parseInt(dStr ?? "1", 10);

  // Jour de la semaine UTC pour une heure de midi (évite les ambiguïtés DST)
  const dow = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  // Décalage pour atteindre lundi (0=dim → 6 jours en arrière; sinon dow-1)
  const offsetToMonday = dow === 0 ? 6 : dow - 1;

  return Array.from({ length: 7 }, (_, i) => {
    const dayOffset = i - offsetToMonday;
    const date = new Date(Date.UTC(y, m - 1, d + dayOffset, 12));
    const ds = date.toISOString().slice(0, 10) as string;
    const label = FR_DAY_LABELS[date.getUTCDay()] ?? "?";
    return { dateStr: ds, dayLabel: label };
  });
}

function toZonedRange(dateStr: string, timezone: string): { start: Date; end: Date } {
  return {
    start: fromZonedTime(`${dateStr}T00:00:00`, timezone),
    end:   fromZonedTime(`${dateStr}T23:59:59.999`, timezone),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Retourne les 7 points de données (lun → dim) pour le WeekSparklineWidget.
 *
 * Exécute une seule requête Prisma couvrant toute la semaine, puis agrège
 * les résultats par jour en mémoire — zéro N+1 query.
 *
 * - revenueCents : toujours inclus dans la sélection (filtrage rôle côté UI)
 * - appointmentsCount : toutes les semaines, CANCELLED + NO_SHOW exclus
 *
 * @throws en cas d'erreur Prisma — le parent doit gérer (non-critique)
 */
export async function getWeeklyData(
  session: SessionUser,
): Promise<WeeklyPoint[]> {
  const salon = await getSalon(session.organizationId);
  if (!salon) return buildEmptyWeek("Europe/Paris");

  const { id: salonId, timezone } = salon;
  const days = getCurrentWeekDates(timezone);

  const weekStart = toZonedRange(days[0]!.dateStr, timezone).start;
  const weekEnd   = toZonedRange(days[6]!.dateStr, timezone).end;

  const rows = await prisma.appointment.findMany({
    where: {
      salonId,
      organizationId: session.organizationId,
      isActive: true,
      status: { notIn: ["CANCELLED", "NO_SHOW"] as never[] },
      startAt: { gte: weekStart, lte: weekEnd },
    },
    select: {
      startAt:            true,
      status:             true,
      priceCentsSnapshot: true,
      service: { select: { priceCents: true } },
    },
  });

  // Agréger par date locale du salon
  const byDate = new Map<string, { count: number; revenue: number }>();
  for (const appt of rows) {
    const ds = new Intl.DateTimeFormat("fr-CA", { timeZone: timezone }).format(appt.startAt);
    const entry = byDate.get(ds) ?? { count: 0, revenue: 0 };
    entry.count++;
    if ((appt.status as string) === "COMPLETED") {
      entry.revenue += appt.priceCentsSnapshot ?? appt.service.priceCents;
    }
    byDate.set(ds, entry);
  }

  return days.map(({ dateStr, dayLabel }) => {
    const entry = byDate.get(dateStr) ?? { count: 0, revenue: 0 };
    return {
      dayLabel,
      appointmentsCount: entry.count,
      revenueCents:      entry.revenue,
    };
  });
}

function buildEmptyWeek(timezone: string): WeeklyPoint[] {
  return getCurrentWeekDates(timezone).map(({ dayLabel }) => ({
    dayLabel,
    appointmentsCount: 0,
    revenueCents:      0,
  }));
}
