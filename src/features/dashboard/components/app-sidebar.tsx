"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck2,
  Users,
  Scissors,
  UserCog,
  Package,
  Truck,
  ShoppingCart,
  Percent,
  Banknote,
  BarChart3,
  Building2,
  Clock,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SidebarUserRole = "OWNER" | "MANAGER" | "EMPLOYEE";

export interface AppSidebarProps {
  salonName:        string;
  organizationName: string;
  userRole:         SidebarUserRole;
}

type NavItem = {
  href:   string;
  label:  string;
  icon:   LucideIcon;
  /** Correspondance exacte uniquement (ne pas activer sur les sous-routes) */
  exact?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Vue d'ensemble",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Agenda",
    items: [
      { href: "/dashboard/agenda",       label: "Agenda",       icon: CalendarDays },
      { href: "/dashboard/appointments", label: "Rendez-vous",  icon: CalendarCheck2 },
    ],
  },
  {
    title: "Clients",
    items: [
      { href: "/dashboard/clients", label: "Clients", icon: Users },
    ],
  },
  {
    title: "Gestion",
    items: [
      { href: "/dashboard/services",        label: "Services",    icon: Scissors  },
      { href: "/dashboard/employees",       label: "Employés",    icon: UserCog   },
      { href: "/dashboard/inventory",       label: "Stocks",      icon: Package   },
      { href: "/dashboard/suppliers",       label: "Fournisseurs",icon: Truck     },
      { href: "/dashboard/purchase-orders", label: "Commandes",   icon: ShoppingCart },
      { href: "/dashboard/commissions",     label: "Commissions", icon: Percent   },
      { href: "/dashboard/payments",        label: "Caisse",      icon: Banknote  },
    ],
  },
  {
    title: "Analyse",
    items: [
      { href: "/dashboard/kpi", label: "Statistiques", icon: BarChart3 },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { href: "/dashboard/salon",          label: "Salon",       icon: Building2, exact: true },
      { href: "/dashboard/salon/schedule", label: "Horaires",    icon: Clock },
      { href: "/dashboard/plans",          label: "Abonnement",  icon: CreditCard },
    ],
  },
];

const ROLE_LABELS: Record<SidebarUserRole, string> = {
  OWNER:    "Propriétaire",
  MANAGER:  "Manager",
  EMPLOYEE: "Employé",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesRoute(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── SidebarPanel — le panneau de navigation ─────────────────────────────────

function SidebarPanel({
  salonName,
  organizationName,
  userRole,
  onClose,
}: AppSidebarProps & { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className="sidebar"
      aria-label="Navigation principale"
      style={{
        width:           "var(--kh-sidebar-width)",
        background:      "var(--kh-sidebar-bg)",
        borderRight:     "1px solid var(--kh-dark-border)",
        display:         "flex",
        flexDirection:   "column",
        height:          "100%",
        overflowY:       "auto",
        flexShrink:      0,
      }}
    >
      {/* ── En-tête ── */}
      <div
        style={{
          height:        "var(--kh-header-height)",
          borderBottom:  "1px solid var(--kh-dark-border)",
          padding:       "0 var(--kh-space-4)",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          flexShrink:    0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--kh-space-2)", minWidth: 0 }}>
          <Scissors
            size={18}
            strokeWidth={1.5}
            style={{ color: "var(--kh-brand-400)", flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize:     "var(--kh-text-sm)",
                fontWeight:   "var(--kh-font-semibold)",
                color:        "var(--kh-dark-text)",
                whiteSpace:   "nowrap",
                overflow:     "hidden",
                textOverflow: "ellipsis",
              }}
              title={salonName}
            >
              {salonName}
            </p>
            {organizationName && (
              <p
                style={{
                  fontSize:     "var(--kh-text-xs)",
                  color:        "var(--kh-dark-text-muted)",
                  whiteSpace:   "nowrap",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {ROLE_LABELS[userRole]}
              </p>
            )}
          </div>
        </div>

        {/* Bouton fermer (mobile overlay uniquement) */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fermer la navigation"
            style={{
              padding:      "var(--kh-space-1)",
              borderRadius: "var(--kh-radius)",
              color:        "var(--kh-dark-text-muted)",
              background:   "transparent",
              border:       "none",
              cursor:       "pointer",
              display:      "flex",
              flexShrink:   0,
            }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        aria-label="Menu principal"
        style={{ flex: 1, padding: "var(--kh-space-3) var(--kh-space-2)", overflowY: "auto" }}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: "var(--kh-space-4)" }}>
            <p
              style={{
                fontSize:      "var(--kh-text-xs)",
                fontWeight:    "var(--kh-font-semibold)",
                color:         "var(--kh-dark-text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding:       "var(--kh-space-1) var(--kh-space-2) var(--kh-space-1)",
                marginBottom:  "var(--kh-space-1)",
              }}
            >
              {section.title}
            </p>

            <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {section.items.map((item) => {
                const active = matchesRoute(pathname, item.href, item.exact);
                const Icon   = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={onClose}
                      style={{
                        display:       "flex",
                        alignItems:    "center",
                        gap:           "var(--kh-space-3)",
                        height:        "var(--kh-sidebar-item)",
                        padding:       "0 var(--kh-space-2)",
                        borderRadius:  "var(--kh-radius-md)",
                        textDecoration:"none",
                        fontSize:      "var(--kh-text-sm)",
                        fontWeight:    active ? "var(--kh-font-medium)" : "var(--kh-font-normal)",
                        color:         active ? "var(--kh-dark-text)" : "var(--kh-dark-text-muted)",
                        background:    active
                          ? "rgba(51, 71, 231, 0.15)"
                          : "transparent",
                        transition:    `background var(--kh-dur-fast) var(--kh-ease-default),
                                        color var(--kh-dur-fast) var(--kh-ease-default)`,
                      }}
                      // Hover via CSS ne peut pas utiliser les tokens dans les inline styles,
                      // donc on gère l'état hover par la classe CSS définie dans globals.css
                      className="kh-sidebar-item"
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.5}
                        aria-hidden="true"
                        style={{
                          color:    active ? "var(--kh-brand-400)" : "currentColor",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.label}
                      </span>
                      {active && (
                        <ChevronRight
                          size={12}
                          strokeWidth={1.5}
                          aria-hidden="true"
                          style={{ marginLeft: "auto", color: "var(--kh-brand-400)", flexShrink: 0 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Pied de page — déconnexion ── */}
      <div
        style={{
          borderTop: "1px solid var(--kh-dark-border)",
          padding:   "var(--kh-space-3) var(--kh-space-2)",
          flexShrink: 0,
        }}
      >
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            style={{
              display:       "flex",
              alignItems:    "center",
              gap:           "var(--kh-space-3)",
              width:         "100%",
              height:        "var(--kh-sidebar-item)",
              padding:       "0 var(--kh-space-2)",
              borderRadius:  "var(--kh-radius-md)",
              border:        "none",
              background:    "transparent",
              cursor:        "pointer",
              fontSize:      "var(--kh-text-sm)",
              color:         "var(--kh-dark-text-muted)",
              textAlign:     "left",
              transition:    `background var(--kh-dur-fast) var(--kh-ease-default),
                              color var(--kh-dur-fast) var(--kh-ease-default)`,
            }}
            className="kh-sidebar-item"
          >
            <LogOut size={16} strokeWidth={1.5} aria-hidden="true" style={{ flexShrink: 0 }} />
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}

// ─── AppSidebar — orchestrateur desktop + mobile ──────────────────────────────

export function AppSidebar({ salonName, organizationName, userRole }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop : sidebar persistante (lg+) ── */}
      <div className="hidden lg:flex" style={{ height: "100%" }}>
        <SidebarPanel
          salonName={salonName}
          organizationName={organizationName}
          userRole={userRole}
        />
      </div>

      {/* ── Mobile : barre de titre avec bouton hamburger ── */}
      <div
        className="lg:hidden"
        style={{
          position:       "fixed",
          top:            0,
          left:           0,
          right:          0,
          zIndex:         30,
          height:         "var(--kh-header-height)",
          background:     "var(--kh-sidebar-bg)",
          borderBottom:   "1px solid var(--kh-dark-border)",
          display:        "flex",
          alignItems:     "center",
          padding:        "0 var(--kh-space-4)",
          gap:            "var(--kh-space-3)",
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir la navigation"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          style={{
            display:       "flex",
            alignItems:    "center",
            justifyContent:"center",
            width:         32,
            height:        32,
            borderRadius:  "var(--kh-radius)",
            border:        "none",
            background:    "transparent",
            cursor:        "pointer",
            color:         "var(--kh-dark-text-muted)",
            flexShrink:    0,
          }}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--kh-space-2)", minWidth: 0 }}>
          <Scissors size={16} strokeWidth={1.5} style={{ color: "var(--kh-brand-400)", flexShrink: 0 }} />
          <span
            style={{
              fontSize:     "var(--kh-text-sm)",
              fontWeight:   "var(--kh-font-semibold)",
              color:        "var(--kh-dark-text)",
              whiteSpace:   "nowrap",
              overflow:     "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {salonName}
          </span>
        </div>
      </div>

      {/* ── Mobile : overlay + sidebar ── */}
      {mobileOpen && (
        <>
          {/* Fond semi-transparent */}
          <div
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            style={{
              position:   "fixed",
              inset:      0,
              zIndex:     40,
              background: "rgba(0, 0, 0, 0.6)",
            }}
          />

          {/* Panneau sidebar mobile */}
          <div
            id="mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation principale"
            style={{
              position: "fixed",
              top:      0,
              left:     0,
              height:   "100%",
              zIndex:   50,
            }}
          >
            <SidebarPanel
              salonName={salonName}
              organizationName={organizationName}
              userRole={userRole}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
