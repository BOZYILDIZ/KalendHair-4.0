import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "../../components/ui/container";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Candidature reçue — KalendHair",
  description: "Merci pour votre candidature au programme pilote KalendHair. Nous vous répondrons sous 24 heures ouvrées.",
  robots: { index: false },
};

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function ContactMerciPage() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center bg-white py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <Badge variant="green">Candidature reçue</Badge>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Merci pour votre candidature !
          </h1>

          <p className="mt-6 text-xl text-slate-600">
            {"Nous avons bien reçu votre demande pour rejoindre le programme pilote KalendHair."}
          </p>

          {/* Timeline */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-left">
            <h2 className="text-base font-semibold text-slate-900">
              {"Et maintenant ?"}
            </h2>
            <ol className="mt-5 space-y-5">
              {[
                {
                  step: "1",
                  title: "Réponse sous 24h ouvrées",
                  description:
                    "Notre équipe examine votre candidature et revient vers vous rapidement à l'adresse e-mail fournie.",
                },
                {
                  step: "2",
                  title: "Onboarding personnalisé",
                  description:
                    "Nous vous aidons à configurer votre salon — services, employés, horaires — pour être opérationnel rapidement.",
                },
                {
                  step: "3",
                  title: "Votre avis compte",
                  description:
                    "Vos retours d'usage alimentent directement notre roadmap. Votre participation fait une vraie différence.",
                },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/demo" variant="primary" size="lg">
              Explorer la démo
            </Button>
            <Button href="/tarifs" variant="secondary" size="lg">
              Voir les tarifs
            </Button>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            {"Accéder à votre espace salon dès que votre accès est activé : "}
            <Link
              href="https://pro.kalendhair.fr/login"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            >
              pro.kalendhair.fr
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
