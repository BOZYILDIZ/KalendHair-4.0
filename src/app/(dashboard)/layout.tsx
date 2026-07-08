import { requireSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { ImpersonationBanner } from "@/features/admin/components/impersonation-banner";
import { DASHBOARD_V2 } from "@/lib/flags";
import { getSalon } from "@/features/salons/salon.service";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import type { SidebarUserRole } from "@/features/dashboard/components/app-sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  // Court-circuit sur la page de suspension (évite la boucle infinie)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  if (pathname === "/dashboard/suspended") {
    return <>{children}</>;
  }

  // Vérifier que l'organisation n'est pas suspendue
  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { isActive: true, name: true },
  });

  if (org && !org.isActive) {
    redirect("/dashboard/suspended");
  }

  // ── Layout legacy (DASHBOARD_V2=false) — comportement inchangé ────────────
  if (!DASHBOARD_V2) {
    return (
      <>
        <ImpersonationBanner />
        {children}
      </>
    );
  }

  // ── Layout Dashboard v2 (DASHBOARD_V2=true) ────────────────────────────────
  const salon = await getSalon(session.organizationId);

  return (
    <div
      style={{
        display:        "flex",
        height:         "100%",
        overflow:       "hidden",
        background:     "var(--kh-bg)",
      }}
    >
      {/* Sidebar persistante (desktop) + header mobile + overlay mobile */}
      <AppSidebar
        salonName={salon?.name ?? "Mon salon"}
        organizationName={org?.name ?? ""}
        userRole={session.role as SidebarUserRole}
      />

      {/* Zone de contenu principale */}
      <div
        style={{
          flex:       1,
          display:    "flex",
          flexDirection: "column",
          overflow:   "hidden",
          minWidth:   0,
        }}
      >
        {/* Banner impersonation (sticky, z-50, rouge) */}
        <ImpersonationBanner />

        {/* Contenu des pages
            pt-[var(--kh-header-height)] sur mobile pour compenser le header fixe.
            lg:pt-0 car le header mobile est masqué en desktop. */}
        <div
          style={{ flex: 1, overflowY: "auto" }}
          className="pt-[var(--kh-header-height)] lg:pt-0"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
