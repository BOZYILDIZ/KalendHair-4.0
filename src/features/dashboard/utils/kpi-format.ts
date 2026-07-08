export type KpiValueFormat = "currency" | "percent" | "count" | "duration";

/**
 * Formate une valeur KPI pour l'affichage en français.
 *
 * - currency : centimes → euros arrondis (12 456 → "12 456 €")
 * - percent  : entier 0-100 → "75 %"
 * - count    : entier → "1 234"
 * - duration : minutes → "1 h 30" | "45 min"
 */
export function formatKpiValue(value: number, format: KpiValueFormat): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("fr-FR", {
        style:                 "currency",
        currency:              "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value / 100);

    case "percent":
      return `${value} %`;

    case "count":
      return new Intl.NumberFormat("fr-FR").format(value);

    case "duration": {
      if (value < 60) return `${value} min`;
      const h = Math.floor(value / 60);
      const m = value % 60;
      return m === 0 ? `${h} h` : `${h} h ${m}`;
    }
  }
}

/**
 * Formate un delta de tendance (valeur déjà en % entier).
 * Ajoute le signe "+" pour les valeurs positives.
 * Ex : 12 → "+12 %", -8 → "-8 %", 0 → "0 %"
 */
export function formatTrendPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value} %`;
}
