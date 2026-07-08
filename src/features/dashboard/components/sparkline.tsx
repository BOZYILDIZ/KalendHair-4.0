// ─── Types ────────────────────────────────────────────────────────────────────

export type SparklineTone = "brand" | "success" | "warning" | "danger" | "neutral";

export interface SparklineProps {
  /** Série de valeurs numériques (positives ou négatives) */
  values: number[];
  /** Largeur interne du viewBox — le rendu s'adapte au conteneur via width="100%" */
  width?: number;
  /** Hauteur en pixels du SVG rendu */
  height?: number;
  /** Texte alternatif obligatoire pour les lecteurs d'écran */
  ariaLabel: string;
  tone?: SparklineTone;
  /** Affiche un point sur le dernier relevé */
  showDot?: boolean;
}

// ─── Design tokens (hex correspondant aux --kh-* de globals.css) ──────────────
// Hex values utilisés dans les attributs SVG (css var non supportées dans stroke/fill SVG)

const TONE_CONFIG: Record<
  SparklineTone,
  { stroke: string; fill: string; dot: string }
> = {
  brand:   { stroke: "#3347E7", fill: "rgba(51,71,231,0.10)",    dot: "#3347E7" },
  success: { stroke: "#059669", fill: "rgba(5,150,105,0.10)",    dot: "#059669" },
  warning: { stroke: "#D97706", fill: "rgba(217,119,6,0.10)",    dot: "#D97706" },
  danger:  { stroke: "#DC2626", fill: "rgba(220,38,38,0.10)",    dot: "#DC2626" },
  neutral: { stroke: "#6B7494", fill: "rgba(107,116,148,0.08)",  dot: "#6B7494" },
};

// ─── Path builder ──────────────────────────────────────────────────────────────

interface BuildResult {
  linePath:  string;
  areaPath:  string;
  lastPoint: { x: number; y: number } | null;
}

function buildPaths(
  values: number[],
  viewW: number,
  viewH: number,
  pad: number,
): BuildResult {
  const n = values.length;
  if (n === 0) return { linePath: "", areaPath: "", lastPoint: null };

  const min   = Math.min(...values);
  const max   = Math.max(...values);
  const range = max - min;
  const drawW = viewW - pad * 2;
  const drawH = viewH - pad * 2;

  const pts = values.map((v, i) => {
    const x    = pad + (n === 1 ? drawW / 2 : (i / (n - 1)) * drawW);
    // range === 0 → série plate centrée verticalement
    const norm = range === 0 ? 0.5 : (v - min) / range;
    const y    = pad + drawH * (1 - norm);
    return { x, y };
  });

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // pts.length > 0 garanti par le guard n === 0 en tête de fonction
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const last   = pts[pts.length - 1]!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const first  = pts[0]!;
  const bottom = viewH - pad * 0.5;

  const areaPath =
    linePath +
    ` L${last.x.toFixed(1)} ${bottom.toFixed(1)}` +
    ` L${first.x.toFixed(1)} ${bottom.toFixed(1)} Z`;

  return { linePath, areaPath, lastPoint: last };
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

const VIEW_W  = 240;
const DEFAULT_H = 56;
const PAD       = 5;

/**
 * Sparkline SVG générique.
 *
 * - Fonctionne avec des valeurs positives, négatives ou mixtes.
 * - Série plate (toutes valeurs égales) → ligne centrée.
 * - Série vide → rendu neutre (zone grisée).
 * - SVG responsive : adapte sa largeur au conteneur (viewBox + width="100%").
 * - vector-effect="non-scaling-stroke" → épaisseur de trait constante.
 * - Respecte prefers-reduced-motion : pas d'animation embarquée.
 */
export function Sparkline({
  values,
  width:  _width = VIEW_W,
  height: viewH  = DEFAULT_H,
  ariaLabel,
  tone    = "brand",
  showDot = true,
}: SparklineProps) {
  const config = TONE_CONFIG[tone];

  // Série vide → guide horizontal neutre
  if (values.length === 0) {
    const midY = viewH / 2;
    return (
      <svg
        viewBox={`0 0 ${VIEW_W} ${viewH}`}
        width="100%"
        height={viewH}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
        style={{ display: "block", overflow: "visible" }}
      >
        <line
          x1={PAD}
          y1={midY}
          x2={VIEW_W - PAD}
          y2={midY}
          stroke="#C8CCDF"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  const { linePath, areaPath, lastPoint } = buildPaths(values, VIEW_W, viewH, PAD);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${viewH}`}
      width="100%"
      height={viewH}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Zone de remplissage */}
      <path
        d={areaPath}
        fill={config.fill}
        stroke="none"
        vectorEffect="non-scaling-stroke"
      />

      {/* Ligne */}
      <path
        d={linePath}
        fill="none"
        stroke={config.stroke}
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Point dernier relevé */}
      {showDot && lastPoint && (
        <>
          {/* Halo */}
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={4}
            fill={config.fill}
            vectorEffect="non-scaling-stroke"
          />
          {/* Point */}
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={2.5}
            fill={config.dot}
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
    </svg>
  );
}
