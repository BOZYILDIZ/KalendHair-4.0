/**
 * Squelette de chargement de l'AgendaTodayWidget.
 * Cohérent avec DashboardKpiCardSkeleton (PR-04).
 * Utilise la classe .kh-shimmer définie dans globals.css.
 */
export function AgendaSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Chargement de l'agenda"
      aria-busy="true"
      style={{
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--kh-space-1)",
        padding:       "0 var(--kh-space-1)",
      }}
    >
      {Array.from({ length: rows }, (_, i) => (
        <AgendaSkeletonRow key={i} index={i} />
      ))}
    </div>
  );
}

function AgendaSkeletonRow({ index }: { index: number }) {
  // Largeur variable pour éviter un effet trop régulier
  const clientWidths  = ["55%", "45%", "60%", "50%", "40%"];
  const serviceWidths = ["40%", "50%", "35%", "45%", "55%"];
  const clientW  = clientWidths[index % clientWidths.length];
  const serviceW = serviceWidths[index % serviceWidths.length];

  return (
    <div
      aria-hidden="true"
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        "var(--kh-space-3)",
        padding:    "var(--kh-space-3) var(--kh-space-4)",
        minHeight:  60,
      }}
    >
      {/* Bande couleur */}
      <div
        className="kh-shimmer"
        style={{
          width:        3,
          minHeight:    40,
          borderRadius: "var(--kh-radius-full)",
          background:   "var(--kh-surface-raised)",
          flexShrink:   0,
        }}
      />

      {/* Heure */}
      <div
        className="kh-shimmer"
        style={{
          width:        "3.25rem",
          height:       "14px",
          borderRadius: "var(--kh-radius)",
          background:   "var(--kh-surface-raised)",
          flexShrink:   0,
        }}
      />

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--kh-space-1)" }}>
        <div
          className="kh-shimmer"
          style={{
            width:        clientW,
            height:       "14px",
            borderRadius: "var(--kh-radius)",
            background:   "var(--kh-surface-raised)",
          }}
        />
        <div
          className="kh-shimmer"
          style={{
            width:        serviceW,
            height:       "12px",
            borderRadius: "var(--kh-radius)",
            background:   "var(--kh-surface-raised)",
          }}
        />
      </div>

      {/* Badge + durée */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--kh-space-1)", flexShrink: 0 }}>
        <div
          className="kh-shimmer"
          style={{
            width:        64,
            height:       "20px",
            borderRadius: "var(--kh-radius-full)",
            background:   "var(--kh-surface-raised)",
          }}
        />
        <div
          className="kh-shimmer"
          style={{
            width:        36,
            height:       "12px",
            borderRadius: "var(--kh-radius)",
            background:   "var(--kh-surface-raised)",
          }}
        />
      </div>
    </div>
  );
}
