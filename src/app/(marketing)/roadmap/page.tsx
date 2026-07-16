import type { Metadata } from 'next'
import { PageHero } from '../components/ui/page-hero'
import { Container } from '../components/ui/container'
import { SectionTitle } from '../components/ui/section-title'
import { CtaBanner } from '../components/ui/cta-banner'
import { RoadmapColumn } from '../components/ui/roadmap-column'
import { Button } from '../components/ui/button'
import type { RoadmapItem } from '../components/ui/roadmap-column'

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Roadmap — Ce que nous construisons | KalendHair",
  description:
    "Découvrez la roadmap de KalendHair : fonctionnalités disponibles, en préparation et prévues. Logiciel de gestion salon de coiffure en évolution continue.",
  openGraph: {
    title: "Roadmap — Ce que nous construisons | KalendHair",
    description:
      "KalendHair en évolution constante. Voyez ce qui est disponible, ce qui arrive et ce qui est prévu pour votre salon de coiffure.",
    type: 'website',
  },
}

/* ─── Roadmap data ──────────────────────────────────────────────────────────── */

const AVAILABLE: RoadmapItem[] = [
  { label: 'Agenda multi-employés' },
  { label: 'Réservation publique sans commission' },
  { label: 'CRM Clients complet' },
  { label: 'Caisse & Paiements (reçus DGFIP)' },
  { label: 'Gestion des stocks & inventaire' },
  { label: 'Commandes fournisseurs' },
  { label: 'Commissions automatiques' },
  { label: 'KPI Dashboard temps réel' },
  { label: 'Panneau Super Admin' },
  { label: 'Accès web multi-devices' },
]

const SOON: RoadmapItem[] = [
  { label: 'Application mobile iOS & Android' },
  { label: 'Notifications e-mail personnalisées' },
  { label: 'Export comptabilité (CSV, XLSX)' },
  { label: 'Gestion des avoirs clients' },
  { label: 'Tableau de bord multi-salons' },
  { label: "Documentation d'aide enrichie" },
]

const LATER: RoadmapItem[] = [
  { label: 'Paiement en ligne (intégration Stripe)' },
  { label: 'Programme de fidélité clients' },
  { label: 'SMS de rappel de rendez-vous' },
  { label: 'API publique pour intégrations' },
  { label: 'Portail de réservation avancé' },
]

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function RoadmapPage() {
  return (
    <>
      <PageHero
        badge="Roadmap"
        title="Ce que nous construisons, et ce qui vient ensuite"
        subtitle="KalendHair évolue en continu. Voici où nous en sommes et ce qui arrive."
      />

      {/* Disclaimer */}
      <div className="border-b border-slate-200 bg-slate-50 py-4">
        <Container>
          <p className="text-center text-sm text-slate-600">
            <strong className="font-semibold text-slate-700">Roadmap informative, non contractuelle.</strong>
            {" Les priorités peuvent évoluer en fonction des retours des salons pilotes. Aucune date fixe n'est garantie."}
          </p>
        </Container>
      </div>

      {/* Roadmap columns */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="roadmap-columns-title">
        <Container>
          <SectionTitle
            id="roadmap-columns-title"
            eyebrow="État actuel"
            title="Où en est KalendHair aujourd'hui ?"
            subtitle="Un produit complet dès maintenant, avec une feuille de route ambitieuse."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
            <RoadmapColumn
              status="available"
              title="Disponible maintenant"
              items={AVAILABLE}
            />
            <RoadmapColumn
              status="soon"
              title="En préparation"
              items={SOON}
            />
            <RoadmapColumn
              status="later"
              title="Prévu plus tard"
              items={LATER}
            />
          </div>
        </Container>
      </section>

      {/* Pilote note */}
      <section className="bg-indigo-50 py-14 sm:py-16" aria-labelledby="pilote-note-title">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="pilote-note-title"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              Les retours pilotes orientent nos priorités
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              {"Les fonctionnalités en préparation et prévues seront priorisées selon les retours des salons pilotes. Si quelque chose vous manque pour votre activité, dites-le nous."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact?type=essai" variant="primary" size="lg">
                Rejoindre les salons pilotes
              </Button>
              <Button href="/fonctionnalites" variant="secondary" size="lg">
                Voir les fonctionnalités actuelles
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Testez KalendHair dès maintenant"
        subtitle="Accès gratuit complet. Accompagnement personnalisé. Sans engagement."
        primaryLabel="Essayer gratuitement"
        primaryHref="/contact?type=essai"
        secondaryLabel="Voir les tarifs"
        secondaryHref="/tarifs"
        theme="dark"
      />
    </>
  )
}
