import { redirect } from "next/navigation";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import { getMrrBreakdown, getSubscriptionStats } from "@/features/admin/admin-metrics.service";

export default async function AdminMetricsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [mrr, stats] = await Promise.all([
    getMrrBreakdown(),
    getSubscriptionStats(),
  ]);

  const arr = mrr.total * 12;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Métriques SaaS</h1>
        <p className="text-sm text-gray-500">MRR, ARR et statistiques globales</p>
      </div>

      {/* MRR / ARR */}
      <div className="grid grid-cols-2 gap-6">
        <MetricCard
          title="MRR"
          value={`${mrr.total.toFixed(2)} €`}
          desc="Monthly Recurring Revenue"
          color="blue"
        />
        <MetricCard
          title="ARR"
          value={`${arr.toFixed(2)} €`}
          desc="Annual Recurring Revenue (MRR × 12)"
          color="indigo"
        />
      </div>

      {/* MRR par plan */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">MRR par plan</h2>
        <div className="grid grid-cols-3 gap-4">
          {(["ESSENTIAL", "PRO", "BUSINESS"] as const).map((code) => (
            <div key={code} className="rounded border p-4">
              <p className="text-sm text-gray-500">{code}</p>
              <p className="text-xl font-bold text-gray-900">
                {(mrr.byPlan[code] ?? 0).toFixed(2)} €
              </p>
              <p className="text-xs text-gray-400">/ mois</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistiques abonnements */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Statistiques abonnements</h2>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <StatRow label="Total" value={stats.total} />
          <StatRow label="Actifs" value={stats.byStatus.ACTIVE} />
          <StatRow label="En essai" value={stats.byStatus.TRIAL} />
          <StatRow label="En retard" value={stats.byStatus.PAST_DUE} />
          <StatRow label="Annulés" value={stats.byStatus.CANCELED} />
          <StatRow label="Plans gratuits" value={stats.freeCount} />
          <StatRow label="Remises actives" value={stats.activeDiscountsCount} />
          <StatRow label="Orgs suspendues" value={stats.suspendedOrgsCount} />
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Note : les abonnements en plan gratuit (isFree) sont exclus du MRR/ARR.
        </p>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  desc,
  color,
}: {
  title: string;
  value: string;
  desc: string;
  color: string;
}) {
  const borders: Record<string, string> = {
    blue: "border-blue-500",
    indigo: "border-indigo-500",
  };
  return (
    <div
      className={`rounded-lg border-l-4 bg-white p-6 shadow-sm ${borders[color] ?? ""}`}
    >
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-4xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{desc}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border p-3">
      <p className="text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
