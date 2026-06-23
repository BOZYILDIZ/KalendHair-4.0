import Link from "next/link";
import type { PaymentListItem, PaymentMethod, PaymentStatus } from "../types";
import { PaymentMethodBadge } from "./payment-method-badge";
import { PaymentTransactionBadge } from "./payment-status-badge";

type Props = {
  items:            PaymentListItem[];
  totalAmountCents: number;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function PaymentHistoryTable({ items, totalAmountCents }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-400">Aucun paiement sur cette période.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Client</th>
              <th className="px-4 py-3 text-left font-medium">Prestation</th>
              <th className="px-4 py-3 text-left font-medium">Méthode</th>
              <th className="px-4 py-3 text-right font-medium">Montant</th>
              <th className="px-4 py-3 text-left font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{formatDate(item.paidAt)}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {item.clientName ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {item.appointmentId ? (
                    <Link
                      href={`/dashboard/appointments/${item.appointmentId}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {item.appointmentLabel ?? "Voir RDV"}
                    </Link>
                  ) : (
                    <span className="text-gray-400">Libre</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <PaymentMethodBadge method={item.method as PaymentMethod} />
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatEuros(item.amountCents)}
                </td>
                <td className="px-4 py-3">
                  <PaymentTransactionBadge status={item.status as PaymentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 px-4 py-3 text-right text-sm font-medium text-gray-900">
        Total période&nbsp;: {formatEuros(totalAmountCents)}
      </div>
    </div>
  );
}
