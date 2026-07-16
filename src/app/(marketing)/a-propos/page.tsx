import type { Metadata } from 'next'
import { PageHero } from '../components/ui/page-hero'
import { Container } from '../components/ui/container'
import { SectionTitle } from '../components/ui/section-title'
import { CtaBanner } from '../components/ui/cta-banner'
import { Button } from '../components/ui/button'

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "À propos — KalendHair, logiciel salon de coiffure",
  description:
    "Découvrez pourquoi KalendHair a été créé, notre vision produit et notre engagement envers les salons de coiffure français. Un logiciel construit avec et pour les gérants de salon.",
  openGraph: {
    title: "À propos — KalendHair, logiciel salon de coiffure",
    description:
      "Pourquoi KalendHair existe, notre vision et notre engagement envers les salons pilotes.",
    type: 'website',
  },
}

/* ─── Engagement items ──────────────────────────────────────────────────────── */

const COMMITMENTS = [
  {
    id: 'acces',
    title: 'Accès complet pendant le pilote',
    description:
      "Toutes les fonctionnalités sont accessibles sans restriction pendant la phase pilote. Aucune carte bancaire requise.",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'accompagnement',
    title: 'Accompagnement personnalisé',
    description:
      "Notre équipe est disponible pour vous aider à configurer votre salon et prendre en main chaque module.",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    id: 'avis',
    title: 'Votre avis oriente le produit',
    description:
      "Les retours des salons pilotes alimentent directement notre roadmap. Si quelque chose ne fonctionne pas, nous le traitons en priorité.",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    id: 'transparence',
    title: 'Aucune mauvaise surprise',
    description:
      "Aucune facturation automatique pendant la phase pilote. La bascule vers les abonnements payants sera annoncée explicitement.",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
]

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function AProposPage() {
  return (
    <>
      <PageHero
        badge="À propos"
        title="Un logiciel pensé pour les salons, pas pour les logiciels"
        subtitle="KalendHair est né d'un constat simple : les gérants de salons de coiffure méritent un outil adapté à leur réalité."
      />

      {/* Pourquoi KalendHair */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="pourquoi-title">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionTitle
              id="pourquoi-title"
              eyebrow="Notre origine"
              title="Pourquoi KalendHair existe"
              align="left"
            />
            <div className="mt-8 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                {"Nous avons rencontré des gérants de salons qui géraient encore leur agenda sur papier, leurs clients dans un carnet et leur caisse dans un tableur. Non par manque de volonté — mais parce que les logiciels disponibles étaient soit trop chers pour une petite structure, soit trop complexes à prendre en main au quotidien."}
              </p>
              <p>
                {"Certains payaient des commissions à des plateformes de réservation sans réelle visibilité sur leurs propres clients. D'autres jonglaient entre trois outils différents pour des tâches qui pourraient n'en nécessiter qu'un seul."}
              </p>
              <p>
                {"KalendHair est né de cette réalité : construire un outil pensé exclusivement pour les salons de coiffure français, avec leurs contraintes, leurs rythmes et leurs attentes."}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Vision */}
      <section className="bg-slate-50 py-20 sm:py-24" aria-labelledby="vision-title">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionTitle
              id="vision-title"
              eyebrow="Notre vision"
              title="Le salon de demain, géré autrement"
              align="left"
            />
            <div className="mt-8 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                {"Nous voulons qu'un gérant de salon puisse se concentrer sur son métier — couper, colorer, conseiller — sans se perdre dans l'administration. Un seul outil, fiable et clair, qui gère l'agenda, les réservations, les clients, la caisse et les stocks."}
              </p>
              <p>
                {"Pas un logiciel généraliste adapté à la va-vite. Un produit construit pour vous, de A à Z, avec les spécificités du métier intégrées dès le départ : les reçus conformes DGFIP, les commissions par prestation, la gestion des congés par employé."}
              </p>
              <p>
                {"KalendHair est hébergé en France et en Union Européenne. Vos données restent dans vos mains, chez vous."}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Engagements */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="engagements-title">
        <Container>
          <SectionTitle
            id="engagements-title"
            eyebrow="Nos engagements"
            title="Ce que nous promettons aux salons pilotes"
            subtitle="Des engagements concrets, pas des formules marketing."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {COMMITMENTS.map((item) => (
              <div
                key={item.id}
                className="flex gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Amélioration continue */}
      <section className="bg-slate-50 py-20 sm:py-24" aria-labelledby="iteration-title">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionTitle
              id="iteration-title"
              eyebrow="Notre méthode"
              title="Nous construisons avec vous, pas pour vous"
              align="left"
            />
            <div className="mt-8 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                {"KalendHair est un produit en évolution permanente. Nous livrons régulièrement de nouvelles fonctionnalités et des améliorations, guidés par les retours des salons pilotes."}
              </p>
              <p>
                {"Si une interface est confuse, si une fonctionnalité manque, si un comportement est inattendu — nous le saurons, et nous le traiterons. Les salons pilotes sont les premiers informés des nouvelles versions."}
              </p>
              <p>
                {"Notre roadmap est publique et évolutive. Consultez-la pour voir ce qui est disponible, ce qui arrive, et ce qui est prévu."}
              </p>
            </div>
            <div className="mt-8 flex gap-4">
              <Button href="/roadmap" variant="secondary" size="md">
                Voir la roadmap
              </Button>
              <Button href="/contact?type=essai" variant="primary" size="md">
                Rejoindre les pilotes
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Rejoignez les premiers salons pilotes"
        subtitle="Accès gratuit complet, accompagnement personnalisé, sans engagement."
        primaryLabel="Rejoindre les salons pilotes"
        primaryHref="/contact?type=essai"
        secondaryLabel="Voir les fonctionnalités"
        secondaryHref="/fonctionnalites"
        theme="dark"
      />
    </>
  )
}
