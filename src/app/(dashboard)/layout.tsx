import { requireSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { ImpersonationBanner } from "@/features/admin/components/impersonation-banner";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  // Éviter la boucle infinie sur la page de suspension
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  if (pathname === "/dashboard/suspended") {
    return <>{children}</>;
  }

  // Vérifier que l'organisation n'est pas suspendue
  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { isActive: true },
  });

  if (org && !org.isActive) {
    redirect("/dashboard/suspended");
  }

  return (
    <>
      <ImpersonationBanner />
      {children}
    </>
  );
}
