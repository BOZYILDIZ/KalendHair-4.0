import type { ClientStats } from "../types";

type Props = {
  stats: ClientStats;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

type StatItemProps = {
  label: string;
  value: string;
  sub?: string;
};

function StatItem({ label, value, sub }: StatItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

export function ClientStatsCard({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatItem label="Total rendez-vous" value={String(stats.totalAppointments)} />
      <StatItem
        label="Dernière visite"
        value={stats.lastVisitAt ?? "—"}
        sub={stats.lastVisitAt ? undefined : "Aucun RDV terminé"}
      />
      <StatItem
        label="Dépense totale"
        value={formatEuros(stats.totalSpentCents)}
        sub="RDV terminés uniquement"
      />
      <StatItem
        label="Annulations"
        value={String(stats.cancellationCount)}
        sub={`dont ${stats.noShowCount} absence${stats.noShowCount > 1 ? "s" : ""}`}
      />
    </div>
  );
}
