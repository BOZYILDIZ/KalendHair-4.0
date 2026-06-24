import type { CommissionKpi } from "@/features/dashboard/types";

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR",
  }).format(cents / 100);
}

export function KpiCommissionCard({ commissions }: { commissions: CommissionKpi }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Commissions
      </p>
      <p className="text-2xl font-bold text-indigo-700">
        {formatEuros(commissions.totalCents)}
      </p>
      <p className="mt-0.5 text-xs text-gray-400">Total période (hors annulées)</p>

      {commissions.topEmployees.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-gray-500">Top employés</p>
          {commissions.topEmployees.slice(0, 3).map((e) => (
            <div key={e.employeeId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {e.color && (
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: e.color }}
                  />
                )}
                <span className="text-xs text-gray-700">
                  {e.firstName} {e.lastName}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-900">
                {formatEuros(e.commissionCents)}
              </span>
            </div>
          ))}
        </div>
      )}

      {commissions.topEmployees.length === 0 && (
        <p className="mt-3 text-xs text-gray-400">
          Aucune commission sur la période.
        </p>
      )}
    </div>
  );
}
