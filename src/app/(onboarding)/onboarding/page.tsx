import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPendingSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { OnboardingForm } from "./components/onboarding-form";

export const metadata: Metadata = {
  title: "Créez votre espace — KalendHair",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const pending = await getPendingSession();
  if (!pending) redirect("/inscription");

  const proUser = await prisma.proUser.findUnique({
    where: { id: pending.id },
    select: { id: true, firstName: true, organizationId: true, role: true },
  });

  if (!proUser) redirect("/inscription");

  // Double-submit : organisation déjà créée mais pending_session toujours présente
  // → rediriger vers login pour obtenir une session complète
  if (proUser.organizationId !== null) redirect("/login");

  return (
    <div className="w-full max-w-xl">
      {/* En-tête */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Étape 1 sur 6
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          Créez votre espace KalendHair
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Ces informations peuvent être modifiées à tout moment depuis votre tableau de bord.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <OnboardingForm firstName={proUser.firstName} />
      </div>
    </div>
  );
}
