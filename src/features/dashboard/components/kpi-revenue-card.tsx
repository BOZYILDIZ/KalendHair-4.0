import { KpiCard } from "./kpi-card";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

type Props = { revenueCents: number };

export function KpiRevenueCard({ revenueCents }: Props) {
  return (
    <KpiCard
      title="Chiffre d'affaires"
      value={formatCents(revenueCents)}
      subtitle="RDV terminés uniquement"
      badge="Réalisé"
    />
  );
}
