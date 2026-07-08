import { TrendingUp, TrendingDown, Minus, Sparkles, Sunrise } from "lucide-react";
import { formatTrendPercent } from "@/features/dashboard/utils/kpi-format";
import type { TrendResult } from "@/features/dashboard/overview.types";

interface KpiTrendBadgeProps {
  trend: TrendResult | null;
  /** aria-label pour le lecteur d'écran */
  ariaLabel?: string;
}

/**
 * Badge de tendance KPI.
 *
 * Valeurs supportées :
 *   { kind: "percent", value: 12 }  → "+12 % ↑" (vert)
 *   { kind: "percent", value: -8 }  → "-8 % ↓"  (rouge)
 *   { kind: "percent", value: 0 }   → "0 %"     (neutre)
 *   { kind: "new" }                 → "Nouveau"  (bleu)
 *   { kind: "first_day" }           → "1ère journée" (gris)
 *   null                            → "—"        (non disponible)
 */
export function KpiTrendBadge({ trend, ariaLabel }: KpiTrendBadgeProps) {
  if (!trend) {
    return (
      <span
        aria-label={ariaLabel ?? "Tendance non disponible"}
        style={{
          fontSize:   "var(--kh-text-xs)",
          color:      "var(--kh-text-muted)",
          fontWeight: "var(--kh-font-medium)",
        }}
      >
        —
      </span>
    );
  }

  if (trend.kind === "new") {
    return (
      <span
        aria-label={ariaLabel ?? "Nouveau — première donnée disponible"}
        style={{
          display:       "inline-flex",
          alignItems:    "center",
          gap:           "3px",
          padding:       "2px 8px",
          borderRadius:  "var(--kh-radius-full)",
          background:    "var(--kh-info-50)",
          color:         "var(--kh-info-700)",
          fontSize:      "var(--kh-text-xs)",
          fontWeight:    "var(--kh-font-semibold)",
          whiteSpace:    "nowrap",
        }}
      >
        <Sparkles size={10} strokeWidth={1.5} aria-hidden />
        Nouveau
      </span>
    );
  }

  if (trend.kind === "first_day") {
    return (
      <span
        aria-label={ariaLabel ?? "Première journée d'activité — aucune baseline"}
        style={{
          display:       "inline-flex",
          alignItems:    "center",
          gap:           "3px",
          padding:       "2px 8px",
          borderRadius:  "var(--kh-radius-full)",
          background:    "var(--kh-slate-100)",
          color:         "var(--kh-slate-500)",
          fontSize:      "var(--kh-text-xs)",
          fontWeight:    "var(--kh-font-semibold)",
          whiteSpace:    "nowrap",
        }}
      >
        <Sunrise size={10} strokeWidth={1.5} aria-hidden />
        1ère journée
      </span>
    );
  }

  // kind === "percent"
  const { value } = trend;
  const isUp   = value > 0;
  const isDown = value < 0;
  const Icon   = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  const colors = isUp
    ? { bg: "var(--kh-success-50)", text: "var(--kh-success-700)" }
    : isDown
    ? { bg: "var(--kh-danger-50)",   text: "var(--kh-danger-700)" }
    : { bg: "var(--kh-slate-100)",   text: "var(--kh-slate-500)" };

  const label = ariaLabel
    ?? (isUp
      ? `En hausse de ${value} %`
      : isDown
      ? `En baisse de ${Math.abs(value)} %`
      : "Stable");

  return (
    <span
      aria-label={label}
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        gap:           "3px",
        padding:       "2px 8px",
        borderRadius:  "var(--kh-radius-full)",
        background:    colors.bg,
        color:         colors.text,
        fontSize:      "var(--kh-text-xs)",
        fontWeight:    "var(--kh-font-semibold)",
        whiteSpace:    "nowrap",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <Icon size={10} strokeWidth={1.5} aria-hidden />
      {formatTrendPercent(value)}
    </span>
  );
}
