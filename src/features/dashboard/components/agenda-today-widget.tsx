import { CalendarDays, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { DashboardAppointmentPreview, DashboardPermissions } from "@/features/dashboard/overview.types";
import { AppointmentRow } from "@/features/dashboard/components/appointment-row";
import { AgendaEmptyState, type AgendaEmptyKind } from "@/features/dashboard/components/agenda-empty-state";
import { AgendaSkeleton } from "@/features/dashboard/components/agenda-skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgendaTodayWidgetProps {
  /**
   * Liste des prochains RDV de la journée.
   * null = état erreur (données non disponibles).
   * [] = état vide.
   */
  appointments:  DashboardAppointmentPreview[] | null;
  permissions:   DashboardPermissions;
  timezone:      string;
  /**
   * Variante de l'état vide.
   * Le parent détermine le contexte (premier jour, journée terminée, etc.)
   */
  emptyKind?:    AgendaEmptyKind;
  /** true = afficher le skeleton de chargement */
  isLoading?:    boolean;
}

// ─── AgendaTodayWidget ────────────────────────────────────────────────────────

/**
 * Widget "Agenda du jour" — composant principal de la Zone B.
 *
 * États couverts :
 *   - isLoading          → skeleton (AgendaSkeleton)
 *   - appointments=null  → état erreur inline
 *   - appointments=[]    → état vide (AgendaEmptyState, 3 variantes)
 *   - appointments=[...] → liste de lignes (AppointmentRow)
 *
 * Ce composant est un Server Component — ne contient aucun état client.
 * Il peut recevoir des objets Date directement depuis getDashboardOverview().
 */
export function AgendaTodayWidget({
  appointments,
  permissions,
  timezone,
  emptyKind = "no_appointments",
  isLoading = false,
}: AgendaTodayWidgetProps) {
  return (
    <section
      aria-label="Agenda du jour"
      style={{
        background:   "var(--kh-surface)",
        borderRadius: "var(--kh-radius-lg)",
        border:       "1px solid var(--kh-border)",
        boxShadow:    "var(--kh-shadow-sm)",
        display:      "flex",
        flexDirection:"column",
        minWidth:     0,
        overflow:     "hidden",
      }}
    >
      {/* ── En-tête ── */}
      <WidgetHeader
        count={!isLoading && appointments !== null ? appointments.length : null}
      />

      {/* ── Corps ── */}
      <div style={{ flex: 1 }}>
        {isLoading ? (
          <AgendaSkeleton rows={4} />
        ) : appointments === null ? (
          <AgendaErrorState />
        ) : appointments.length === 0 ? (
          <AgendaEmptyState kind={emptyKind} />
        ) : (
          <AppointmentList
            appointments={appointments}
            permissions={permissions}
            timezone={timezone}
          />
        )}
      </div>

      {/* ── Pied de widget (lien vers l'agenda complet) ── */}
      {!isLoading && appointments !== null && appointments.length > 0 && (
        <WidgetFooter />
      )}
    </section>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function WidgetHeader({ count }: { count: number | null }) {
  return (
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
        <CalendarDays
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
          Agenda du jour
        </h2>

        {/* Badge compteur */}
        {count !== null && count > 0 && (
          <span
            aria-label={`${count} rendez-vous`}
            style={{
              display:       "inline-flex",
              alignItems:    "center",
              justifyContent:"center",
              minWidth:      20,
              height:        20,
              padding:       "0 6px",
              borderRadius:  "var(--kh-radius-full)",
              background:    "var(--kh-brand-50)",
              color:         "var(--kh-brand-700)",
              fontSize:      "var(--kh-text-xs)",
              fontWeight:    "var(--kh-font-semibold)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {count}
          </span>
        )}
      </div>

      {/* Lien agenda complet */}
      <Link
        href="/dashboard/agenda"
        aria-label="Voir l'agenda complet"
        style={{
          fontSize:      "var(--kh-text-xs)",
          fontWeight:    "var(--kh-font-medium)",
          color:         "var(--kh-brand-600)",
          textDecoration:"none",
          display:       "flex",
          alignItems:    "center",
          gap:           "3px",
          transition:    `color var(--kh-dur-fast) var(--kh-ease-default)`,
          flexShrink:    0,
        }}
        className="kh-agenda-link"
      >
        Voir tout
        <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
      </Link>
    </div>
  );
}

function AppointmentList({
  appointments,
  permissions,
  timezone,
}: {
  appointments: DashboardAppointmentPreview[];
  permissions:  DashboardPermissions;
  timezone:     string;
}) {
  return (
    <ul
      role="list"
      aria-label={`${appointments.length} rendez-vous à venir`}
      style={{
        listStyle: "none",
        margin:    0,
        padding:   "var(--kh-space-2) 0",
      }}
    >
      {appointments.map((appt) => (
        <AppointmentRow
          key={appt.id}
          appointment={appt}
          timezone={timezone}
          showEmployee={permissions.canViewAllEmployees}
        />
      ))}
    </ul>
  );
}

function AgendaErrorState() {
  return (
    <div
      role="alert"
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "var(--kh-space-10) var(--kh-space-6)",
        gap:            "var(--kh-space-2)",
        textAlign:      "center",
        minHeight:      180,
      }}
    >
      <AlertCircle
        size={22}
        strokeWidth={1.5}
        aria-hidden="true"
        style={{ color: "var(--kh-danger-500)" }}
      />
      <p
        style={{
          fontSize:   "var(--kh-text-sm)",
          fontWeight: "var(--kh-font-medium)",
          color:      "var(--kh-text)",
          margin:     0,
        }}
      >
        Impossible de charger l&apos;agenda
      </p>
      <p
        style={{
          fontSize: "var(--kh-text-xs)",
          color:    "var(--kh-text-muted)",
          margin:   0,
        }}
      >
        Actualisez la page pour réessayer.
      </p>
    </div>
  );
}

function WidgetFooter() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--kh-border)",
        padding:   "var(--kh-space-3) var(--kh-space-5)",
        flexShrink: 0,
      }}
    >
      <Link
        href="/dashboard/agenda"
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "var(--kh-space-2)",
          fontSize:       "var(--kh-text-sm)",
          fontWeight:     "var(--kh-font-medium)",
          color:          "var(--kh-brand-600)",
          textDecoration: "none",
          padding:        "var(--kh-space-2)",
          borderRadius:   "var(--kh-radius-md)",
          transition:     `background var(--kh-dur-fast) var(--kh-ease-default),
                           color var(--kh-dur-fast) var(--kh-ease-default)`,
        }}
        className="kh-agenda-footer-link"
        aria-label="Ouvrir l'agenda complet du salon"
      >
        Voir l&apos;agenda complet
        <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
      </Link>
    </div>
  );
}
