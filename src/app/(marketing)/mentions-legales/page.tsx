import type { Metadata } from "next";
import { PageHero } from "../components/ui/page-hero";
import { Container } from "../components/ui/container";
import { JsonLd } from "../components/ui/json-ld";

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Mentions légales — KalendHair",
  description:
    "Mentions légales du site kalendhair.fr — éditeur, hébergeur, propriété intellectuelle et conditions d'utilisation.",
  alternates: { canonical: "https://kalendhair.fr/mentions-legales" },
  openGraph: {
    title: "Mentions légales — KalendHair",
    description: "Mentions légales du site kalendhair.fr.",
    url: "https://kalendhair.fr/mentions-legales",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mentions légales — KalendHair",
    description: "Mentions légales du site kalendhair.fr.",
  },
};

const BREADCRUMB_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: "https://kalendhair.fr/" },
    { "@type": "ListItem", position: 2, name: "Mentions légales", item: "https://kalendhair.fr/mentions-legales" },
  ],
};

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3 text-slate-600">{children}</div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function MentionsLegalesPage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <PageHero
        badge="Légal"
        title="Mentions légales"
        subtitle="Informations légales relatives au site kalendhair.fr"
      />

      <div className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Disclaimer */}
            <div className="mb-10 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              <p className="font-semibold">Document de première version — informatif</p>
              <p className="mt-1">
                {"Ce document est fourni à titre informatif. Il est destiné à être validé par un professionnel juridique avant toute exploitation commerciale complète de KalendHair."}
              </p>
            </div>

            <article>
              <Section title="1. Éditeur du site">
                <p>
                  Le site <strong>kalendhair.fr</strong> est édité par :
                </p>
                <ul className="list-none space-y-1 text-sm">
                  <li><span className="font-medium">Responsable :</span> Hasan Biçer</li>
                  <li><span className="font-medium">Projet :</span> KalendHair</li>
                  <li>
                    <span className="font-medium">Statut juridique :</span>{" "}
                    {"Entité en cours d'immatriculation — numéro SIRET non encore attribué."}
                  </li>
                  <li>
                    <span className="font-medium">Contact :</span>{" "}
                    <a
                      href="mailto:contact@kalendhair.fr"
                      className="text-indigo-600 underline-offset-2 hover:underline"
                    >
                      contact@kalendhair.fr
                    </a>
                  </li>
                </ul>
                <p className="text-sm italic text-slate-500">
                  {"Ces informations seront complétées dès l'immatriculation de la société (numéro SIRET, forme juridique, capital social, adresse du siège)."}
                </p>
              </Section>

              <Section title="2. Directeur de la publication">
                <p>Hasan Biçer, en qualité de responsable du projet KalendHair.</p>
              </Section>

              <Section title="3. Hébergement">
                <p>
                  Le site est hébergé par :
                </p>
                <ul className="list-none space-y-1 text-sm">
                  <li><span className="font-medium">Société :</span> Vercel Inc.</li>
                  <li>
                    <span className="font-medium">Adresse :</span>{" "}
                    340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis
                  </li>
                  <li>
                    <span className="font-medium">Site :</span>{" "}
                    <a
                      href="https://vercel.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline-offset-2 hover:underline"
                    >
                      vercel.com
                    </a>
                  </li>
                </ul>
                <p>
                  La base de données applicative est gérée par :
                </p>
                <ul className="list-none space-y-1 text-sm">
                  <li><span className="font-medium">Société :</span> Neon Inc.</li>
                  <li>
                    <span className="font-medium">Site :</span>{" "}
                    <a
                      href="https://neon.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline-offset-2 hover:underline"
                    >
                      neon.tech
                    </a>
                  </li>
                </ul>
              </Section>

              <Section title="4. Nom de domaine">
                <p>
                  Le nom de domaine <strong>kalendhair.fr</strong> est enregistré auprès du registrar IONOS SE.
                </p>
              </Section>

              <Section title="5. Propriété intellectuelle">
                <p>
                  {"L'ensemble du contenu publié sur le site kalendhair.fr — textes, visuels, logos, architecture de l'interface — est la propriété exclusive de Hasan Biçer / KalendHair, sauf mention contraire."}
                </p>
                <p>
                  {"Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable."}
                </p>
              </Section>

              <Section title="6. Responsabilité">
                <p>
                  {"KalendHair s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, KalendHair ne peut garantir l'exhaustivité ou l'absence d'erreur de ces informations."}
                </p>
                <p>
                  {"KalendHair ne saurait être tenu responsable des dommages directs ou indirects résultant de l'accès au site, de son utilisation ou de l'utilisation d'informations qui y figurent."}
                </p>
                <p>
                  {"Le site peut contenir des liens vers des sites tiers. KalendHair n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu."}
                </p>
              </Section>

              <Section title="7. Droit applicable">
                <p>
                  {"Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut d'accord amiable, les tribunaux français seront compétents."}
                </p>
              </Section>

              <Section title="8. Mise à jour">
                <p className="text-sm text-slate-500">
                  Version 1.0 — Juin 2026. Ce document est susceptible d&apos;être modifié sans préavis.
                </p>
              </Section>
            </article>
          </div>
        </Container>
      </div>
    </>
  );
}
