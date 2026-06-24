import type { StockMovementView } from "../types";

const TYPE_LABELS: Record<string, string> = {
  ENTRY:      "Entrée",
  SALE:       "Vente",
  USAGE:      "Utilisation",
  ADJUSTMENT: "Ajustement",
};

type Props = {
  movements: StockMovementView[];
};

export function StockHistoryTable({ movements }: Props) {
  if (movements.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">
        Aucun mouvement de stock.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Produit</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">Qté</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">Avant</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">Après</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {movements.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500">
                {new Date(m.createdAt).toLocaleDateString("fr-FR", {
                  day:   "2-digit",
                  month: "2-digit",
                  year:  "numeric",
                  hour:  "2-digit",
                  minute:"2-digit",
                })}
              </td>
              <td className="px-4 py-3 text-gray-900">{m.productName}</td>
              <td className="px-4 py-3 text-gray-700">
                {TYPE_LABELS[m.type] ?? m.type}
              </td>
              <td className={`px-4 py-3 text-right font-medium ${m.quantityDelta >= 0 ? "text-green-600" : "text-red-600"}`}>
                {m.quantityDelta >= 0 ? `+${m.quantityDelta}` : m.quantityDelta}
              </td>
              <td className="px-4 py-3 text-right text-gray-500">{m.quantityBefore}</td>
              <td className="px-4 py-3 text-right text-gray-700">{m.quantityAfter}</td>
              <td className="px-4 py-3 text-gray-500">{m.notes ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
