import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageAppointment } from "@/lib/permissions/appointment.permissions";
import {
  getAgendaDay,
  getAgendaWeek,
  computeWeekStart,
} from "@/features/agenda/agenda.service";
import { AgendaDayView } from "@/features/agenda/components/agenda-day-view";
import { AgendaWeekView } from "@/features/agenda/components/agenda-week-view";
import { AgendaNav } from "@/features/agenda/components/agenda-nav";
import { AgendaEmployeeFilter } from "@/features/agenda/components/agenda-employee-filter";
import type { AgendaView } from "@/features/agenda/types";
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    view?: string;
    date?: string;
    employeeId?: string;
  }>;
};

function isValidDateStr(s: unknown): s is string {
  if (typeof s !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return !isNaN(Date.parse(s));
}

function todayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function AgendaPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageAppointment(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;

  const view: AgendaView = sp.view === "week" ? "week" : "day";
  const timezone = salon.timezone ?? "Europe/Paris";
  const today = todayInTimezone(timezone);

  const rawDate = isValidDateStr(sp.date) ? sp.date : today;
  const employeeId = sp.employeeId && sp.employeeId.length > 0
    ? sp.employeeId
    : undefined;

  if (view === "day") {
    const data = await getAgendaDay(
      salon.id,
      session.organizationId,
      rawDate,
      timezone,
      employeeId,
    );

    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Page header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/appointments/new"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              + Nouveau RDV
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Tableau de bord
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <AgendaNav
            view="day"
            date={rawDate}
            today={today}
            employeeId={employeeId}
          />
          {data.employees.length > 1 && (
            <AgendaEmployeeFilter
              employees={data.employees}
              employeeId={employeeId}
              view="day"
              date={rawDate}
            />
          )}
        </div>

        <AgendaDayView data={data} />
      </div>
    );
  }

  // Week view
  const weekStart = computeWeekStart(rawDate);
  const data = await getAgendaWeek(
    salon.id,
    session.organizationId,
    weekStart,
    timezone,
    employeeId,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Page header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/appointments/new"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Nouveau RDV
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Tableau de bord
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <AgendaNav
          view="week"
          date={weekStart}
          today={today}
          employeeId={employeeId}
        />
        {data.employees.length > 1 && (
          <AgendaEmployeeFilter
            employees={data.employees}
            employeeId={employeeId}
            view="week"
            date={weekStart}
          />
        )}
      </div>

      <AgendaWeekView data={data} employeeId={employeeId} />
    </div>
  );
}
