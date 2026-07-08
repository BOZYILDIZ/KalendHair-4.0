import { CalendarX2, Sunset, Sparkles } from "lucide-react";

export type AgendaEmptyKind = "no_appointments" | "day_over" | "first_day";

interface AgendaEmptyStateProps {
  kind?: AgendaEmptyKind;
}

const CONFIG: Record<
  AgendaEmptyKind,
  { icon: typeof CalendarX2; title: string; description: string; iconBg: string; iconColor: string }
> = {
  no_appointments: {
    icon:        CalendarX2,
    title:       "Aucun rendez-vous à venir",
    description: "Le planning de la journée est libre.",
    iconBg:      "var(--kh-slate-100)",
    iconColor:   "var(--kh-slate-400)",
  },
  day_over: {
    icon:        Sunset,
    title:       "Journée terminée",
    description: "Tous les rendez-vous de la journée sont passés.",
    iconBg:      "var(--kh-brand-50)",
    iconColor:   "var(--kh-brand-400)",
  },
  first_day: {
    icon:        Sparkles,
    title:       "Bienvenue dans votre agenda",
    description: "Dès qu'un rendez-vous sera planifié aujourd'hui, il apparaîtra ici.",
    iconBg:      "var(--kh-success-50)",
    iconColor:   "var(--kh-success-600)",
  },
};

/**
 * État vide de l'agenda du jour.
 *
 * Trois variantes :
 *   - "no_appointments" — journée sans RDV (défaut)
 *   - "day_over"        — tous les RDV sont passés
 *   - "first_day"       — premier jour d'activité du salon
 */
export function AgendaEmptyState({ kind = "no_appointments" }: AgendaEmptyStateProps) {
  const { icon: Icon, title, description, iconBg, iconColor } = CONFIG[kind];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "var(--kh-space-10) var(--kh-space-6)",
        gap:            "var(--kh-space-3)",
        textAlign:      "center",
        minHeight:      180,
      }}
    >
      {/* Icône */}
      <div
        aria-hidden="true"
        style={{
          width:         48,
          height:        48,
          borderRadius:  "var(--kh-radius-lg)",
          background:    iconBg,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          flexShrink:    0,
        }}
      >
        <Icon size={22} strokeWidth={1.5} style={{ color: iconColor }} />
      </div>

      {/* Texte */}
      <div style={{ maxWidth: 260 }}>
        <p
          style={{
            fontSize:   "var(--kh-text-sm)",
            fontWeight: "var(--kh-font-semibold)",
            color:      "var(--kh-text)",
            margin:     "0 0 var(--kh-space-1)",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize:   "var(--kh-text-xs)",
            color:      "var(--kh-text-muted)",
            margin:     0,
            lineHeight: "var(--kh-leading-relaxed)",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
