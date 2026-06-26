import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession, getPendingSession } from "@/lib/auth/session";
import { SignupForm } from "./components/signup-form";

export const metadata: Metadata = {
  title: "Créer mon compte — KalendHair",
  description: "Créez votre compte KalendHair gratuitement et commencez à gérer votre salon.",
  robots: { index: false, follow: false },
};

export default async function InscriptionPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const pending = await getPendingSession();
  if (pending) redirect("/onboarding");

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Créer mon compte</h1>
        <p className="mt-2 text-sm text-slate-600">
          Essai gratuit · Aucune carte bancaire requise
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <SignupForm />
      </div>
    </div>
  );
}
