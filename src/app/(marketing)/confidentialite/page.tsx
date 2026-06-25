import type { Metadata } from "next";
import { PageHero } from "../components/ui/page-hero";
import { Container } from "../components/ui/container";

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Politique de confidentialité — KalendHair",
  description:
    "Politique de confidentialité et protection des données personnelles de KalendHair. RGPD, données collectées, droits des utilisateurs.",
  openGraph: {
    title: "Politique de confidentialité — KalendHair",
    description:
      "Données collectées, finalités, sous-traitants et droits RGPD — KalendHair.",
    type: "website",
  },
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <div className="mt-2 space-y-2 text-slate-600">{children}</div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero
        badge="RGPD"
        title="Politique de confidentialité"
        subtitle="Protection de vos données personnelles — comment nous les collectons, les utilisons et les protégeons."
      />

      <div className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Disclaimer */}
            <div className="mb-10 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              <p className="font-semibold">Document de première version — informatif</p>
              <p className="mt-1">
                {"Ce document est fourni à titre informatif. Il est destiné à être validé par un professionnel juridique (DPO ou avocat spécialisé RGPD) avant toute exploitation commerciale complète de KalendHair."}
              </p>
            </div>

            <article>
              <Section title="1. Responsable du traitement">
                <p>
                  Le responsable du traitement des données collectées via le site{" "}
                  <strong>kalendhair.fr</strong> est :
                </p>
                <ul className="list-none space-y-1 text-sm">
                  <li><span className="font-medium">Nom :</span> Hasan Biçer / KalendHair</li>
                  <li>
                    <span className="font-medium">Contact RGPD :</span>{" "}
                    <a
                      href="mailto:contact@kalendhair.fr"
                      className="text-indigo-600 underline-offset-2 hover:underline"
                    >
                      contact@kalendhair.fr
                    </a>
                  </li>
                </ul>
              </Section>

              <Section title="2. Données collectées">
                <SubSection title="2.1 Via le formulaire de candidature pilote (/contact)">
                  <p>
                    {"Lorsque vous soumettez une candidature pour rejoindre le programme pilote, nous collectons :"}
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Nom du salon</li>
                    <li>Prénom et nom du responsable</li>
                    <li>Adresse e-mail (obligatoire)</li>
                    <li>Numéro de téléphone (optionnel)</li>
                    <li>Ville</li>
                    <li>{"Nombre d'employés"}</li>
                    <li>Modules souhaités</li>
                    <li>Message libre (optionnel)</li>
                    <li>Consentement RGPD (case à cocher)</li>
                  </ul>
                  <p className="text-sm italic text-slate-500">
                    {"Ces données ne sont pas stockées en base de données dans la version actuelle. Elles sont transmises par e-mail à l'équipe KalendHair via Resend."}
                  </p>
                </SubSection>

                <SubSection title="2.2 Via le SaaS professionnel (pro.kalendhair.fr)">
                  <p>
                    {"Lors de l'utilisation future de l'espace professionnel KalendHair, les données suivantes pourront être traitées :"}
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Données de compte (email, mot de passe haché, informations du salon)</li>
                    <li>Données des clients du salon (nom, téléphone, historique RDV)</li>
                    <li>Données de planning et rendez-vous</li>
                    <li>Données financières (transactions, tickets de caisse)</li>
                    <li>Données de stock et fournisseurs</li>
                  </ul>
                  <p className="text-sm italic text-slate-500">
                    {"Ces traitements seront détaillés dans une politique de confidentialité dédiée au SaaS, à venir lors du lancement commercial."}
                  </p>
                </SubSection>

                <SubSection title="2.3 Données de navigation">
                  <p>
                    {"Des données techniques anonymisées peuvent être collectées automatiquement lors de la navigation : adresse IP, type de navigateur, pages visitées, durée de session. Ces données sont utilisées uniquement à des fins d'analyse de l'audience et d'amélioration du site."}
                  </p>
                </SubSection>
              </Section>

              <Section title="3. Finalités et base légale">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-2 pr-4 text-left font-semibold text-slate-700">Finalité</th>
                        <th className="py-2 pr-4 text-left font-semibold text-slate-700">Base légale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        ["Traitement des candidatures pilotes", "Consentement (art. 6.1.a RGPD)"],
                        ["Recontact dans le cadre du pilote", "Consentement (art. 6.1.a RGPD)"],
                        ["Amélioration du produit via les retours", "Intérêt légitime (art. 6.1.f RGPD)"],
                        ["Analyse anonyme de l'audience du site", "Intérêt légitime (art. 6.1.f RGPD)"],
                        ["Gestion du SaaS professionnel (futur)", "Exécution du contrat (art. 6.1.b RGPD)"],
                      ].map(([finalite, base]) => (
                        <tr key={finalite}>
                          <td className="py-2.5 pr-4 text-slate-600">{finalite}</td>
                          <td className="py-2.5 text-slate-600">{base}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="4. Durée de conservation">
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Candidatures pilotes :</span>{" "}
                    12 mois à compter de la réception, ou jusqu&apos;à clôture du programme pilote.
                  </li>
                  <li>
                    <span className="font-medium">Données de navigation (analytics) :</span>{" "}
                    25 mois maximum, conformément aux recommandations de la CNIL.
                  </li>
                  <li>
                    <span className="font-medium">Données SaaS (futur) :</span>{" "}
                    Durée du contrat + 3 ans pour les obligations légales de conservation.
                  </li>
                </ul>
              </Section>

              <Section title="5. Sous-traitants et transferts">
                <p>
                  KalendHair fait appel aux prestataires suivants pour le traitement des données :
                </p>
                <div className="mt-4 space-y-4">
                  {[
                    {
                      name: "Vercel Inc.",
                      role: "Hébergement du site et des fonctions serveur",
                      location: "États-Unis (transfert encadré par les clauses contractuelles types de la Commission européenne)",
                      url: "https://vercel.com/legal/privacy-policy",
                      active: true,
                    },
                    {
                      name: "Neon Inc.",
                      role: "Base de données PostgreSQL (infrastructure SaaS)",
                      location: "États-Unis / Europe (région configurable)",
                      url: "https://neon.tech/privacy",
                      active: true,
                    },
                    {
                      name: "Resend Inc.",
                      role: "Envoi d'e-mails transactionnels (candidatures, notifications)",
                      location: "États-Unis",
                      url: "https://resend.com/legal/privacy-policy",
                      active: false,
                      note: "Non encore activé en production",
                    },
                    {
                      name: "Sentry Inc.",
                      role: "Surveillance des erreurs applicatives",
                      location: "États-Unis",
                      url: "https://sentry.io/privacy/",
                      active: false,
                      note: "Non encore activé",
                    },
                    {
                      name: "Vercel Analytics / Speed Insights",
                      role: "Analyse anonymisée de l'audience et des performances",
                      location: "États-Unis",
                      url: "https://vercel.com/legal/privacy-policy",
                      active: false,
                      note: "Non encore activé",
                    },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"
                    >
                      <p className="font-semibold text-slate-800">
                        {p.name}{" "}
                        {!p.active && (
                          <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                            {p.note}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-slate-600">{p.role}</p>
                      <p className="mt-1 text-slate-500">{p.location}</p>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-indigo-600 underline-offset-2 hover:underline"
                      >
                        Politique de confidentialité ↗
                      </a>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="6. Droits des utilisateurs">
                <p>
                  {"Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :"}
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Droit d&apos;accès :</span>{" "}
                    obtenir une copie des données vous concernant.
                  </li>
                  <li>
                    <span className="font-medium">Droit de rectification :</span>{" "}
                    corriger des données inexactes ou incomplètes.
                  </li>
                  <li>
                    <span className="font-medium">Droit à l&apos;effacement :</span>{" "}
                    {"demander la suppression de vos données, dans les limites des obligations légales."}
                  </li>
                  <li>
                    <span className="font-medium">Droit à la limitation :</span>{" "}
                    limiter le traitement de vos données dans certaines situations.
                  </li>
                  <li>
                    <span className="font-medium">Droit d&apos;opposition :</span>{" "}
                    {"vous opposer à un traitement fondé sur l'intérêt légitime."}
                  </li>
                  <li>
                    <span className="font-medium">Droit à la portabilité :</span>{" "}
                    recevoir vos données dans un format structuré et lisible par machine.
                  </li>
                </ul>
                <p>
                  Pour exercer ces droits, contactez-nous à :{" "}
                  <a
                    href="mailto:contact@kalendhair.fr"
                    className="text-indigo-600 underline-offset-2 hover:underline"
                  >
                    contact@kalendhair.fr
                  </a>
                  . Nous répondrons dans un délai d&apos;un mois.
                </p>
                <p>
                  {"Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) sur "}
                  <a
                    href="https://www.cnil.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline-offset-2 hover:underline"
                  >
                    cnil.fr
                  </a>
                  .
                </p>
              </Section>

              <Section title="7. Cookies et traceurs">
                <p>
                  {"Le site kalendhair.fr utilise des cookies techniques strictement nécessaires au fonctionnement du site (session, sécurité). Aucun cookie publicitaire ou de profilage n'est déposé."}
                </p>
                <p>
                  {"Des outils d'analyse d'audience (Vercel Analytics) pourront être activés à l'avenir. Dans ce cas, une information spécifique sera ajoutée à cette page et un mécanisme de consentement approprié sera mis en place si nécessaire."}
                </p>
              </Section>

              <Section title="8. Sécurité">
                <p>
                  {"KalendHair met en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement HTTPS, mots de passe hachés (bcrypt), accès aux données restreint, hébergement chez des prestataires certifiés."}
                </p>
              </Section>

              <Section title="9. Mise à jour">
                <p className="text-sm text-slate-500">
                  Version 1.0 — Juin 2026. Cette politique est susceptible d&apos;être modifiée
                  lors du lancement commercial ou de l&apos;activation de nouveaux services.
                  La date de mise à jour sera indiquée en haut de page.
                </p>
              </Section>
            </article>
          </div>
        </Container>
      </div>
    </>
  );
}
