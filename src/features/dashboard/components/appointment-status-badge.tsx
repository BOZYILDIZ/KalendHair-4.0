import { Clock, CheckCircle2, CircleCheck } from "lucide-react";
import type { ActiveAppointmentStatus } from "@/features/dashboard/overview.types";

interface AppointmentStatusBadgeProps {
  status: ActiveAppointmentStatus;
  /** "sm" = compact (icône seule + label masqué), "md" = défaut (pill avec label) */
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  ActiveAppointmentStatus,
  { label: string; icon: typeof Clock; bg: string; color: string }
> = {
  PENDING: {
    label: "En attente",
    icon:  Clock,
    bg:    "var(--kh-warning-50)",
    color: "var(--kh-warning-700)",
  },
  CONFIRMED: {
    label: "Confirmé",
    icon:  CheckCircle2,
    bg:    "var(--kh-brand-50)",
    color: "var(--kh-brand-700)",
  },
  COMPLETED: {
    label: "Terminé",
    icon:  CircleCheck,
    bg:    "var(--kh-success-50)",
    color: "var(--kh-success-700)",
  },
};

/**
 * Badge de statut de rendez-vous.
 * N'affiche jamais CANCELLED ni NO_SHOW — ces statuts sont filtrés
 * en amont par getDashboardOverview (voir overview.types.ts).
 */
export function AppointmentStatusBadge({
  status,
  size = "md",
}: AppointmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon   = config.icon;

  if (size === "sm") {
    return (
      <span
        aria-label={config.label}
        title={config.label}
        style={{
          display:       "inline-flex",
          alignItems:    "center",
          justifyContent:"center",
          width:         20,
          height:        20,
          borderRadius:  "var(--kh-radius-full)",
          background:    config.bg,
          color:         config.color,
          flexShrink:    0,
        }}
      >
        <Icon size={11} strokeWidth={1.5} aria-hidden />
      </span>
    );
  }

  return (
    <span
      aria-label={config.label}
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        gap:           "4px",
        padding:       "2px 8px",
        borderRadius:  "var(--kh-radius-full)",
        background:    config.bg,
        color:         config.color,
        fontSize:      "var(--kh-text-xs)",
        fontWeight:    "var(--kh-font-semibold)",
        whiteSpace:    "nowrap",
        flexShrink:    0,
      }}
    >
      <Icon size={10} strokeWidth={1.5} aria-hidden />
      {config.label}
    </span>
  );
}
