import Link from "next/link";
import type { PurchaseOrderSummary } from "../types";
import { PurchaseOrderStatusBadge } from "./purchase-order-status-badge";

type Props = {
  orders: PurchaseOrderSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export function PurchaseOrderList({ orders, total, page, pageSize }: Props) {
  if (orders.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-gray-500">
        Aucun bon de commande. Créez-en un pour commencer.
      </p>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Référence</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Fournisseur</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Lignes</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Livraison prévue</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Créé le</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {o.reference ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-700">{o.supplierName}</td>
                <td className="px-4 py-3">
                  <PurchaseOrderStatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{o.lineCount}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {(o.totalOrderedCents / 100).toLocaleString("fr-FR", {
                    style: "currency", currency: "EUR",
                  })}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {o.expectedAt
                    ? new Date(o.expectedAt).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/purchase-orders/${o.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <p className="text-center text-xs text-gray-500">
          Page {page} / {totalPages} — {total} commande{total > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
