import type { LucideIcon } from "lucide-react";
import type { TrendResult } from "@/features/dashboard/overview.types";
import type { KpiValueFormat } from "@/features/dashboard/utils/kpi-format";
import { KpiValue } from "@/features/dashboard/components/kpi-value";
import { KpiTrendBadge } from "@/features/dashboard/components/kpi-trend-badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type KpiCardSentiment = "neutral" | "positive" | "warning" | "danger";

export interface DashboardKpiCardProps {
  title:     string;
  value:     number;
  format:    KpiValueFormat;
  /** Ligne d'information secondaire sous la valeur */
  subtext?:  string;
  icon?:     LucideIcon;
  trend?:    TrendResult | null;
  sentiment?: KpiCardSentiment;
  /** true = CA masqué (EMPLOYEE) — affiche "—" */
  hidden?:   boolean;
}

// ─── Sentiment → couleur icône ─────────────────────────────────────────────

const SENTIMENT_ICON_COLOR: Record<KpiCardSentiment, string> = {
  neutral:  "var(--kh-brand-600)",
  positive: "var(--kh-success-600)",
  warning:  "var(--kh-warning-600)",
  danger:   "var(--kh-danger-600)",
};

const SENTIMENT_ICON_BG: Record<KpiCardSentiment, string> = {
  neutral:  "var(--kh-brand-50)",
  positive: "var(--kh-success-50)",
  warning:  "var(--kh-warning-50)",
  danger:   "var(--kh-danger-50)",
};

// ─── DashboardKpiCard ─────────────────────────────────────────────────────

export function DashboardKpiCard({
  title,
  value,
  format,
  subtext,
  icon: Icon,
  trend,
  sentiment = "neutral",
  hidden = false,
}: DashboardKpiCardProps) {
  return (
    <article
      className="kh-kpi-card"
      aria-label={title}
      style={{
        background:   "var(--kh-surface)",
        borderRadius: "var(--kh-radius-lg)",
        border:       "1px solid var(--kh-border)",
        boxShadow:    "var(--kh-shadow-sm)",
        padding:      "var(--kh-space-5)",
        display:      "flex",
        flexDirection:"column",
        gap:          "var(--kh-space-3)",
        transition:   `box-shadow var(--kh-dur-normal) var(--kh-ease-default),
                       border-color var(--kh-dur-normal) var(--kh-ease-default)`,
        minWidth:     0,
      }}
    >
      {/* ── En-tête : titre + icône ── */}
      <div
        style={{
          display:        "flex",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          gap:            "var(--kh-space-3)",
        }}
      >
        <p
          style={{
            fontSize:   "var(--kh-text-sm)",
            fontWeight: "var(--kh-font-medium)",
            color:      "var(--kh-text-secondary)",
            lineHeight: "var(--kh-leading-tight)",
            margin:     0,
          }}
        >
          {title}
        </p>

        {Icon && (
          <div
            aria-hidden="true"
            style={{
              width:         "var(--kh-btn-sm)",   /* 32px */
              height:        "var(--kh-btn-sm)",
              borderRadius:  "var(--kh-radius-md)",
              background:    SENTIMENT_ICON_BG[sentiment],
              display:       "flex",
              alignItems:    "center",
              justifyContent:"center",
              flexShrink:    0,
            }}
          >
            <Icon
              size={16}
              strokeWidth={1.5}
              style={{ color: SENTIMENT_ICON_COLOR[sentiment] }}
            />
          </div>
        )}
      </div>

      {/* ── Valeur principale ── */}
      <div>
        <KpiValue
          value={value}
          format={format}
          size="md"
          hidden={hidden}
          ariaLabel={hidden ? `${title} — non disponible` : undefined}
        />
      </div>

      {/* ── Pied de carte : badge tendance + sous-texte ── */}
      <div
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        "var(--kh-space-2)",
          flexWrap:   "wrap",
          marginTop:  "auto",
        }}
      >
        {trend !== undefined && (
          <KpiTrendBadge
            trend={trend}
            ariaLabel={hidden ? "Tendance non disponible" : undefined}
          />
        )}
        {subtext && (
          <span
            style={{
              fontSize: "var(--kh-text-xs)",
              color:    "var(--kh-text-muted)",
            }}
          >
            {subtext}
          </span>
        )}
      </div>
    </article>
  );
}

// ─── DashboardKpiCardSkeleton ─────────────────────────────────────────────

export function DashboardKpiCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Chargement de l'indicateur"
      style={{
        background:   "var(--kh-surface)",
        borderRadius: "var(--kh-radius-lg)",
        border:       "1px solid var(--kh-border)",
        boxShadow:    "var(--kh-shadow-sm)",
        padding:      "var(--kh-space-5)",
        display:      "flex",
        flexDirection:"column",
        gap:          "var(--kh-space-4)",
        minWidth:     0,
      }}
    >
      {/* En-tête */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            "var(--kh-space-3)",
        }}
      >
        <SkeletonLine width="55%" height="14px" />
        <SkeletonBox size={32} radius="var(--kh-radius-md)" />
      </div>

      {/* Valeur */}
      <SkeletonLine width="45%" height="28px" />

      {/* Pied */}
      <SkeletonLine width="65%" height="20px" radius="var(--kh-radius-full)" />
    </div>
  );
}

// ─── Helpers squelette ────────────────────────────────────────────────────

function SkeletonLine({
  width,
  height,
  radius = "var(--kh-radius)",
}: {
  width:    string;
  height:   string;
  radius?:  string;
}) {
  return (
    <div
      className="kh-shimmer"
      style={{
        width,
        height,
        borderRadius: radius,
        background:   "var(--kh-surface-raised)",
        flexShrink:   0,
      }}
    />
  );
}

function SkeletonBox({ size, radius }: { size: number; radius: string }) {
  return (
    <div
      className="kh-shimmer"
      style={{
        width:        size,
        height:       size,
        borderRadius: radius,
        background:   "var(--kh-surface-raised)",
        flexShrink:   0,
      }}
    />
  );
}
