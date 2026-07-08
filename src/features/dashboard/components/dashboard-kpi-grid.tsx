import {
  CalendarCheck2,
  Clock3,
  Users,
  TrendingUp,
  BarChart2,
  Banknote,
} from "lucide-react";
import type { DashboardOverview } from "@/features/dashboard/overview.types";
import {
  DashboardKpiCard,
  DashboardKpiCardSkeleton,
} from "@/features/dashboard/components/dashboard-kpi-card";

// ─── DashboardKpiGrid ──────────────────────────────────────────────────────

interface DashboardKpiGridProps {
  data: Pick<DashboardOverview, "kpi" | "trend" | "permissions">;
}

/**
 * Grille responsive des cartes KPI du tableau de bord.
 * - 1 col mobile, 2 col tablette (≥ 640px), 3 col desktop (≥ 1024px)
 * - Les indicateurs revenue sont masqués pour le rôle EMPLOYEE.
 * - La grille adapte son contenu : 4 cartes OWNER/MANAGER, 3 cartes EMPLOYEE.
 */
export function DashboardKpiGrid({ data }: DashboardKpiGridProps) {
  const { kpi, trend, permissions } = data;
  const canSeeRevenue = permissions.canViewRevenue;

  return (
    <div
      role="region"
      aria-label="Indicateurs clés de performance"
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap:                 "var(--kh-space-4)",
      }}
    >
      {/* ── Chiffre d'affaires (OWNER / MANAGER uniquement) ── */}
      <DashboardKpiCard
        title="Chiffre d'affaires"
        value={kpi.revenueCents ?? 0}
        format="currency"
        icon={Banknote}
        trend={trend.revenue}
        sentiment={canSeeRevenue ? "positive" : "neutral"}
        hidden={!canSeeRevenue}
        subtext="Prestations complétées"
      />

      {/* ── Rendez-vous du jour ── */}
      <DashboardKpiCard
        title="Rendez-vous"
        value={kpi.appointmentsTotal}
        format="count"
        icon={CalendarCheck2}
        trend={trend.appointments}
        sentiment="neutral"
        subtext={`${kpi.confirmedCount} confirmé${kpi.confirmedCount !== 1 ? "s" : ""} · ${kpi.pendingCount} en attente`}
      />

      {/* ── Taux de remplissage ── */}
      <DashboardKpiCard
        title="Taux de remplissage"
        value={kpi.fillRatePercent ?? 0}
        format="percent"
        icon={BarChart2}
        trend={null}
        sentiment={
          kpi.fillRatePercent === null
            ? "neutral"
            : kpi.fillRatePercent >= 80
            ? "positive"
            : kpi.fillRatePercent >= 50
            ? "neutral"
            : "warning"
        }
        hidden={kpi.fillRatePercent === null}
        subtext="Sur les créneaux disponibles"
      />

      {/* ── Nouveaux clients ── */}
      <DashboardKpiCard
        title="Nouveaux clients"
        value={kpi.newClientsToday}
        format="count"
        icon={Users}
        trend={null}
        sentiment={kpi.newClientsToday > 0 ? "positive" : "neutral"}
        subtext="Aujourd'hui"
      />

      {/* ── Rendez-vous complétés ── */}
      <DashboardKpiCard
        title="Complétés"
        value={kpi.completedCount}
        format="count"
        icon={Clock3}
        trend={null}
        sentiment="neutral"
        subtext="Prestations terminées"
      />

      {/* ── En attente de confirmation ── */}
      {kpi.pendingCount > 0 && (
        <DashboardKpiCard
          title="En attente"
          value={kpi.pendingCount}
          format="count"
          icon={TrendingUp}
          trend={null}
          sentiment={kpi.pendingCount >= 5 ? "warning" : "neutral"}
          subtext="À confirmer"
        />
      )}
    </div>
  );
}

// ─── DashboardKpiGridSkeleton ──────────────────────────────────────────────

/**
 * Squelette chargement — affiche 4 cartes (nombre le plus courant).
 * Utilise `aria-busy` sur le conteneur pour indiquer l'état de chargement.
 */
export function DashboardKpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="region"
      aria-label="Chargement des indicateurs"
      aria-busy="true"
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap:                 "var(--kh-space-4)",
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <DashboardKpiCardSkeleton key={i} />
      ))}
    </div>
  );
}
