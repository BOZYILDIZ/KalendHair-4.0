import Link from "next/link";
import type { AgendaView } from "../types";

type Props = {
  view: AgendaView;
  date: string;
  today: string;
  employeeId?: string;
};

function addDaysToStr(dateStr: string, days: number): string {
  const parts = dateStr.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().split("T")[0]!;
}

function computeWeekStartLocal(dateStr: string): string {
  const parts = dateStr.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  dt.setUTCDate(dt.getUTCDate() - daysFromMonday);
  return dt.toISOString().split("T")[0]!;
}

function formatDayTitle(dateStr: string): string {
  const parts = dateStr.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
}

function formatWeekTitle(weekStart: string): string {
  const parts = weekStart.split("-");
  const y = parseInt(parts[0] ?? "2000", 10);
  const m = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60_000);
  const startDay = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "numeric",
  }).format(start);
  const endFull = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(end);
  return `${startDay} – ${endFull}`;
}

function buildUrl(
  view: AgendaView,
  date: string,
  employeeId?: string,
): string {
  const params = new URLSearchParams({ view, date });
  if (employeeId) params.set("employeeId", employeeId);
  return `/dashboard/agenda?${params.toString()}`;
}

export function AgendaNav({ view, date, today, employeeId }: Props) {
  const step = view === "week" ? 7 : 1;
  const prevDate = addDaysToStr(date, -step);
  const nextDate = addDaysToStr(date, step);

  const todayNavDate =
    view === "week" ? computeWeekStartLocal(today) : today;
  const isToday = date === todayNavDate;

  const title =
    view === "week" ? formatWeekTitle(date) : formatDayTitle(date);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={buildUrl(view, prevDate, employeeId)}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        aria-label="Période précédente"
      >
        ←
      </Link>

      <span className="min-w-52 text-center text-sm font-medium capitalize">
        {title}
      </span>

      <Link
        href={buildUrl(view, nextDate, employeeId)}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        aria-label="Période suivante"
      >
        →
      </Link>

      {!isToday && (
        <Link
          href={buildUrl(view, todayNavDate, employeeId)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Aujourd&apos;hui
        </Link>
      )}

      {/* View toggle */}
      <div className="ml-2 flex overflow-hidden rounded border border-gray-300">
        <Link
          href={buildUrl("day", view === "week" ? computeWeekStartLocal(date) : date, employeeId)}
          className={`px-3 py-1.5 text-sm ${view === "day" ? "bg-indigo-600 text-white" : "hover:bg-gray-50"}`}
        >
          Jour
        </Link>
        <Link
          href={buildUrl("week", view === "week" ? date : computeWeekStartLocal(date), employeeId)}
          className={`border-l border-gray-300 px-3 py-1.5 text-sm ${view === "week" ? "bg-indigo-600 text-white" : "hover:bg-gray-50"}`}
        >
          Semaine
        </Link>
      </div>
    </div>
  );
}
