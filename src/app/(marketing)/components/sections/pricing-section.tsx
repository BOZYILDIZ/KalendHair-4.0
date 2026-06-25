'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '../ui/button'

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type Billing = 'monthly' | 'annual'

interface Plan {
  id: string
  name: string
  tagline: string
  monthlyPrice: number
  annualPrice: number
  features: string[]
  popular?: boolean
}

/* ─── Plan data ─────────────────────────────────────────────────────────────── */

const PLANS: Plan[] = [
  {
    id: 'essential',
    name: 'Essential',
    monthlyPrice: 29,
    annualPrice: 290,
    tagline: 'Pour les salons solo ou en duo.',
    features: [
      'Agenda & planning illimité',
      'Réservation publique sans commission',
      'CRM Clients',
      'Gestion des services',
      "1 salon, jusqu'à 5 employés",
      'Support par e-mail',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 59,
    annualPrice: 590,
    tagline: "L'offre complète pour les salons en croissance.",
    features: [
      'Tout Essential',
      'Caisse & Paiements (reçus DGFIP)',
      'Gestion des stocks & fournisseurs',
      'Commissions automatiques',
      'KPI Dashboard',
      'Employés illimités',
      'Support prioritaire',
    ],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 99,
    annualPrice: 990,
    tagline: 'Multi-salons et équipes avancées.',
    features: [
      'Tout Pro',
      'Multi-salons illimités',
      'KPI avancé multi-sites',
      'Accès API (à venir)',
      'Support dédié',
    ],
  },
]

/* ─── Check icon ─────────────────────────────────────────────────────────────── */

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

/* ─── Pricing card ───────────────────────────────────────────────────────────── */

function PricingCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice
  const period = billing === 'monthly' ? '/mois' : '/an'
  const monthlyEquivalent = Math.round(plan.annualPrice / 12)

  if (plan.popular) {
    return (
      <article
        aria-label={`Plan ${plan.name} — recommandé`}
        className="relative z-10 flex flex-col rounded-2xl bg-indigo-600 p-8 shadow-2xl ring-1 ring-indigo-500 lg:-my-4 lg:py-12"
      >
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
            Le plus populaire
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
            {plan.name}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-5xl font-bold text-white">{price}€</span>
            <span className="text-indigo-200">{period}</span>
          </div>
          {billing === 'annual' && (
            <p className="mt-1 text-xs text-indigo-300">
              Soit {monthlyEquivalent}€/mois, facturé annuellement
            </p>
          )}
          <p className="mt-2 text-sm text-indigo-100">{plan.tagline}</p>
        </div>
        <ul className="mt-8 flex-1 space-y-3">
          {plan.features.map((feature) => (
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
      aria-label={`Plan ${plan.name}`}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8"
    >
      <div className="mb-6 h-7" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          {plan.name}
        </p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-5xl font-bold text-slate-900">{price}€</span>
          <span className="text-slate-500">{period}</span>
        </div>
        {billing === 'annual' && (
          <p className="mt-1 text-xs text-slate-400">
            Soit {monthlyEquivalent}€/mois, facturé annuellement
          </p>
        )}
        <p className="mt-2 text-sm text-slate-600">{plan.tagline}</p>
      </div>
      <ul className="mt-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
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

/* ─── Section ───────────────────────────────────────────────────────────────── */

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>('monthly')

  return (
    <div>
      {/* Billing toggle */}
      <div
        className="flex items-center justify-center gap-2"
        role="group"
        aria-label="Période de facturation"
      >
        <button
          aria-pressed={billing === 'monthly'}
          onClick={() => setBilling('monthly')}
          className={cn(
            'rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            billing === 'monthly'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
          )}
        >
          Mensuel
        </button>
        <button
          aria-pressed={billing === 'annual'}
          onClick={() => setBilling('annual')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            billing === 'annual'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
          )}
        >
          Annuel
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              billing === 'annual'
                ? 'bg-white/20 text-white'
                : 'bg-green-100 text-green-700',
            )}
          >
            −17%
          </span>
        </button>
      </div>

      {/* Cards */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-start">
        {PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} billing={billing} />
        ))}
      </div>
    </div>
  )
}
