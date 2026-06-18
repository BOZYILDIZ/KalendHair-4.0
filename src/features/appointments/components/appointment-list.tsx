import Link from "next/link";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import type { AppointmentListView } from "../types";

type Props = {
  appointments: AppointmentListView[];
  salonTimezone: string;
};

function formatDatetime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    hour:   "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function AppointmentList({ appointments, salonTimezone }: Props) {
  if (appointments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Aucun rendez-vous trouvé.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Date / Heure</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Client</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Service</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Employé</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Statut</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {appointments.map((appt) => (
            <tr key={appt.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                {formatDatetime(appt.startAt, salonTimezone)}
                <span className="ml-1 text-gray-400">
                  – {formatTime(appt.endAt, salonTimezone)}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {appt.guestFirstName} {appt.guestLastName}
                {appt.guestEmail && (
                  <div className="text-xs text-gray-400">{appt.guestEmail}</div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700">{appt.service.name}</td>
              <td className="px-4 py-3 text-gray-700">
                {appt.employee.firstName} {appt.employee.lastName}
              </td>
              <td className="px-4 py-3">
                <AppointmentStatusBadge status={appt.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/appointments/${appt.id}`}
                  className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Voir →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
