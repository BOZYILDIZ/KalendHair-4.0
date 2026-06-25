import type { Metadata } from 'next'
import { PageHero } from '../components/ui/page-hero'
import { Container } from '../components/ui/container'
import { SectionTitle } from '../components/ui/section-title'
import { CtaBanner } from '../components/ui/cta-banner'
import { FaqAccordion } from '../components/ui/faq-accordion'
import { Button } from '../components/ui/button'
import type { FaqItem } from '../components/ui/faq-accordion'

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Aide & Support — Logiciel salon de coiffure | KalendHair",
  description:
    "Trouvez les réponses à vos questions sur KalendHair : réservation en ligne, gestion de compte salon, paiements, stocks et abonnements. Aide logiciel salon de coiffure.",
  openGraph: {
    title: "Aide & Support — KalendHair",
    description:
      "FAQ complète sur KalendHair : réservation, CRM, caisse, stocks, fournisseurs, abonnements. Aide pour votre logiciel de gestion salon.",
    type: 'website',
  },
}

/* ─── FAQ data ──────────────────────────────────────────────────────────────── */

const FAQ_GENERAL: FaqItem[] = [
  {
    question: "Qu'est-ce que KalendHair ?",
    answer:
      "KalendHair est un logiciel de gestion tout-en-un pour salons de coiffure. Il regroupe l'agenda, la réservation en ligne, la gestion clients, la caisse, les stocks et les KPI dans une seule application web, accessible depuis n'importe quel appareil.",
  },
  {
    question: "KalendHair est-il disponible dès maintenant ?",
    answer:
      "Oui. KalendHair est accessible dans le cadre d'un accès pilote entièrement gratuit. Remplissez le formulaire de contact pour rejoindre les premiers salons pilotes et bénéficier d'un accompagnement personnalisé.",
  },
  {
    question: "Qui peut utiliser KalendHair ?",
    answer:
      "KalendHair est conçu pour les salons de coiffure indépendants, les gérants d'une ou plusieurs structures, et les petites équipes. La version actuelle est disponible en France.",
  },
]

const FAQ_RESERVATION: FaqItem[] = [
  {
    question: "Comment activer la réservation en ligne pour mon salon ?",
    answer:
      "Depuis votre dashboard KalendHair, configurez vos services, vos employés et leurs horaires. Une page de réservation publique est automatiquement générée avec le lien de votre salon.",
  },
  {
    question: "Mes clients peuvent-ils payer en ligne lors de la réservation ?",
    answer:
      "La réservation en ligne ne nécessite aucun paiement de la part de vos clients. Le règlement s'effectue en salon, via le module de caisse de KalendHair. Le paiement en ligne sera disponible dans une prochaine version.",
  },
  {
    question: "KalendHair prend-il une commission sur les réservations ?",
    answer:
      "Non. KalendHair ne prend aucune commission sur vos réservations. Vous payez uniquement votre abonnement mensuel, quel que soit le nombre de réservations.",
  },
]

const FAQ_COMPTE: FaqItem[] = [
  {
    question: "Comment créer mon salon sur KalendHair ?",
    answer:
      "Remplissez le formulaire de contact pour rejoindre l'accès pilote. Notre équipe vous accompagne à l'onboarding et configure votre salon avec vous lors d'un premier échange.",
  },
  {
    question: "Combien d'employés puis-je ajouter ?",
    answer:
      "Cela dépend de votre plan. Le plan Essential permet d'ajouter jusqu'à 5 employés. Les plans Pro et Business ne sont pas limités en nombre d'employés.",
  },
  {
    question: "Puis-je gérer plusieurs salons depuis le même compte ?",
    answer:
      "La gestion multi-salons avec tableau de bord consolidé est disponible avec le plan Business. En phase pilote, contactez-nous pour en discuter.",
  },
]

const FAQ_PAIEMENTS: FaqItem[] = [
  {
    question: "Les reçus de KalendHair sont-ils conformes à la loi française ?",
    answer:
      "Oui. Chaque reçu est numéroté séquentiellement et répond aux exigences de la DGFIP pour les logiciels de caisse. L'horodatage et l'historique complet des transactions sont assurés.",
  },
  {
    question: "Quels modes de paiement puis-je enregistrer ?",
    answer:
      "Vous pouvez enregistrer les paiements en espèces, par carte bancaire et par virement bancaire. L'intégration Stripe pour le paiement en ligne n'est pas encore disponible.",
  },
  {
    question: "Puis-je annuler ou modifier un paiement déjà enregistré ?",
    answer:
      "Oui. Chaque transaction peut être annulée depuis l'historique des paiements. L'opération est tracée et horodatée pour garder une piste d'audit complète.",
  },
]

const FAQ_STOCKS: FaqItem[] = [
  {
    question: "Comment gérer mon stock de produits dans KalendHair ?",
    answer:
      "Le module Stock vous permet de référencer vos produits, suivre les quantités disponibles et configurer des alertes de rupture. Chaque entrée et sortie de stock est historisée avec horodatage.",
  },
  {
    question: "Puis-je créer des commandes fournisseurs ?",
    answer:
      "Oui. Depuis le module Fournisseurs, créez des bons de commande, suivez leur état (en attente, confirmé, reçu) et enregistrez la réception pour mettre à jour votre stock automatiquement.",
  },
]

const FAQ_ABONNEMENTS: FaqItem[] = [
  {
    question: "Quand les abonnements payants seront-ils activés ?",
    answer:
      "Le système de facturation sera activé après la phase pilote. Les salons pilotes bénéficient d'un accès complet entièrement gratuit pendant toute cette période. La bascule sera annoncée explicitement et avec un préavis.",
  },
  {
    question: "Y a-t-il une période d'essai ?",
    answer:
      "L'accès pilote est gratuit et sans limite de durée pendant la phase de lancement. Aucune carte bancaire n'est requise pour commencer.",
  },
  {
    question: "Comment résilier mon compte ?",
    answer:
      "Contactez-nous par e-mail ou via le formulaire de contact. Aucun préavis n'est requis et nous procédons à la suppression de vos données sur demande.",
  },
]

/* ─── FAQ section block ─────────────────────────────────────────────────────── */

const FAQ_SECTIONS = [
  { id: 'general', title: 'Général', items: FAQ_GENERAL },
  { id: 'reservation', title: 'Réservation en ligne', items: FAQ_RESERVATION },
  { id: 'compte', title: 'Compte salon', items: FAQ_COMPTE },
  { id: 'paiements', title: 'Paiements & Caisse', items: FAQ_PAIEMENTS },
  { id: 'stocks', title: 'Stocks & Fournisseurs', items: FAQ_STOCKS },
  { id: 'abonnements', title: 'Abonnements', items: FAQ_ABONNEMENTS },
]

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function AidePage() {
  return (
    <>
      <PageHero
        badge="Aide & Support"
        title="Comment pouvons-nous vous aider ?"
        subtitle="Retrouvez les réponses aux questions les plus fréquentes sur KalendHair."
      />

      {/* FAQ content */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="faq-main-title">
        <Container>
          <SectionTitle
            id="faq-main-title"
            eyebrow="Questions fréquentes"
            title="Tout ce que vous devez savoir"
            subtitle="Première version de notre base d'aide — enrichie en continu avec vos retours."
          />

          <div className="mx-auto mt-14 max-w-3xl space-y-10">
            {FAQ_SECTIONS.map((section) => (
              <FaqAccordion
                key={section.id}
                id={`faq-${section.id}`}
                title={section.title}
                items={section.items}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Support CTA */}
      <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="support-cta-title">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="support-cta-title"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              {"Vous ne trouvez pas votre réponse ?"}
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              {"Contactez-nous directement. En tant que salon pilote, vous bénéficiez d'une réponse sous 24 heures ouvrées."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact?type=support" variant="primary" size="lg">
                Contacter le support
              </Button>
              <Button href="/fonctionnalites" variant="secondary" size="lg">
                Voir les fonctionnalités
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Pas encore sur KalendHair ?"
        subtitle="Rejoignez les premiers salons pilotes. Accès gratuit, accompagnement inclus."
        primaryLabel="Essayer gratuitement"
        primaryHref="/contact?type=essai"
        secondaryLabel="Voir les tarifs"
        secondaryHref="/tarifs"
        theme="dark"
      />
    </>
  )
}
