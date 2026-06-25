import Link from 'next/link'
import { cn } from '@/lib/cn'
import { Container } from '../ui/container'
import { SectionTitle } from '../ui/section-title'
import { Button } from '../ui/button'

/* ─── Data ─────────────────────────────────────────────────────────────────── */

interface Plan {
  id: string
  name: string
  price: number
  tagline: string
  features: string[]
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'essential',
    name: 'Essential',
    price: 29,
    tagline: 'Pour les salons solo ou en duo.',
    features: [
      'Agenda & Rendez-vous illimités',
      'Réservation publique sans commission',
      'CRM Clients',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59,
    tagline: "L'offre complète pour les salons en croissance.",
    features: [
      'Tout Essential',
      'Caisse, Stocks & Fournisseurs',
      'Commissions & KPI Dashboard',
    ],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    tagline: 'Multi-salons et équipes avancées.',
    features: [
      'Tout Pro',
      'Multi-salons illimités',
      'Support dédié',
    ],
  },
]

/* ─── Pricing card ─────────────────────────────────────────────────────────── */

function CheckIcon({ inverted }: { inverted?: boolean }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', inverted ? 'text-indigo-200' : 'text-indigo-500')}
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
  )
}

function PricingCard({ plan }: { plan: Plan }) {
  const { name, price, tagline, features, popular } = plan

  if (popular) {
    return (
      <article
        aria-label={`Plan ${name} — recommandé`}
        className="relative z-10 flex flex-col rounded-2xl bg-indigo-600 p-8 shadow-2xl ring-1 ring-indigo-500 lg:-my-4 lg:py-12"
      >
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
            Le plus populaire
          </span>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
            {name}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-5xl font-bold text-white">{price}€</span>
            <span className="text-indigo-200">/mois</span>
          </div>
          <p className="mt-2 text-sm text-indigo-100">{tagline}</p>
        </div>

        <ul className="mt-8 space-y-3 flex-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm text-indigo-100">
              <CheckIcon inverted />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button
            href={`/contact?type=essai&plan=${plan.id}`}
            variant="white"
            size="md"
            className="w-full justify-center"
          >
            Essayer gratuitement
          </Button>
        </div>
      </article>
    )
  }

  return (
    <article
      aria-label={`Plan ${name}`}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8"
    >
      <div className="mb-6 h-7" aria-hidden="true" />

      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          {name}
        </p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-5xl font-bold text-slate-900">{price}€</span>
          <span className="text-slate-500">/mois</span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{tagline}</p>
      </div>

      <ul className="mt-8 space-y-3 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-600">
            <CheckIcon />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button
          href={`/contact?type=essai&plan=${plan.id}`}
          variant="secondary"
          size="md"
          className="w-full justify-center"
        >
          Essayer gratuitement
        </Button>
      </div>
    </article>
  )
}

/* ─── Section ──────────────────────────────────────────────────────────────── */

export function PricingTeaser() {
  return (
    <section className="bg-slate-950 py-24 sm:py-28" aria-labelledby="pricing-teaser-title">
      <Container>
        <SectionTitle
          id="pricing-teaser-title"
          eyebrow="Tarifs"
          title="Des tarifs clairs pour chaque salon"
          subtitle="Sans engagement. Sans commission. Sans mauvaise surprise."
          dark
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-start">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Tous les plans incluent un accès complet pendant la phase pilote.{' '}
          <Link
            href="/tarifs"
            className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Voir le comparatif complet →
          </Link>
        </p>
      </Container>
    </section>
  )
}
