import { formatKpiValue, type KpiValueFormat } from "@/features/dashboard/utils/kpi-format";

interface KpiValueProps {
  value: number;
  format: KpiValueFormat;
  /** Taille : "sm" = 20px, "md" = 28px (défaut), "lg" = 36px */
  size?: "sm" | "md" | "lg";
  /** Masquer la valeur et afficher "—" (ex: CA caché pour EMPLOYEE) */
  hidden?: boolean;
  /** aria-label explicite transmis au span extérieur */
  ariaLabel?: string;
}

const SIZE_MAP: Record<NonNullable<KpiValueProps["size"]>, string> = {
  sm: "var(--kh-text-xl)",    /* 20px */
  md: "var(--kh-text-2xl)",   /* 24px */
  lg: "var(--kh-text-3xl)",   /* 30px */
};

/**
 * Valeur principale d'une carte KPI.
 * Toujours rendue en JetBrains Mono (chiffres).
 * En mode `hidden`, affiche "—" sans divulguer la valeur.
 */
export function KpiValue({
  value,
  format,
  size = "md",
  hidden = false,
  ariaLabel,
}: KpiValueProps) {
  const fontSize = SIZE_MAP[size];

  if (hidden) {
    return (
      <span
        aria-label={ariaLabel ?? "Valeur non disponible"}
        style={{
          fontFamily:         "var(--kh-font-mono)",
          fontSize,
          fontWeight:         "var(--kh-font-semibold)",
          color:              "var(--kh-text-muted)",
          lineHeight:         "var(--kh-leading-tight)",
          letterSpacing:      "-0.01em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        —
      </span>
    );
  }

  const formatted = formatKpiValue(value, format);

  return (
    <span
      aria-label={ariaLabel ?? formatted}
      style={{
        fontFamily:         "var(--kh-font-mono)",
        fontSize,
        fontWeight:         "var(--kh-font-semibold)",
        color:              "var(--kh-text)",
        lineHeight:         "var(--kh-leading-tight)",
        letterSpacing:      "-0.01em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {formatted}
    </span>
  );
}
