import Link from "next/link";
import type { ClientAppointmentsPage } from "../types";
import type { AppointmentStatus } from "@/features/appointments/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/features/appointments/types";

type Props = {
  data: ClientAppointmentsPage;
  clientId: string;
  search?: string;
};

function buildPageUrl(clientId: string, page: number): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/dashboard/clients/${clientId}${qs ? `?${qs}` : ""}`;
}

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const color = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>
  );
}

export function ClientAppointmentHistory({ data, clientId }: Props) {
  const { items, total, page, pageCount } = data;

  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        Aucun rendez-vous enregistré pour ce client.
      </p>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Employé
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Statut
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                Prix
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{row.startAt}</td>
                <td className="px-4 py-3 text-gray-700">{row.serviceName}</td>
                <td className="px-4 py-3 text-gray-500">
                  {row.employeeFirstName} {row.employeeLastName}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatEuros(row.effectivePriceCents)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/appointments/${row.id}`}
                    className="text-xs text-gray-400 hover:text-indigo-600"
                  >
                    →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">
            {total} rendez-vous — page {page}/{pageCount}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(clientId, page - 1)}
                className="rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                ← Précédent
              </Link>
            )}
            {page < pageCount && (
              <Link
                href={buildPageUrl(clientId, page + 1)}
                className="rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                Suivant →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
