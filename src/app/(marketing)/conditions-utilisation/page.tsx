import type { Metadata } from "next";
import { PageHero } from "../components/ui/page-hero";
import { Container } from "../components/ui/container";

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Conditions d'utilisation — KalendHair",
  description:
    "Conditions générales d'utilisation du site kalendhair.fr et du programme pilote KalendHair.",
  openGraph: {
    title: "Conditions d'utilisation — KalendHair",
    description:
      "CGU du site vitrine et du programme pilote KalendHair — accès, utilisation acceptable, disponibilité.",
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

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function ConditionsUtilisationPage() {
  return (
    <>
      <PageHero
        badge="Légal"
        title={"Conditions d'utilisation"}
        subtitle={"Règles d'accès et d'utilisation du site kalendhair.fr et du programme pilote."}
      />

      <div className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Disclaimer */}
            <div className="mb-10 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              <p className="font-semibold">Document de première version — informatif</p>
              <p className="mt-1">
                {"Ces conditions sont fournies à titre informatif. Elles sont destinées à être validées par un professionnel juridique avant toute exploitation commerciale complète de KalendHair."}
              </p>
            </div>

            <article>
              <Section title="1. Objet">
                <p>
                  {"Les présentes conditions d'utilisation (\"CGU\") régissent l'accès et l'utilisation du site vitrine "}
                  <strong>kalendhair.fr</strong>
                  {" ainsi que la participation au programme pilote de la solution SaaS KalendHair."}
                </p>
                <p>
                  {"En accédant au site, vous acceptez les présentes CGU sans réserve. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le site."}
                </p>
              </Section>

              <Section title="2. Accès au site vitrine">
                <p>
                  {"Le site kalendhair.fr est librement accessible à toute personne disposant d'un accès à Internet. KalendHair se réserve le droit de modifier, suspendre ou interrompre l'accès au site à tout moment, sans préavis ni obligation d'indemnisation."}
                </p>
                <p>
                  {"Le site est optimisé pour les navigateurs modernes (Chrome, Firefox, Safari, Edge dans leur version récente). KalendHair ne garantit pas la compatibilité avec des navigateurs obsolètes."}
                </p>
              </Section>

              <Section title="3. Programme pilote">
                <p>
                  {"Le programme pilote KalendHair est un accès fermé et gratuit à la solution SaaS, destiné à un nombre limité de salons de coiffure sélectionnés par l'équipe KalendHair."}
                </p>
                <p>
                  {"La participation au pilote est soumise à candidature via le formulaire disponible sur "}
                  <a href="/contact" className="text-indigo-600 underline-offset-2 hover:underline">
                    kalendhair.fr/contact
                  </a>
                  {". L'acceptation d'une candidature est discrétionnaire et ne constitue pas un engagement contractuel."}
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    {"L'accès pilote est entièrement gratuit pendant la phase de test."}
                  </li>
                  <li>
                    {"Il est accordé à titre personnel et non transférable."}
                  </li>
                  <li>
                    {"Il peut être révoqué à tout moment en cas d'abus, d'inactivité prolongée ou de fin du programme."}
                  </li>
                </ul>
              </Section>

              <Section title="4. Utilisation acceptable">
                <p>
                  {"Vous vous engagez à utiliser le site et le SaaS KalendHair de manière licite et dans le respect des présentes CGU. En particulier, il est interdit de :"}
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    {"Tenter de contourner les mesures de sécurité ou d'accéder à des données qui ne vous sont pas destinées."}
                  </li>
                  <li>
                    {"Utiliser le service à des fins illicites, frauduleuses ou contraires à l'ordre public."}
                  </li>
                  <li>
                    {"Soumettre des données personnelles de tiers sans leur consentement."}
                  </li>
                  <li>
                    {"Surcharger volontairement les serveurs ou tenter de perturber le fonctionnement du service."}
                  </li>
                  <li>
                    {"Reproduire ou exploiter commercialement tout ou partie du site ou du SaaS sans autorisation écrite."}
                  </li>
                </ul>
              </Section>

              <Section title="5. Absence de garantie commerciale pendant le pilote">
                <p>
                  {"Le programme pilote est une version en cours de développement. À ce titre :"}
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    {"KalendHair ne garantit pas l'absence d'interruptions, d'erreurs ou de pertes de données."}
                  </li>
                  <li>
                    {"Certaines fonctionnalités annoncées peuvent ne pas encore être disponibles ou être incomplètes."}
                  </li>
                  <li>
                    {"Il est déconseillé de faire reposer des opérations critiques (gestion de caisse, données clients sensibles) uniquement sur la version pilote sans procédure de sauvegarde externe."}
                  </li>
                  <li>
                    {"KalendHair ne saurait être tenu responsable de tout préjudice résultant d'un dysfonctionnement survenant pendant la phase pilote."}
                  </li>
                </ul>
              </Section>

              <Section title="6. Disponibilité du service">
                <p>
                  {"KalendHair s'efforce de maintenir le site et le SaaS accessibles 24h/24 et 7j/7. Toutefois, des interruptions pour maintenance, mise à jour ou incident technique peuvent survenir."}
                </p>
                <p>
                  {"Des opérations de maintenance seront, dans la mesure du possible, communiquées à l'avance aux participants au pilote."}
                </p>
              </Section>

              <Section title="7. Limitation de responsabilité">
                <p>
                  {"Dans les limites permises par la loi, KalendHair ne peut être tenu responsable :"}
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>{"des dommages indirects, pertes d'exploitation ou pertes de données ;"}</li>
                  <li>{"des interruptions de service indépendantes de sa volonté (défaillance réseau, hébergeur, force majeure) ;"}</li>
                  <li>{"de l'utilisation faite par les utilisateurs des données issues du service."}</li>
                </ul>
              </Section>

              <Section title="8. Suspension en cas d'abus">
                <p>
                  {"KalendHair se réserve le droit de suspendre ou de clôturer sans préavis l'accès d'un utilisateur en cas de non-respect des présentes CGU, d'utilisation abusive, ou de comportement susceptible de nuire au service ou aux autres utilisateurs."}
                </p>
              </Section>

              <Section title="9. Évolution du service et des CGU">
                <p>
                  {"KalendHair se réserve le droit de modifier les fonctionnalités du service, les tarifs (lors du lancement commercial), et les présentes CGU à tout moment. Les utilisateurs seront informés des modifications substantielles par e-mail ou notification dans l'application."}
                </p>
                <p>
                  {"La poursuite de l'utilisation du service après notification des nouvelles CGU vaut acceptation."}
                </p>
              </Section>

              <Section title="10. Droit applicable et juridiction">
                <p>
                  {"Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut d'accord amiable, les tribunaux français seront seuls compétents."}
                </p>
              </Section>

              <Section title="11. Mise à jour">
                <p className="text-sm text-slate-500">
                  Version 1.0 — Juin 2026. Ces conditions sont susceptibles d&apos;être modifiées
                  avant ou lors du lancement commercial de KalendHair.
                </p>
              </Section>
            </article>
          </div>
        </Container>
      </div>
    </>
  );
}
