import type { Metadata } from 'next'
import { PageHero } from '../components/ui/page-hero'
import { Container } from '../components/ui/container'
import { SectionTitle } from '../components/ui/section-title'
import { CtaBanner } from '../components/ui/cta-banner'
import { FaqAccordion } from '../components/ui/faq-accordion'
import { PricingSection } from '../components/sections/pricing-section'
import { Button } from '../components/ui/button'
import type { FaqItem } from '../components/ui/faq-accordion'

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Tarifs — Logiciel salon de coiffure prix | KalendHair",
  description:
    "Découvrez les tarifs de KalendHair : Essential 29€/mois, Pro 59€/mois, Business 99€/mois. Logiciel de gestion salon de coiffure sans commission, hébergé en Europe. Essai gratuit.",
  openGraph: {
    title: "Tarifs — Tarif logiciel salon de coiffure | KalendHair",
    description:
      "Essential 29€, Pro 59€, Business 99€. Accès pilote gratuit pendant la phase de lancement. Sans engagement, sans commission.",
    type: 'website',
  },
}

/* ─── FAQ data ──────────────────────────────────────────────────────────────── */

const FAQ: FaqItem[] = [
  {
    question: "Les abonnements sont-ils actifs dès maintenant ?",
    answer:
      "Pendant la phase pilote, l'accès à KalendHair est entièrement gratuit. Le système de facturation sera activé après la phase de lancement. Aucune carte bancaire n'est requise pour commencer.",
  },
  {
    question: "Quelle est la différence entre mensuel et annuel ?",
    answer:
      "La facturation annuelle donne accès au même produit que la facturation mensuelle, avec 17% de réduction. Vous payez l'année en une seule fois.",
  },
  {
    question: "Y a-t-il un engagement minimum ?",
    answer:
      "Non. En facturation mensuelle, vous pouvez résilier à tout moment. En facturation annuelle, la période souscrite est non remboursable.",
  },
  {
    question: "Puis-je changer de plan après l'inscription ?",
    answer:
      "Oui. Vous pouvez passer à un plan supérieur à tout moment. La rétrogradation vers un plan inférieur prend effet à la prochaine échéance.",
  },
  {
    question: "Le paiement en ligne par carte est-il disponible ?",
    answer:
      "L'intégration Stripe n'est pas encore active. Pendant la phase pilote, l'accès est gratuit. La facturation automatique sera annoncée avant son activation.",
  },
]

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function TarifsPage() {
  return (
    <>
      <PageHero
        badge="Tarifs"
        title="Des tarifs clairs, sans mauvaise surprise"
        subtitle="Sans commission sur vos réservations. Sans engagement. Hébergé en Europe."
        actions={
          <Button href="/contact?type=essai" variant="white" size="lg">
            Rejoindre les salons pilotes
          </Button>
        }
      />

      {/* Stripe notice */}
      <div className="border-b border-amber-200 bg-amber-50 py-3">
        <Container>
          <p className="text-center text-sm text-amber-800">
            <strong className="font-semibold">Phase pilote en cours</strong>
            {" — L'accès à KalendHair est entièrement gratuit. Le système de paiement sera activé prochainement."}
          </p>
        </Container>
      </div>

      {/* Pricing section */}
      <section className="bg-slate-950 py-20 sm:py-24" aria-labelledby="pricing-title">
        <Container>
          <SectionTitle
            id="pricing-title"
            eyebrow="Plans & Tarifs"
            title="Choisissez votre formule"
            subtitle="Tous les plans incluent un accès complet pendant la phase pilote."
            dark
          />
          <div className="mt-12">
            <PricingSection />
          </div>
          <p className="mt-10 text-center text-sm text-slate-500">
            Tous les plans incluent la réservation en ligne sans commission et les mises à jour gratuites.
          </p>
        </Container>
      </section>

      {/* Feature comparison teaser */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="compare-title">
        <Container>
          <SectionTitle
            id="compare-title"
            eyebrow="Ce qui est inclus"
            title="Tous les plans, au même niveau de qualité"
            subtitle="Chaque plan donne accès à la même infrastructure fiable, hébergée en Europe."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
            {[
              {
                label: 'Hébergement Europe',
                description: 'Données hébergées en France et en Union Européenne.',
              },
              {
                label: 'Mises à jour incluses',
                description: 'Toutes les nouvelles fonctionnalités sont incluses sans surcoût.',
              },
              {
                label: 'Zéro commission',
                description: "Aucune commission sur vos réservations, quels que soient le volume.",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="faq-tarifs-title">
        <Container>
          <SectionTitle
            id="faq-tarifs-title"
            eyebrow="Questions fréquentes"
            title="Tout ce que vous devez savoir sur les tarifs"
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <FaqAccordion items={FAQ} />
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
