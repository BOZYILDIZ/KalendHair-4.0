import type { CommissionEntryView } from "@/features/commissions/types";
import { CommissionStatusBadge } from "./commission-status-badge";

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR",
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(date));
}

export function CommissionEntryTable({
  entries,
  showEmployee = false,
}: {
  entries: CommissionEntryView[];
  showEmployee?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        Aucune commission enregistrée.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-medium uppercase text-gray-500">
            <th className="py-2 pr-4">Date</th>
            {showEmployee && <th className="py-2 pr-4">Employé</th>}
            <th className="py-2 pr-4">Description</th>
            <th className="py-2 pr-4 text-right">Base</th>
            <th className="py-2 pr-4 text-right">Commission</th>
            <th className="py-2 pr-4 text-right">Net</th>
            <th className="py-2">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="py-2 pr-4 whitespace-nowrap text-gray-600">
                {formatDate(e.createdAt)}
              </td>
              {showEmployee && (
                <td className="py-2 pr-4 text-gray-900">{e.employeeName}</td>
              )}
              <td className="py-2 pr-4 text-gray-700 max-w-xs truncate">
                {e.description}
              </td>
              <td className="py-2 pr-4 text-right text-gray-600">
                {formatEuros(e.baseAmountCents)}
              </td>
              <td className="py-2 pr-4 text-right font-medium text-gray-900">
                {formatEuros(e.commissionCents)}
              </td>
              <td className="py-2 pr-4 text-right font-semibold text-indigo-700">
                {formatEuros(e.netCommissionCents)}
              </td>
              <td className="py-2">
                <CommissionStatusBadge status={e.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
