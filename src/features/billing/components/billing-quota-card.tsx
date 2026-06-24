// Codex — Sprint 18
import type { BillingQuota } from "../types";

type Props = { quota: BillingQuota };

function QuotaRow({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const pct = limit !== null ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">
          {used} / {limit !== null ? limit : "∞"}
        </span>
      </div>
      {limit !== null && (
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-blue-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function BillingQuotaCard({ quota }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Quotas</h3>
      <div className="space-y-4">
        <QuotaRow label="Salons"   used={quota.salons.used}    limit={quota.salons.limit} />
        <QuotaRow label="Employés" used={quota.employees.used} limit={quota.employees.limit} />
      </div>
    </div>
  );
}
