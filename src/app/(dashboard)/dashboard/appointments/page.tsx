import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageAppointment } from "@/lib/permissions/appointment.permissions";
import {
  getAppointments,
  getActiveServices,
  getEmployeesForService,
} from "@/features/appointments/appointment.service";
import { AppointmentList } from "@/features/appointments/components/appointment-list";
import type { AppointmentFilters, AppointmentStatus } from "@/features/appointments/types";

type Props = {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    employeeId?: string;
    status?: string;
  }>;
};

function formatInputDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

export default async function AppointmentsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageAppointment(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;

  // Default: today → today+6 days
  const today = new Date();
  const todayStr    = formatInputDate(today);
  const plusWeekStr = formatInputDate(new Date(today.getTime() + 6 * 24 * 60 * 60_000));

  const filters: AppointmentFilters = {
    dateFrom:   sp.dateFrom   ?? todayStr,
    dateTo:     sp.dateTo     ?? plusWeekStr,
    employeeId: sp.employeeId ?? undefined,
    status:     sp.status     ? (sp.status as AppointmentStatus) : undefined,
  };

  // Load employees for filter dropdown
  const services   = await getActiveServices(salon.id, session.organizationId);
  const employeeSets = await Promise.all(
    services.map((s) =>
      getEmployeesForService(salon.id, s.id, session.organizationId),
    ),
  );
  const allEmployees = Array.from(
    new Map(
      employeeSets.flat().map((e) => [e.id, e]),
    ).values(),
  );

  const appointments = await getAppointments(salon.id, session.organizationId, filters);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Rendez-vous</h1>
        <Link
          href="/dashboard/appointments/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nouveau
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">Du</label>
          <input
            type="date"
            name="dateFrom"
            defaultValue={filters.dateFrom}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Au</label>
          <input
            type="date"
            name="dateTo"
            defaultValue={filters.dateTo}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        {allEmployees.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500">Employé</label>
            <select
              name="employeeId"
              defaultValue={filters.employeeId ?? ""}
              className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="">Tous</option>
              {allEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-500">Statut</label>
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="CANCELLED">Annulé</option>
            <option value="NO_SHOW">Absent</option>
            <option value="COMPLETED">Terminé</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filtrer
        </button>
        <Link
          href="/dashboard/appointments"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Réinitialiser
        </Link>
      </form>

      <div className="rounded-lg border border-gray-200 bg-white">
        <AppointmentList
          appointments={appointments}
          salonTimezone={salon.timezone}
        />
      </div>

      <p className="mt-3 text-xs text-gray-400 text-right">
        {appointments.length} rendez-vous affichés (max 100 par requête)
      </p>
    </div>
  );
}
