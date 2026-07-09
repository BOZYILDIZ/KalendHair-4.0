import { TrendingUp, BarChart3 } from "lucide-react";
import { Sparkline } from "@/features/dashboard/components/sparkline";
import { formatKpiValue } from "@/features/dashboard/utils/kpi-format";
import type { DashboardPermissions } from "@/features/dashboard/overview.types";

// ─── Types exportés ───────────────────────────────────────────────────────────

/**
 * Point de données hebdomadaire.
 * Construit par le parent à partir de requêtes Prisma supplémentaires.
 * `revenueCents` n'est utilisé que pour OWNER / MANAGER.
 */
export type WeeklyPoint = {
  /** Libellé court du jour : "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim" */
  dayLabel:          string;
  revenueCents:      number;
  appointmentsCount: number;
};

export interface WeekSparklineWidgetProps {
  /**
   * Série de 7 points (lun → dim).
   * null = données indisponibles (état erreur / non chargé).
   */
  weeklyData:  WeeklyPoint[] | null;
  permissions: DashboardPermissions;
  isLoading?:  boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sumRevenue(data: WeeklyPoint[]): number {
  return data.reduce((acc, d) => acc + d.revenueCents, 0);
}

function sumAppointments(data: WeeklyPoint[]): number {
  return data.reduce((acc, d) => acc + d.appointmentsCount, 0);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WeekSparklineSkeleton() {
  return (
    <div role="status" aria-label="Chargement des données de la semaine" aria-busy="true">
      {/* Stats */}
      <div style={{ display: "flex", gap: "var(--kh-space-4)", padding: "var(--kh-space-4) var(--kh-space-5) 0" }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--kh-space-1)" }}>
            <div className="kh-shimmer" style={{ width: "60%", height: 11, borderRadius: "var(--kh-radius)", background: "var(--kh-surface-raised)" }} />
            <div className="kh-shimmer" style={{ width: "40%", height: 22, borderRadius: "var(--kh-radius)", background: "var(--kh-surface-raised)" }} />
          </div>
        ))}
      </div>
      {/* Sparkline */}
      <div className="kh-shimmer" style={{ margin: "var(--kh-space-4) var(--kh-space-5)", height: 56, borderRadius: "var(--kh-radius-md)", background: "var(--kh-surface-raised)" }} />
    </div>
  );
}

// ─── WeekSparklineWidget ──────────────────────────────────────────────────────

/**
 * Widget de synthèse hebdomadaire — Zone E du Dashboard Experience 2.0.
 *
 * OWNER / MANAGER : CA semaine + sparkline revenue + total RDV
 * EMPLOYEE        : sparkline activité (appointments) + total RDV personnel uniquement
 *
 * Le composant reçoit `weeklyData: WeeklyPoint[]` construit par le parent —
 * getDashboardOverview() ne couvre que la journée.
 * Pas de refetch dans ce widget.
 */
export function WeekSparklineWidget({
  weeklyData,
  permissions,
  isLoading = false,
}: WeekSparklineWidgetProps) {
  const showRevenue = permissions.canViewRevenue;

  return (
    <section
      aria-label="Synthèse de la semaine"
      style={{
        background:    "var(--kh-surface)",
        borderRadius:  "var(--kh-radius-lg)",
        border:        "1px solid var(--kh-border)",
        boxShadow:     "var(--kh-shadow-sm)",
        display:       "flex",
        flexDirection: "column",
        minWidth:      0,
        overflow:      "hidden",
      }}
    >
      {/* En-tête */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            "var(--kh-space-2)",
          padding:        "var(--kh-space-4) var(--kh-space-5)",
          borderBottom:   "1px solid var(--kh-border)",
          flexShrink:     0,
        }}
      >
        {showRevenue ? (
          <TrendingUp size={16} strokeWidth={1.5} aria-hidden="true" style={{ color: "var(--kh-success-600)", flexShrink: 0 }} />
        ) : (
          <BarChart3 size={16} strokeWidth={1.5} aria-hidden="true" style={{ color: "var(--kh-brand-600)", flexShrink: 0 }} />
        )}
        <h2
          style={{
            fontSize:   "var(--kh-text-sm)",
            fontWeight: "var(--kh-font-semibold)",
            color:      "var(--kh-text)",
            margin:     0,
          }}
        >
          Cette semaine
        </h2>
      </div>

      {/* Corps */}
      {isLoading ? (
        <WeekSparklineSkeleton />
      ) : weeklyData === null || weeklyData.length === 0 ? (
        <WeekSparklineEmpty />
      ) : (
        <WeekSparklineContent
          data={weeklyData}
          showRevenue={showRevenue}
        />
      )}
    </section>
  );
}

// ─── Contenu normal ───────────────────────────────────────────────────────────

function WeekSparklineContent({
  data,
  showRevenue,
}: {
  data:        WeeklyPoint[];
  showRevenue: boolean;
}) {
  const totalRevenue      = sumRevenue(data);
  const totalAppointments = sumAppointments(data);

  const sparkValues = showRevenue
    ? data.map((d) => d.revenueCents)
    : data.map((d) => d.appointmentsCount);

  const sparkTone    = showRevenue ? "success" : "brand";
  const revenueLabel = formatKpiValue(totalRevenue, "currency");
  const apptLabel    = totalAppointments.toString();

  const ariaLabel = showRevenue
    ? `Semaine : ${revenueLabel} de chiffre d'affaires, ${apptLabel} rendez-vous`
    : `Semaine : ${apptLabel} rendez-vous`;

  return (
    <div>
      {/* Stats inline */}
      <div
        style={{
          display:  "flex",
          gap:      "var(--kh-space-5)",
          padding:  "var(--kh-space-4) var(--kh-space-5) 0",
          flexWrap: "wrap",
        }}
      >
        {showRevenue && (
          <StatBlock
            label="CA semaine"
            value={revenueLabel}
            mono
          />
        )}
        <StatBlock
          label={showRevenue ? "Rendez-vous" : "RDV de la semaine"}
          value={apptLabel}
          mono
        />
      </div>

      {/* Sparkline */}
      <div
        style={{
          padding: "var(--kh-space-3) var(--kh-space-5) var(--kh-space-2)",
        }}
      >
        <Sparkline
          values={sparkValues}
          height={56}
          tone={sparkTone}
          showDot
          ariaLabel={ariaLabel}
        />
      </div>

      {/* Labels des jours */}
      <div
        aria-hidden="true"
        style={{
          display:        "flex",
          justifyContent: "space-between",
          padding:        "0 var(--kh-space-5) var(--kh-space-3)",
        }}
      >
        {data.map((d) => (
          <span
            key={d.dayLabel}
            style={{
              fontSize:  "var(--kh-text-xs)",
              color:     "var(--kh-text-muted)",
              textAlign: "center",
              minWidth:  0,
            }}
          >
            {d.dayLabel}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── État vide ────────────────────────────────────────────────────────────────

function WeekSparklineEmpty() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding:        "var(--kh-space-8) var(--kh-space-5)",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        gap:            "var(--kh-space-3)",
        textAlign:      "center",
      }}
    >
      {/* Sparkline vide (trait pointillé neutre) */}
      <div style={{ width: "100%", padding: "0 var(--kh-space-2)" }}>
        <Sparkline
          values={[]}
          height={48}
          tone="neutral"
          showDot={false}
          ariaLabel="Aucune donnée disponible pour cette semaine"
        />
      </div>
      <p
        style={{
          fontSize:   "var(--kh-text-xs)",
          color:      "var(--kh-text-muted)",
          margin:     0,
          lineHeight: "var(--kh-leading-relaxed)",
        }}
      >
        Données non disponibles pour cette semaine.
      </p>
    </div>
  );
}

// ─── Stat block ───────────────────────────────────────────────────────────────

function StatBlock({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span
        style={{
          fontSize:   "var(--kh-text-xs)",
          color:      "var(--kh-text-muted)",
          fontWeight: "var(--kh-font-medium)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize:           "var(--kh-text-xl)",
          fontWeight:         "var(--kh-font-semibold)",
          color:              "var(--kh-text)",
          fontFamily:         mono ? "var(--kh-font-mono)" : undefined,
          fontVariantNumeric: mono ? "tabular-nums" : undefined,
          lineHeight:         "var(--kh-leading-tight)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
