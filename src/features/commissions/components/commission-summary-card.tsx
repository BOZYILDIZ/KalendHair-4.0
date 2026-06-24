import type { CommissionSummary } from "@/features/commissions/types";

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style:    "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function CommissionSummaryCard({ summary }: { summary: CommissionSummary }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">Résumé des commissions</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500">Base</p>
          <p className="text-lg font-bold text-gray-900">
            {formatEuros(summary.totalBaseCents)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ajustements</p>
          <p
            className={`text-lg font-bold ${
              summary.totalAdjustmentCents >= 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            {summary.totalAdjustmentCents >= 0 ? "+" : ""}
            {formatEuros(summary.totalAdjustmentCents)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Net</p>
          <p className="text-lg font-bold text-indigo-700">
            {formatEuros(summary.netTotalCents)}
          </p>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-500 border-t pt-3">
        <span>{summary.pendingCount} en attente</span>
        <span>{summary.adjustedCount} ajustée(s)</span>
        <span>{summary.cancelledCount} annulée(s)</span>
      </div>
    </div>
  );
}
