import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPendingSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Configuration — KalendHair",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const pending = await getPendingSession();
  if (!pending) redirect("/inscription");

  return (
    <div className="w-full max-w-xl text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        Bienvenue sur KalendHair !
      </h1>
      <p className="mt-3 text-slate-600">
        La configuration de votre salon arrive très bientôt.
      </p>
      <p className="mt-2 text-sm text-slate-400">
        (Wizard d&apos;onboarding — PR #62)
      </p>
    </div>
  );
}
