import type { Metadata } from "next";
import { PageHero } from "../components/ui/page-hero";
import { Container } from "../components/ui/container";
import { Button } from "../components/ui/button";
import { PilotContactForm } from "./components/pilot-contact-form";
import { JsonLd } from "../components/ui/json-ld";

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Rejoindre le pilote — KalendHair",
  description:
    "Candidatez pour rejoindre les premiers salons pilotes KalendHair. Accès gratuit complet, accompagnement personnalisé. Logiciel de gestion pour salon de coiffure.",
  alternates: { canonical: "https://kalendhair.fr/contact" },
  openGraph: {
    title: "Rejoindre le pilote — KalendHair",
    description:
      "Candidatez pour accéder gratuitement à KalendHair. Agenda, réservation, CRM, caisse, stocks — accompagnement personnalisé inclus.",
    url: "https://kalendhair.fr/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rejoindre le pilote — KalendHair",
    description:
      "Accès gratuit complet à KalendHair. Agenda, CRM, caisse, stocks — accompagnement personnalisé.",
  },
};

const BREADCRUMB_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: "https://kalendhair.fr/" },
    { "@type": "ListItem", position: 2, name: "Rejoindre le pilote", item: "https://kalendhair.fr/contact" },
  ],
};

/* ─── Sidebar blocks ─────────────────────────────────────────────────────────── */

function SidebarBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 8l3.5 3.5L13 4" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function ContactPage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <PageHero
        badge="Pilote fermé"
        title="Rejoignez les premiers salons pilotes"
        subtitle="Accès gratuit, accompagnement personnalisé, votre avis oriente le produit."
      />

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-16 lg:grid-cols-5 lg:gap-20">
            {/* ── Form ── */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  Formulaire de candidature
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Votre candidature en 2 minutes
                </h2>
                <p className="mt-2 text-slate-600">
                  {"Remplissez ce formulaire et nous vous répondrons sous 24 heures ouvrées."}
                </p>
              </div>
              <PilotContactForm />
            </div>

            {/* ── Sidebar ── */}
            <aside
              className="space-y-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 lg:col-span-2 lg:self-start"
              aria-label="Informations sur le programme pilote"
            >
              <SidebarBlock
                title="Pour qui ?"
                items={[
                  "Salons de coiffure indépendants en France",
                  "Gérants souhaitant moderniser leur gestion",
                  "Salons de 1 à 10+ employés",
                  "Ouvert à tous, sans condition de taille",
                ]}
              />

              <div className="border-t border-slate-200" />

              <SidebarBlock
                title="Ce que vous obtenez"
                items={[
                  "Accès complet et gratuit pendant le pilote",
                  "Accompagnement personnalisé à la prise en main",
                  "Tous les modules disponibles sans restriction",
                  "Réponse sous 24h ouvrées",
                ]}
              />

              <div className="border-t border-slate-200" />

              <SidebarBlock
                title="Ce que nous attendons"
                items={[
                  "Tester KalendHair dans votre salon réel",
                  "Nous partager vos retours sincères",
                  "Signaler les bugs ou manques rencontrés",
                ]}
              />

              <div className="border-t border-slate-200" />

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">
                  Découvrir avant de candidater
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button href="/demo" variant="secondary" size="sm">
                    Voir la démo
                  </Button>
                  <Button href="/tarifs" variant="secondary" size="sm">
                    Voir les tarifs
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
