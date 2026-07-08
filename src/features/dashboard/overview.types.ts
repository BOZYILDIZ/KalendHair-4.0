// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Dashboard Overview — Types stables pour les PR UI suivantes
// Source : docs/epics/EPIC_01_DASHBOARD_EXPERIENCE.md · PR-02
// ─────────────────────────────────────────────────────────────────────────────

// ─── Tendances ────────────────────────────────────────────────────────────────

/**
 * Résultat d'une comparaison period-sur-period.
 * Jamais +∞% : si la baseline est 0, on retourne "new" ou "first_day".
 */
export type TrendResult =
  | { kind: "percent"; value: number }   // delta % (positif ou négatif)
  | { kind: "new" }                       // aujourd'hui > 0, hier = 0 — pas de baseline
  | { kind: "first_day" };               // les deux sont 0 — premier jour actif

// ─── KPI du jour ─────────────────────────────────────────────────────────────

export type DashboardKpiSummary = {
  /**
   * Nombre total de rendez-vous actifs.
   * CANCELLED et NO_SHOW sont exclus partout dans ce type.
   */
  appointmentsTotal: number;
  confirmedCount:    number;
  pendingCount:      number;
  completedCount:    number;
  /** null si aucune donnée horaire pour calculer le taux */
  fillRatePercent:   number | null;
  newClientsToday:   number;
  /** null si le rôle de l'utilisateur ne donne pas accès au CA */
  revenueCents:      number | null;
};

export type DashboardTrend = {
  /** null si le rôle de l'utilisateur ne donne pas accès au CA */
  revenue:      TrendResult | null;
  appointments: TrendResult;
};

// ─── Rendez-vous ─────────────────────────────────────────────────────────────

/** Statuts visibles dans le dashboard — jamais CANCELLED ni NO_SHOW */
export type ActiveAppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED";

export type DashboardAppointmentPreview = {
  id:              string;
  startAt:         Date;
  endAt:           Date;
  durationMinutes: number;
  /** "Prénom Nom" | "Prénom" | "Invité" selon disponibilité */
  clientName:      string;
  isGuest:         boolean;
  serviceName:     string;
  serviceColor:    string | null;
  employeeId:      string;
  employeeName:    string;
  employeeColor:   string | null;
  status:          ActiveAppointmentStatus;
  /** null si le rôle de l'utilisateur ne donne pas accès aux prix */
  priceCents:      number | null;
};

// ─── Agenda simplifié ─────────────────────────────────────────────────────────

export type DashboardAgendaEmployee = {
  employeeId:      string;
  firstName:       string;
  lastName:        string;
  color:           string | null;
  /** null si aucun horaire défini pour aujourd'hui */
  workStartMinute: number | null;
  /** null si aucun horaire défini pour aujourd'hui */
  workEndMinute:   number | null;
  isWorkingToday:  boolean;
  /** Nombre de RDV actifs (excl. CANCELLED + NO_SHOW) */
  appointmentCount: number;
};

// ─── Alertes ──────────────────────────────────────────────────────────────────

export type DashboardAlertSubscriptionStatus =
  | "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "unknown";

export type DashboardAlert = {
  /** Rendez-vous en attente de confirmation — repris du KPI pour éviter la duplication */
  pendingAppointmentsCount: number;
  /** Produits dont la quantité est ≤ lowStockThreshold (défini par produit) */
  lowStockProductsCount:    number;
  subscriptionStatus:       DashboardAlertSubscriptionStatus;
  /** Date d'expiration de la période d'essai ou de l'abonnement courant */
  subscriptionExpiresAt:    Date | null;
};

// ─── Permissions appliquées ───────────────────────────────────────────────────

export type DashboardPermissions = {
  canViewRevenue:       boolean;   // OWNER | MANAGER uniquement
  canViewAllEmployees:  boolean;   // false si EMPLOYEE
  /** ID Employee propre à l'utilisateur si rôle EMPLOYEE, sinon null */
  employeeId:           string | null;
};

// ─── Vue consolidée ───────────────────────────────────────────────────────────

export type DashboardOverview = {
  // Identité salon
  organizationName: string;
  salonName:        string;
  salonSlug:        string;
  timezone:         string;
  /** Date du jour au format YYYY-MM-DD dans le timezone du salon */
  currentDate:      string;

  // Données KPI
  kpi:   DashboardKpiSummary;
  trend: DashboardTrend;

  /**
   * Prochains RDV de la journée (startAt > maintenant, PENDING + CONFIRMED + COMPLETED).
   * Limité à 20 résultats. Trié par startAt asc.
   */
  upcomingAppointments: DashboardAppointmentPreview[];

  /**
   * Employés actifs du salon pour l'agenda simplifié.
   * EMPLOYEE ne voit que sa propre entrée.
   */
  agendaEmployees: DashboardAgendaEmployee[];

  alerts:      DashboardAlert;
  permissions: DashboardPermissions;
};
