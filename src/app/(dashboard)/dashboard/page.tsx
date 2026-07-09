import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getOrganization } from "@/features/organizations/organization.service";
import { getSalon } from "@/features/salons/salon.service";
import { DASHBOARD_V2 } from "@/lib/flags";
import { getDashboardOverview } from "@/features/dashboard/overview.service";
import { getWeeklyData } from "@/features/dashboard/weekly.service";
import { DashboardKpiGrid } from "@/features/dashboard/components/dashboard-kpi-grid";
import { AgendaTodayWidget } from "@/features/dashboard/components/agenda-today-widget";
import { TeamTodayWidget } from "@/features/dashboard/components/team-today-widget";
import { DashboardAlertsWidget } from "@/features/dashboard/components/dashboard-alerts-widget";
import { WeekSparklineWidget } from "@/features/dashboard/components/week-sparkline-widget";
import type { WeeklyPoint } from "@/features/dashboard/components/week-sparkline-widget";

// ─── Dashboard V2 ─────────────────────────────────────────────────────────────

async function DashboardV2() {
  const session = await requireSession();

  // Données principales — critique
  let data;
  try {
    data = await getDashboardOverview(session);
  } catch {
    return <DashboardErrorState />;
  }

  // Données hebdomadaires — non critique (null = état vide dans le widget)
  let weeklyData: WeeklyPoint[] | null = null;
  try {
    weeklyData = await getWeeklyData(session);
  } catch {
    // WeekSparklineWidget affiche un état vide propre si weeklyData=null
  }

  const {
    salonName,
    timezone,
    currentDate,
    kpi,
    trend,
    upcomingAppointments,
    agendaEmployees,
    alerts,
    permissions,
  } = data;

  // Formater la date du jour (en français, dans le timezone du salon)
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    weekday:  "long",
    day:      "numeric",
    month:    "long",
  }).format(new Date(currentDate + "T12:00:00"));

  // État vide : salon sans aucun rendez-vous actif aujourd'hui
  const emptyKind =
    kpi.appointmentsTotal === 0 && agendaEmployees.length === 0
      ? ("first_day" as const)
      : ("no_appointments" as const);

  return (
    <main
      style={{
        padding:       "var(--kh-space-6) var(--kh-space-5)",
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--kh-space-6)",
        minHeight:     "100%",
      }}
    >
      {/* ── En-tête de page ── */}
      <header
        style={{
          display:        "flex",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          gap:            "var(--kh-space-4)",
          flexWrap:       "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize:   "var(--kh-text-xl)",
              fontWeight: "var(--kh-font-semibold)",
              color:      "var(--kh-text)",
              margin:     0,
              lineHeight: "var(--kh-leading-tight)",
            }}
          >
            {salonName}
          </h1>
          <p
            style={{
              fontSize:    "var(--kh-text-sm)",
              color:       "var(--kh-text-secondary)",
              margin:      "var(--kh-space-1) 0 0",
              textTransform: "capitalize",
            }}
          >
            {formattedDate}
          </p>
        </div>

        {/* Badge rôle — visible uniquement si EMPLOYEE */}
        {!permissions.canViewAllEmployees && (
          <span
            aria-label="Vue employé"
            style={{
              display:       "inline-flex",
              alignItems:    "center",
              padding:       "var(--kh-space-1) var(--kh-space-3)",
              borderRadius:  "var(--kh-radius-full)",
              background:    "var(--kh-brand-50)",
              color:         "var(--kh-brand-700)",
              fontSize:      "var(--kh-text-xs)",
              fontWeight:    "var(--kh-font-semibold)",
              flexShrink:    0,
            }}
          >
            Vue employé
          </span>
        )}
      </header>

      {/* ── KPI Grid ── */}
      <section aria-label="Indicateurs du jour">
        <DashboardKpiGrid data={{ kpi, trend, permissions }} />
      </section>

      {/* ── Grille principale : Agenda + colonne droite ── */}
      <div className="kh-dashboard-main-grid">
        {/* Zone B — Agenda du jour */}
        <AgendaTodayWidget
          appointments={upcomingAppointments}
          permissions={permissions}
          timezone={timezone}
          emptyKind={emptyKind}
        />

        {/* Zone C+D — Colonne droite : Équipe, Alertes, Semaine */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:           "var(--kh-space-4)",
            minWidth:      0,
          }}
        >
          <TeamTodayWidget
            employees={agendaEmployees}
            timezone={timezone}
          />
          <DashboardAlertsWidget alerts={alerts} />
          <WeekSparklineWidget
            weeklyData={weeklyData}
            permissions={permissions}
          />
        </div>
      </div>
    </main>
  );
}

// ─── État d'erreur global ─────────────────────────────────────────────────────

function DashboardErrorState() {
  return (
    <div
      role="alert"
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "var(--kh-space-12) var(--kh-space-6)",
        gap:            "var(--kh-space-4)",
        textAlign:      "center",
        minHeight:      "60vh",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width:          52,
          height:         52,
          borderRadius:   "var(--kh-radius-full)",
          background:     "var(--kh-danger-50)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        <AlertCircle size={24} strokeWidth={1.5} style={{ color: "var(--kh-danger-600)" }} />
      </div>
      <div>
        <p
          style={{
            fontSize:   "var(--kh-text-base)",
            fontWeight: "var(--kh-font-semibold)",
            color:      "var(--kh-text)",
            margin:     0,
          }}
        >
          Impossible de charger le tableau de bord
        </p>
        <p
          style={{
            fontSize: "var(--kh-text-sm)",
            color:    "var(--kh-text-secondary)",
            margin:   "var(--kh-space-1) 0 0",
          }}
        >
          Actualisez la page pour réessayer.
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard Legacy (DASHBOARD_V2=false) ────────────────────────────────────

async function DashboardLegacy() {
  const session = await requireSession();
  const [organization, salon] = await Promise.all([
    getOrganization(session.organizationId),
    getSalon(session.organizationId),
  ]);

  return (
    <main className="mx-auto max-w-lg space-y-8 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-gray-500">
          {organization?.name ?? "—"}
          {salon ? ` · ${salon.name}` : ""}
        </p>
      </div>

      <nav className="space-y-2">
        <Link
          href="/dashboard/organization"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Mon Organisation</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/salon"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Mon Salon</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/employees"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Employés</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/services"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Services</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/salon/schedule"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Horaires du salon</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/closed-days"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Jours de fermeture</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/appointments"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Rendez-vous</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/agenda"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Agenda</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/clients"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Clients</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/kpi"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">KPI & Tableau de bord</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/payments"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Caisse</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/inventory"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Stocks &amp; Produits</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/suppliers"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Fournisseurs</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/purchase-orders"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Commandes</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/commissions"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Commissions</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/billing"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Mon abonnement</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/plans"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Plans</span>
          <span className="text-gray-400">→</span>
        </Link>
      </nav>

      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Se déconnecter
        </button>
      </form>
    </main>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return DASHBOARD_V2 ? <DashboardV2 /> : <DashboardLegacy />;
}
