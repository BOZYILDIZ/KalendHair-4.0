import { UserRound, Clock } from "lucide-react";
import type { DashboardAppointmentPreview } from "@/features/dashboard/overview.types";
import { AppointmentStatusBadge } from "@/features/dashboard/components/appointment-status-badge";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour:     "2-digit",
    minute:   "2-digit",
    timeZone: timezone,
  }).format(date);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

function resolveServiceColor(color: string | null): string {
  return color ?? "var(--kh-brand-500)";
}

// ─── AppointmentRow ───────────────────────────────────────────────────────────

export interface AppointmentRowProps {
  appointment:  DashboardAppointmentPreview;
  timezone:     string;
  /** false pour le rôle EMPLOYEE (ne voit pas les autres employés) */
  showEmployee?: boolean;
}

/**
 * Ligne de rendez-vous de l'agenda du jour.
 *
 * Layout :
 *   [color-strip] [time] [content: client + service + employee] [badge + duration]
 *
 * Responsive : le bloc droit (badge + durée) se place naturellement
 * grâce au flex-wrap — pas de media query nécessaire.
 */
export function AppointmentRow({
  appointment,
  timezone,
  showEmployee = true,
}: AppointmentRowProps) {
  const {
    startAt,
    durationMinutes,
    clientName,
    isGuest,
    serviceName,
    serviceColor,
    employeeName,
    status,
  } = appointment;

  const startTime  = formatTime(startAt, timezone);
  const duration   = formatDuration(durationMinutes);
  const stripColor = resolveServiceColor(serviceColor);

  return (
    <li
      className="kh-appointment-row"
      aria-label={`${startTime} — ${clientName}, ${serviceName}`}
      style={{
        display:       "flex",
        alignItems:    "stretch",
        gap:           "var(--kh-space-3)",
        padding:       "var(--kh-space-3) var(--kh-space-4)",
        borderRadius:  "var(--kh-radius-md)",
        cursor:        "default",
        transition:    `background var(--kh-dur-fast) var(--kh-ease-default)`,
        listStyle:     "none",
        minWidth:      0,
      }}
    >
      {/* ── Bande couleur service ── */}
      <div
        aria-hidden="true"
        style={{
          width:        3,
          borderRadius: "var(--kh-radius-full)",
          background:   stripColor,
          flexShrink:   0,
          alignSelf:    "stretch",
          minHeight:    40,
        }}
      />

      {/* ── Heure ── */}
      <time
        dateTime={startAt.toISOString()}
        style={{
          fontFamily:         "var(--kh-font-mono)",
          fontSize:           "var(--kh-text-sm)",
          fontWeight:         "var(--kh-font-medium)",
          color:              "var(--kh-text-secondary)",
          lineHeight:         "var(--kh-leading-tight)",
          fontVariantNumeric: "tabular-nums",
          whiteSpace:         "nowrap",
          paddingTop:         "1px",
          flexShrink:         0,
          minWidth:           "3.5rem",
        }}
      >
        {startTime}
      </time>

      {/* ── Contenu principal ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Client */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--kh-space-1-5, 6px)" }}>
          <p
            style={{
              fontSize:     "var(--kh-text-sm)",
              fontWeight:   "var(--kh-font-semibold)",
              color:        "var(--kh-text)",
              margin:       0,
              whiteSpace:   "nowrap",
              overflow:     "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {clientName}
          </p>
          {isGuest && (
            <span
              aria-label="Client invité (sans compte)"
              style={{
                fontSize:     "var(--kh-text-xs)",
                color:        "var(--kh-text-muted)",
                background:   "var(--kh-surface-raised)",
                borderRadius: "var(--kh-radius)",
                padding:      "1px 5px",
                flexShrink:   0,
              }}
            >
              Invité
            </span>
          )}
        </div>

        {/* Service + employé */}
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        "var(--kh-space-2)",
            marginTop:  "2px",
            flexWrap:   "wrap",
          }}
        >
          <span
            style={{
              fontSize:     "var(--kh-text-xs)",
              color:        "var(--kh-text-secondary)",
              whiteSpace:   "nowrap",
              overflow:     "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {serviceName}
          </span>
          {showEmployee && (
            <span
              aria-label={`Employé : ${employeeName}`}
              style={{
                display:    "inline-flex",
                alignItems: "center",
                gap:        "3px",
                fontSize:   "var(--kh-text-xs)",
                color:      "var(--kh-text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              <UserRound size={10} strokeWidth={1.5} aria-hidden />
              {employeeName}
            </span>
          )}
        </div>
      </div>

      {/* ── Statut + durée ── */}
      <div
        style={{
          display:       "flex",
          flexDirection: "column",
          alignItems:    "flex-end",
          gap:           "var(--kh-space-1)",
          flexShrink:    0,
        }}
      >
        <AppointmentStatusBadge status={status} />
        <span
          style={{
            display:    "inline-flex",
            alignItems: "center",
            gap:        "3px",
            fontSize:   "var(--kh-text-xs)",
            color:      "var(--kh-text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          <Clock size={10} strokeWidth={1.5} aria-hidden />
          {duration}
        </span>
      </div>
    </li>
  );
}
