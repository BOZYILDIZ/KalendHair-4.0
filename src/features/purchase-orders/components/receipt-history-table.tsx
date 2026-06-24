import type { PurchaseOrderReceiptView } from "../types";

type Props = { receipts: PurchaseOrderReceiptView[] };

export function ReceiptHistoryTable({ receipts }: Props) {
  if (receipts.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">
        Aucune réception enregistrée.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {receipts.map((r) => (
        <div key={r.id} className="rounded-md border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">
                Réception du{" "}
                {new Date(r.receivedAt).toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </span>
              {r.createdByName && (
                <span className="ml-2 text-xs text-gray-500">par {r.createdByName}</span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              Total :{" "}
              {(r.lines.reduce((s, l) => s + l.totalCostCents, 0) / 100).toLocaleString("fr-FR", {
                style: "currency", currency: "EUR",
              })}
            </span>
          </div>

          {r.notes && <p className="mb-3 text-xs text-gray-500">{r.notes}</p>}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Produit</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600">Qté reçue</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600">Coût unit.</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {r.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2 text-gray-900">{l.productName}</td>
                    <td className="px-3 py-2 text-right">{l.quantityReceived}</td>
                    <td className="px-3 py-2 text-right">
                      {(l.unitCostCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {(l.totalCostCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
