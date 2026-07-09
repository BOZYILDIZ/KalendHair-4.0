import { Users, CircleDot, CircleOff } from "lucide-react";
import type { DashboardAgendaEmployee } from "@/features/dashboard/overview.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeamTodayWidgetProps {
  employees:  DashboardAgendaEmployee[];
  timezone:   string;
  isLoading?: boolean;
}

type EmployeeStatus = "available" | "active" | "absent";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getStatus(emp: DashboardAgendaEmployee): EmployeeStatus {
  if (!emp.isWorkingToday)        return "absent";
  if (emp.appointmentCount > 0)   return "active";
  return "available";
}

function formatMinutes(minutes: number): string {
  const h   = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function formatWorkWindow(
  start: number | null,
  end:   number | null,
): string | null {
  if (start === null || end === null) return null;
  return `${formatMinutes(start)} – ${formatMinutes(end)}`;
}

// Détermine la couleur de fond de l'avatar. Si `color` est null, derive
// une couleur cohérente depuis l'initial du prénom (parmi 6 teintes brand).
const AVATAR_FALLBACK_COLORS = [
  "#3347E7", "#7789EF", "#059669", "#D97706", "#DC2626", "#6B7494",
];

function avatarBg(color: string | null, firstName: string): string {
  if (color) return color;
  const idx = firstName.charCodeAt(0) % AVATAR_FALLBACK_COLORS.length;
  return AVATAR_FALLBACK_COLORS[idx] ?? "#3347E7";
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  EmployeeStatus,
  { label: string; color: string; bg: string }
> = {
  available: { label: "Disponible", color: "var(--kh-success-600)", bg: "var(--kh-success-50)" },
  active:    { label: "En activité", color: "var(--kh-brand-600)",   bg: "var(--kh-brand-50)"   },
  absent:    { label: "Absent",      color: "var(--kh-slate-500)",   bg: "var(--kh-slate-100)"  },
};

// ─── EmployeeRow ──────────────────────────────────────────────────────────────

function EmployeeRow({ emp }: { emp: DashboardAgendaEmployee }) {
  const status    = getStatus(emp);
  const cfg       = STATUS_CONFIG[status];
  const workHours = formatWorkWindow(emp.workStartMinute, emp.workEndMinute);
  const bg        = avatarBg(emp.color, emp.firstName);
  const initials  = getInitials(emp.firstName, emp.lastName);
  const fullName  = `${emp.firstName} ${emp.lastName}`;

  return (
    <li
      className="kh-team-row"
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        "var(--kh-space-3)",
        padding:    "var(--kh-space-3) var(--kh-space-4)",
        borderRadius: "var(--kh-radius-md)",
        transition: `background var(--kh-dur-fast) var(--kh-ease-default)`,
        listStyle:  "none",
        minWidth:   0,
      }}
    >
      {/* Avatar */}
      <div
        aria-hidden="true"
        style={{
          width:         36,
          height:        36,
          borderRadius:  "var(--kh-radius-full)",
          background:    bg,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          flexShrink:    0,
          fontSize:      "var(--kh-text-xs)",
          fontWeight:    "var(--kh-font-semibold)",
          color:         "#fff",
          letterSpacing: "0.03em",
          opacity:       status === "absent" ? 0.5 : 1,
        }}
      >
        {initials}
      </div>

      {/* Nom + horaire */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize:     "var(--kh-text-sm)",
            fontWeight:   "var(--kh-font-medium)",
            color:        status === "absent" ? "var(--kh-text-muted)" : "var(--kh-text)",
            margin:       0,
            whiteSpace:   "nowrap",
            overflow:     "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {fullName}
        </p>
        {workHours && status !== "absent" && (
          <p
            style={{
              fontSize:  "var(--kh-text-xs)",
              color:     "var(--kh-text-muted)",
              margin:    "1px 0 0",
              fontFamily:"var(--kh-font-mono)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {workHours}
          </p>
        )}
      </div>

      {/* Statut + compteur RDV */}
      <div
        style={{
          display:       "flex",
          flexDirection: "column",
          alignItems:    "flex-end",
          gap:           "3px",
          flexShrink:    0,
        }}
      >
        {/* Badge statut */}
        <span
          aria-label={cfg.label}
          style={{
            display:       "inline-flex",
            alignItems:    "center",
            gap:           "4px",
            padding:       "2px 8px",
            borderRadius:  "var(--kh-radius-full)",
            background:    cfg.bg,
            color:         cfg.color,
            fontSize:      "var(--kh-text-xs)",
            fontWeight:    "var(--kh-font-semibold)",
            whiteSpace:    "nowrap",
          }}
        >
          {status === "absent" ? (
            <CircleOff size={9} strokeWidth={1.5} aria-hidden />
          ) : (
            <CircleDot size={9} strokeWidth={1.5} aria-hidden />
          )}
          {cfg.label}
        </span>

        {/* Compteur RDV */}
        {emp.appointmentCount > 0 && (
          <span
            aria-label={`${emp.appointmentCount} rendez-vous`}
            style={{
              fontSize:           "var(--kh-text-xs)",
              color:              "var(--kh-text-muted)",
              fontVariantNumeric: "tabular-nums",
              fontFamily:         "var(--kh-font-mono)",
            }}
          >
            {emp.appointmentCount} rdv
          </span>
        )}
      </div>
    </li>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TeamSkeletonRow() {
  return (
    <div
      aria-hidden="true"
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        "var(--kh-space-3)",
        padding:    "var(--kh-space-3) var(--kh-space-4)",
      }}
    >
      <div
        className="kh-shimmer"
        style={{ width: 36, height: 36, borderRadius: "var(--kh-radius-full)", background: "var(--kh-surface-raised)", flexShrink: 0 }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--kh-space-1)" }}>
        <div className="kh-shimmer" style={{ width: "55%", height: 14, borderRadius: "var(--kh-radius)", background: "var(--kh-surface-raised)" }} />
        <div className="kh-shimmer" style={{ width: "35%", height: 11, borderRadius: "var(--kh-radius)", background: "var(--kh-surface-raised)" }} />
      </div>
      <div className="kh-shimmer" style={{ width: 72, height: 20, borderRadius: "var(--kh-radius-full)", background: "var(--kh-surface-raised)" }} />
    </div>
  );
}

// ─── TeamTodayWidget ──────────────────────────────────────────────────────────

/**
 * Widget "Équipe du jour" — Zone C du Dashboard Experience 2.0.
 *
 * Affiche les employés actifs du salon avec leur statut et nombre de RDV.
 * Filtrage absent/disponible/en activité dérivé de DashboardAgendaEmployee.
 */
export function TeamTodayWidget({
  employees,
  isLoading = false,
}: TeamTodayWidgetProps) {
  const working = employees.filter((e) => e.isWorkingToday);
  const absent  = employees.filter((e) => !e.isWorkingToday);

  return (
    <section
      aria-label="Équipe du jour"
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
          justifyContent: "space-between",
          padding:        "var(--kh-space-4) var(--kh-space-5)",
          borderBottom:   "1px solid var(--kh-border)",
          flexShrink:     0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--kh-space-2)" }}>
          <Users
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ color: "var(--kh-brand-600)", flexShrink: 0 }}
          />
          <h2
            style={{
              fontSize:   "var(--kh-text-sm)",
              fontWeight: "var(--kh-font-semibold)",
              color:      "var(--kh-text)",
              margin:     0,
            }}
          >
            Équipe du jour
          </h2>
          {!isLoading && (
            <span
              aria-label={`${working.length} employé${working.length !== 1 ? "s" : ""} en service`}
              style={{
                display:       "inline-flex",
                alignItems:    "center",
                justifyContent:"center",
                minWidth:      20,
                height:        20,
                padding:       "0 6px",
                borderRadius:  "var(--kh-radius-full)",
                background:    working.length > 0 ? "var(--kh-success-50)" : "var(--kh-slate-100)",
                color:         working.length > 0 ? "var(--kh-success-700)" : "var(--kh-slate-500)",
                fontSize:      "var(--kh-text-xs)",
                fontWeight:    "var(--kh-font-semibold)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {working.length}
            </span>
          )}
        </div>
      </div>

      {/* Corps */}
      <div style={{ flex: 1 }}>
        {isLoading ? (
          <div role="status" aria-label="Chargement de l'équipe" aria-busy="true" style={{ padding: "var(--kh-space-2) 0" }}>
            {[0, 1, 2].map((i) => <TeamSkeletonRow key={i} />)}
          </div>
        ) : employees.length === 0 ? (
          <TeamEmptyState />
        ) : (
          <ul
            role="list"
            aria-label="Membres de l'équipe aujourd'hui"
            style={{ listStyle: "none", margin: 0, padding: "var(--kh-space-2) 0" }}
          >
            {working.map((emp) => (
              <EmployeeRow key={emp.employeeId} emp={emp} />
            ))}
            {absent.length > 0 && working.length > 0 && (
              <li
                aria-hidden="true"
                style={{
                  height: 1,
                  margin: "var(--kh-space-1) var(--kh-space-4)",
                  background: "var(--kh-border)",
                }}
              />
            )}
            {absent.map((emp) => (
              <EmployeeRow key={emp.employeeId} emp={emp} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TeamEmptyState() {
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
        gap:            "var(--kh-space-2)",
        textAlign:      "center",
        minHeight:      140,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width:         40,
          height:        40,
          borderRadius:  "var(--kh-radius-lg)",
          background:    "var(--kh-slate-100)",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
        }}
      >
        <Users size={18} strokeWidth={1.5} style={{ color: "var(--kh-slate-400)" }} />
      </div>
      <p style={{ fontSize: "var(--kh-text-sm)", fontWeight: "var(--kh-font-medium)", color: "var(--kh-text)", margin: 0 }}>
        Aucun employé aujourd&apos;hui
      </p>
      <p style={{ fontSize: "var(--kh-text-xs)", color: "var(--kh-text-muted)", margin: 0 }}>
        Configurez les horaires dans les paramètres.
      </p>
    </div>
  );
}
