import type { Metadata } from 'next'
import { PageHero } from '../components/ui/page-hero'
import { Container } from '../components/ui/container'
import { SectionTitle } from '../components/ui/section-title'
import { CtaBanner } from '../components/ui/cta-banner'
import { DemoTabs } from '../components/ui/demo-tabs'
import { Button } from '../components/ui/button'
import type { DemoTab } from '../components/ui/demo-tabs'

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Démonstration — Voyez KalendHair en action | KalendHair",
  description:
    "Explorez les modules de KalendHair : agenda multi-employés, tableau de bord KPI, CRM clients, caisse conforme DGFIP, gestion des stocks. Le logiciel de réservation salon tout-en-un.",
  openGraph: {
    title: "Démonstration — Voyez KalendHair en action | KalendHair",
    description:
      "Parcourez chaque module de KalendHair comme si vous étiez dans votre salon. Logiciel de gestion et réservation pour salon de coiffure.",
    type: 'website',
  },
}

/* ─── Demo tabs data ────────────────────────────────────────────────────────── */

const DEMO_TABS: DemoTab[] = [
  {
    id: 'agenda',
    label: 'Agenda',
    screenshotLabel: "Vue semaine multi-employés — aperçu produit à venir",
    description:
      "Visualisez le planning de toute votre équipe en temps réel. Chaque collaborateur a sa couleur, les conflits sont détectés automatiquement, les réservations en ligne apparaissent instantanément.",
    note: "Capture du salon de démonstration « L'Atelier Lumière » en cours de constitution.",
  },
  {
    id: 'kpi',
    label: 'KPI',
    screenshotLabel: "Tableau de bord KPI avec métriques salon — aperçu produit à venir",
    description:
      "CA journalier, hebdomadaire et mensuel, taux d'occupation par employé, top prestations les plus rentables — vos métriques essentielles consolidées sur un seul écran.",
    note: "Données générées à partir du salon de démonstration.",
  },
  {
    id: 'crm',
    label: 'CRM',
    screenshotLabel: "Fiche client avec historique complet — aperçu produit à venir",
    description:
      "Retrouvez instantanément l'historique d'un client, ses prestations passées, les montants encaissés et vos notes internes. Votre équipe est toujours dans le contexte.",
  },
  {
    id: 'caisse',
    label: 'Caisse',
    screenshotLabel: "Module d'encaissement — aperçu produit à venir",
    description:
      "Encaissez un rendez-vous terminé en quelques secondes depuis la fiche de réservation. Choisissez le mode de paiement, générez le reçu conforme DGFIP en un clic.",
  },
  {
    id: 'stocks',
    label: 'Stock',
    screenshotLabel: "Hub inventaire avec alertes rupture — aperçu produit à venir",
    description:
      "Suivez vos niveaux de stock en temps réel. Les alertes de rupture vous préviennent avant que le problème se pose, et les bons de commande fournisseurs se créent en quelques clics.",
  },
  {
    id: 'superadmin',
    label: 'Super Admin',
    screenshotLabel: "Panneau Super Admin — aperçu produit à venir",
    description:
      "Vue globale de toutes les organisations actives sur la plateforme, gestion des abonnements et des plans, métriques d'utilisation en temps réel. Accès réservé SUPER_ADMIN.",
    note: "Le panneau Super Admin est géré par l'équipe KalendHair.",
  },
]

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function DemoPage() {
  return (
    <>
      <PageHero
        badge="Démonstration"
        title="Découvrez KalendHair en action"
        subtitle="Parcourez chaque module comme si vous étiez dans votre propre salon. Les captures produit sont en cours de constitution avec le salon de démonstration."
        actions={
          <>
            <Button href="/contact?type=essai" variant="white" size="lg">
              Essayer gratuitement
            </Button>
            <Button href="/fonctionnalites" variant="outline-white" size="lg">
              Toutes les fonctionnalités
            </Button>
          </>
        }
      />

      {/* Demo tabs section */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="demo-section-title">
        <Container>
          <SectionTitle
            id="demo-section-title"
            eyebrow="Aperçu produit"
            title="6 modules, un seul espace de travail"
            subtitle="Chaque module est conçu pour s'intégrer naturellement dans votre journée de travail."
          />
          <div className="mt-12">
            <DemoTabs tabs={DEMO_TABS} />
          </div>
        </Container>
      </section>

      {/* What to expect */}
      <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="expectations-title">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="expectations-title"
              className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            >
              Les captures produit arrivent bientôt
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Nous constituons actuellement le salon de démonstration{' '}
              <strong className="font-semibold text-slate-900">« L&apos;Atelier Lumière »</strong>{' '}
              pour vous offrir des captures réalistes de KalendHair en situation réelle.
              En attendant, rejoignez les salons pilotes pour tester le produit directement.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact?type=essai" variant="primary" size="lg">
                Accéder à l&apos;essai gratuit
              </Button>
              <Button href="/fonctionnalites" variant="secondary" size="lg">
                Voir toutes les fonctionnalités
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Prêt à essayer par vous-même ?"
        subtitle="Accès pilote gratuit, accompagnement personnalisé, sans engagement."
        primaryLabel="Rejoindre les salons pilotes"
        primaryHref="/contact?type=essai"
        secondaryLabel="Voir les tarifs"
        secondaryHref="/tarifs"
        theme="dark"
      />
    </>
  )
}
