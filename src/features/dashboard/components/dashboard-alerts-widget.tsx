import Link from "next/link";
import { ShieldCheck, AlertTriangle, AlertCircle, Info, ArrowRight } from "lucide-react";
import type { DashboardAlert } from "@/features/dashboard/overview.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardAlertsWidgetProps {
  alerts:     DashboardAlert;
  isLoading?: boolean;
}

type AlertLevel = "info" | "warning" | "danger";

interface AlertItem {
  id:           string;
  level:        AlertLevel;
  title:        string;
  description:  string;
  href?:        string;
  actionLabel?: string;
}

// ─── Alert builder ────────────────────────────────────────────────────────────

function buildAlerts(data: DashboardAlert): AlertItem[] {
  const items: AlertItem[] = [];

  // Rendez-vous en attente
  if (data.pendingAppointmentsCount > 0) {
    const n = data.pendingAppointmentsCount;
    items.push({
      id:          "pending-appts",
      level:       n >= 5 ? "warning" : "info",
      title:       "Rendez-vous en attente",
      description: `${n} rendez-vous ${n > 1 ? "attendent" : "attend"} votre confirmation.`,
      href:        "/dashboard/appointments",
      actionLabel: "Voir les rendez-vous",
    });
  }

  // Stock faible
  if (data.lowStockProductsCount > 0) {
    const n = data.lowStockProductsCount;
    items.push({
      id:          "low-stock",
      level:       "warning",
      title:       "Stock faible",
      description: `${n} produit${n > 1 ? "s" : ""} sous le seuil minimum de réapprovisionnement.`,
      href:        "/dashboard/inventory",
      actionLabel: "Gérer les stocks",
    });
  }

  // Abonnement — PAST_DUE
  if (data.subscriptionStatus === "PAST_DUE") {
    items.push({
      id:          "subscription-past-due",
      level:       "danger",
      title:       "Paiement échoué",
      description: "Votre abonnement est à risque. Mettez à jour votre moyen de paiement.",
      href:        "/dashboard/plans",
      actionLabel: "Mettre à jour",
    });
  }

  // Abonnement — CANCELED
  if (data.subscriptionStatus === "CANCELED") {
    items.push({
      id:          "subscription-canceled",
      level:       "danger",
      title:       "Abonnement annulé",
      description: "Votre accès est limité. Réactivez votre abonnement pour continuer.",
      href:        "/dashboard/plans",
      actionLabel: "Réactiver",
    });
  }

  // Essai expirant dans 7 jours ou moins
  if (data.subscriptionStatus === "TRIAL" && data.subscriptionExpiresAt) {
    const msLeft   = data.subscriptionExpiresAt.getTime() - Date.now();
    const daysLeft = Math.ceil(msLeft / 86_400_000);

    if (daysLeft <= 7) {
      items.push({
        id:    "trial-expiring",
        level: daysLeft <= 3 ? "warning" : "info",
        title: "Période d'essai",
        description:
          daysLeft <= 0
            ? "Votre période d'essai a expiré."
            : `Votre période d'essai se termine dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}.`,
        href:        "/dashboard/plans",
        actionLabel: "Choisir un abonnement",
      });
    }
  }

  return items;
}

// ─── Alert level config ───────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<
  AlertLevel,
  { icon: typeof AlertCircle; iconColor: string; bg: string; border: string; text: string }
> = {
  info: {
    icon:      Info,
    iconColor: "var(--kh-info-600)",
    bg:        "var(--kh-info-50)",
    border:    "var(--kh-info-100)",
    text:      "var(--kh-info-700)",
  },
  warning: {
    icon:      AlertTriangle,
    iconColor: "var(--kh-warning-600)",
    bg:        "var(--kh-warning-50)",
    border:    "var(--kh-warning-100)",
    text:      "var(--kh-warning-700)",
  },
  danger: {
    icon:      AlertCircle,
    iconColor: "var(--kh-danger-600)",
    bg:        "var(--kh-danger-50)",
    border:    "var(--kh-danger-100)",
    text:      "var(--kh-danger-700)",
  },
};

// ─── AlertItemRow ─────────────────────────────────────────────────────────────

function AlertItemRow({ item }: { item: AlertItem }) {
  const cfg  = LEVEL_CONFIG[item.level];
  const Icon = cfg.icon;

  const ariaRole =
    item.level === "danger"  ? "alert"
    : item.level === "warning" ? "status"
    : undefined;

  return (
    <li
      role={ariaRole}
      aria-live={item.level === "danger" ? "assertive" : item.level === "warning" ? "polite" : undefined}
      style={{
        display:      "flex",
        gap:          "var(--kh-space-3)",
        padding:      "var(--kh-space-3) var(--kh-space-4)",
        background:   cfg.bg,
        borderLeft:   `3px solid ${cfg.iconColor}`,
        listStyle:    "none",
        alignItems:   "flex-start",
        minWidth:     0,
      }}
    >
      {/* Icône */}
      <Icon
        size={15}
        strokeWidth={1.5}
        aria-hidden="true"
        style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 1 }}
      />

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize:   "var(--kh-text-xs)",
            fontWeight: "var(--kh-font-semibold)",
            color:      cfg.text,
            margin:     0,
          }}
        >
          {item.title}
        </p>
        <p
          style={{
            fontSize:   "var(--kh-text-xs)",
            color:      "var(--kh-text-secondary)",
            margin:     "2px 0 0",
            lineHeight: "var(--kh-leading-relaxed)",
          }}
        >
          {item.description}
        </p>

        {item.href && item.actionLabel && (
          <Link
            href={item.href}
            aria-label={`${item.actionLabel} — ${item.title}`}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "3px",
              marginTop:      "var(--kh-space-2)",
              fontSize:       "var(--kh-text-xs)",
              fontWeight:     "var(--kh-font-semibold)",
              color:          cfg.text,
              textDecoration: "underline",
              textDecorationThickness: "1px",
              textUnderlineOffset:     "2px",
            }}
          >
            {item.actionLabel}
            <ArrowRight size={10} strokeWidth={1.5} aria-hidden />
          </Link>
        )}
      </div>
    </li>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AlertsSkeleton() {
  return (
    <div role="status" aria-label="Chargement des alertes" aria-busy="true" style={{ padding: "var(--kh-space-2) 0" }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            display: "flex",
            gap:     "var(--kh-space-3)",
            padding: "var(--kh-space-3) var(--kh-space-4)",
            alignItems: "center",
          }}
        >
          <div className="kh-shimmer" style={{ width: 15, height: 15, borderRadius: "var(--kh-radius-full)", background: "var(--kh-surface-raised)", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--kh-space-1)" }}>
            <div className="kh-shimmer" style={{ width: "50%", height: 12, borderRadius: "var(--kh-radius)", background: "var(--kh-surface-raised)" }} />
            <div className="kh-shimmer" style={{ width: "75%", height: 11, borderRadius: "var(--kh-radius)", background: "var(--kh-surface-raised)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DashboardAlertsWidget ────────────────────────────────────────────────────

/**
 * Widget des alertes prioritaires — Zone D du Dashboard Experience 2.0.
 *
 * Dérive les alertes depuis `DashboardAlert` :
 *   - Rendez-vous en attente (info si < 5, warning si ≥ 5)
 *   - Stock faible (warning)
 *   - Paiement échoué (danger)
 *   - Abonnement annulé (danger)
 *   - Essai expirant sous 7 jours (info / warning)
 *
 * Si aucune alerte → état "Tout est sous contrôle".
 */
export function DashboardAlertsWidget({
  alerts,
  isLoading = false,
}: DashboardAlertsWidgetProps) {
  const alertItems = isLoading ? [] : buildAlerts(alerts);

  return (
    <section
      aria-label="Alertes"
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
          <AlertTriangle
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ color: alertItems.length > 0 ? "var(--kh-warning-600)" : "var(--kh-slate-400)", flexShrink: 0 }}
          />
          <h2
            style={{
              fontSize:   "var(--kh-text-sm)",
              fontWeight: "var(--kh-font-semibold)",
              color:      "var(--kh-text)",
              margin:     0,
            }}
          >
            Alertes
          </h2>
          {!isLoading && alertItems.length > 0 && (
            <span
              aria-label={`${alertItems.length} alerte${alertItems.length > 1 ? "s" : ""}`}
              style={{
                display:       "inline-flex",
                alignItems:    "center",
                justifyContent:"center",
                minWidth:      20,
                height:        20,
                padding:       "0 6px",
                borderRadius:  "var(--kh-radius-full)",
                background:    "var(--kh-danger-50)",
                color:         "var(--kh-danger-700)",
                fontSize:      "var(--kh-text-xs)",
                fontWeight:    "var(--kh-font-semibold)",
              }}
            >
              {alertItems.length}
            </span>
          )}
        </div>
      </div>

      {/* Corps */}
      <div style={{ flex: 1 }}>
        {isLoading ? (
          <AlertsSkeleton />
        ) : alertItems.length === 0 ? (
          <AlertsAllClear />
        ) : (
          <ul
            role="list"
            aria-label={`${alertItems.length} alerte${alertItems.length > 1 ? "s" : ""} active${alertItems.length > 1 ? "s" : ""}`}
            style={{ listStyle: "none", margin: 0, padding: "var(--kh-space-2) 0", display: "flex", flexDirection: "column", gap: "var(--kh-space-1)" }}
          >
            {alertItems.map((item) => (
              <AlertItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AlertsAllClear() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "var(--kh-space-8) var(--kh-space-6)",
        gap:            "var(--kh-space-2)",
        textAlign:      "center",
        minHeight:      120,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width:         36,
          height:        36,
          borderRadius:  "var(--kh-radius-full)",
          background:    "var(--kh-success-50)",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
        }}
      >
        <ShieldCheck size={18} strokeWidth={1.5} style={{ color: "var(--kh-success-600)" }} />
      </div>
      <p style={{ fontSize: "var(--kh-text-sm)", fontWeight: "var(--kh-font-semibold)", color: "var(--kh-text)", margin: 0 }}>
        Tout est sous contrôle
      </p>
      <p style={{ fontSize: "var(--kh-text-xs)", color: "var(--kh-text-muted)", margin: 0 }}>
        Aucune alerte active pour le moment.
      </p>
    </div>
  );
}
