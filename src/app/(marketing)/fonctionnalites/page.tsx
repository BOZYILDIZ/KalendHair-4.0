import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '../components/ui/page-hero'
import { Container } from '../components/ui/container'
import { CtaBanner } from '../components/ui/cta-banner'
import { ModuleDetail } from '../components/sections/module-detail'
import { Button } from '../components/ui/button'

/* ─── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'Fonctionnalités — Logiciel de gestion salon de coiffure | KalendHair',
  description:
    "Agenda intelligent, réservation en ligne sans commission, CRM clients, caisse conforme DGFIP, gestion des stocks et commissions. Découvrez toutes les fonctionnalités de KalendHair, le logiciel de gestion pour salon de coiffure.",
  openGraph: {
    title: 'Fonctionnalités — Logiciel de gestion salon de coiffure | KalendHair',
    description:
      "Tout ce dont votre salon de coiffure a besoin : agenda, réservation en ligne, CRM, caisse, stocks, KPI. Sans commission, hébergé en Europe.",
    type: 'website',
  },
}

/* ─── Module jump nav ───────────────────────────────────────────────────────── */

const MODULE_NAV = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'reservation', label: 'Réservation' },
  { id: 'crm', label: 'CRM Clients' },
  { id: 'caisse', label: 'Caisse' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'fournisseurs', label: 'Fournisseurs' },
  { id: 'commissions', label: 'Commissions' },
  { id: 'kpi', label: 'KPI Dashboard' },
  { id: 'superadmin', label: 'Super Admin' },
]

function ModuleNav() {
  return (
    <nav
      aria-label="Modules — navigation rapide"
      className="border-b border-slate-200 bg-white"
    >
      <Container>
        <ul className="flex gap-1 overflow-x-auto py-3 sm:flex-wrap sm:gap-2">
          {MODULE_NAV.map(({ id, label }) => (
            <li key={id} className="shrink-0">
              <Link
                href={`#${id}`}
                className="inline-block rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  )
}

/* ─── Module data ───────────────────────────────────────────────────────────── */

const MODULES = [
  {
    id: 'agenda',
    eyebrow: 'Agenda & Planning',
    title: "Gérez le planning de toute votre équipe depuis une seule vue",
    description:
      "Plus de post-its, plus de conflits, plus d'erreurs de double-réservation. L'agenda KalendHair vous donne la vision complète de votre salon en temps réel.",
    points: [
      "Vue semaine multi-employés avec code couleur par collaborateur",
      "Détection automatique des conflits de créneaux",
      "Réservations en ligne synchronisées instantanément",
      "Gestion des congés, jours de fermeture et horaires individuels",
      "Accès depuis n'importe quel appareil, partout",
    ],
    screenshotLabel: "Agenda semaine multi-employés — aperçu produit",
    reverse: false,
    bg: 'white' as const,
  },
  {
    id: 'reservation',
    eyebrow: 'Réservation en ligne',
    title: "Vos clients réservent 24h/24, sans que vous leviez le petit doigt",
    description:
      "KalendHair vous génère une page de réservation publique dédiée à votre salon. Vos clients choisissent leur prestation, leur collaborateur et leur créneau — sans commission.",
    points: [
      "Page de réservation personnalisée à votre nom de salon",
      "Sélection du service, du collaborateur et du créneau en autonomie",
      "Confirmation automatique par e-mail",
      "Zéro commission sur chaque réservation",
      "Compatible mobile, tablette et desktop",
    ],
    screenshotLabel: "Page de réservation publique — aperçu produit",
    reverse: true,
    bg: 'subtle' as const,
  },
  {
    id: 'crm',
    eyebrow: 'Relation client',
    title: "Connaissez chaque client comme votre meilleur fidèle",
    description:
      "Chaque client a sa fiche complète : historique de visites, prestations, montants, préférences et notes internes. Votre équipe est toujours dans le contexte.",
    points: [
      "Fiche client avec historique complet des visites et services",
      "Notes internes visibles uniquement par votre équipe",
      "Conversion automatique des invités en clients fidèles",
      "Recherche rapide par nom, prénom ou numéro de téléphone",
      "Indicateurs de fidélité et valeur client",
    ],
    screenshotLabel: "Fiche client avec historique — aperçu produit",
    reverse: false,
    bg: 'white' as const,
  },
  {
    id: 'caisse',
    eyebrow: 'Paiements & Caisse',
    title: "Encaissez chaque service en quelques secondes, sans paperasse",
    description:
      "Depuis la fiche de rendez-vous, encaissez en espèces, carte ou virement. Chaque reçu est numéroté séquentiellement, conforme DGFIP.",
    points: [
      "Encaissement en un clic depuis la fiche rendez-vous",
      "Multi-méthode : espèces, carte, virement, avoir",
      "Reçus numérotés séquentiellement, conformes DGFIP",
      "Annulations et remboursements avec traçabilité complète",
      "Journal de caisse exportable",
    ],
    screenshotLabel: "Module d'encaissement — aperçu produit",
    reverse: true,
    bg: 'subtle' as const,
  },
  {
    id: 'stocks',
    eyebrow: 'Gestion des stocks',
    title: "Votre inventaire, toujours à jour et sans rupture surprise",
    description:
      "KalendHair traque vos produits en temps réel et vous alerte dès qu'un seuil critique est atteint. Fini les ruptures de stock en plein service.",
    points: [
      "Suivi en temps réel des quantités disponibles par produit",
      "Alertes de rupture de stock paramétrables",
      "Catégorisation des produits par famille",
      "Historique complet des mouvements de chaque produit",
      "Vue d'ensemble du stock avec valeur totale",
    ],
    screenshotLabel: "Hub inventaire avec alertes rupture — aperçu produit",
    reverse: false,
    bg: 'white' as const,
  },
  {
    id: 'fournisseurs',
    eyebrow: 'Fournisseurs',
    title: "Simplifiez vos commandes fournisseurs, du bon à la réception",
    description:
      "Créez des bons de commande, suivez leur état jusqu'à la réception et mettez à jour votre stock automatiquement. Tout est tracé.",
    points: [
      "Carnet de fournisseurs centralisé avec coordonnées",
      "Création de bons de commande en quelques clics",
      "Suivi d'état : en attente, confirmé, reçu",
      "Réception partielle ou totale avec mise à jour du stock",
      "Historique complet des commandes par fournisseur",
    ],
    screenshotLabel: "Gestion des commandes fournisseurs — aperçu produit",
    reverse: true,
    bg: 'subtle' as const,
  },
  {
    id: 'commissions',
    eyebrow: 'Commissions & Rémunérations',
    title: "Calculez automatiquement les commissions de chaque collaborateur",
    description:
      "Définissez vos règles de commission par service ou par employé. KalendHair calcule et consolide automatiquement à chaque paiement validé.",
    points: [
      "Règles de commission paramétrables par employé et par service",
      "Calcul automatique à chaque paiement validé",
      "Vue mensuelle des commissions par collaborateur",
      "Export pour la comptabilité et la paie",
      "Historique détaillé par prestation",
    ],
    screenshotLabel: "Commissions mensuelles par collaborateur — aperçu produit",
    reverse: false,
    bg: 'white' as const,
  },
  {
    id: 'kpi',
    eyebrow: 'Tableau de bord KPI',
    title: "Pilotez votre salon avec des indicateurs qui ont du sens",
    description:
      "Chiffre d'affaires, taux d'occupation, top prestations, fidélité clients — toutes vos métriques essentielles en un coup d'œil.",
    points: [
      "Chiffre d'affaires journalier, hebdomadaire et mensuel",
      "Taux d'occupation de l'agenda par employé",
      "Top 5 des prestations les plus rentables",
      "Indicateurs de fidélisation client",
      "Comparaison période sur période",
    ],
    screenshotLabel: "Dashboard KPI temps réel — aperçu produit",
    reverse: true,
    bg: 'subtle' as const,
  },
  {
    id: 'superadmin',
    eyebrow: 'Super Administration',
    title: "Gérez votre organisation depuis un panneau dédié et sécurisé",
    description:
      "Le panneau Super Admin est réservé à l'équipe KalendHair. Il permet de gérer les organisations, les abonnements et la santé de la plateforme.",
    points: [
      "Vue globale de toutes les organisations actives",
      "Gestion des abonnements et des plans",
      "Métriques d'utilisation en temps réel",
      "Outils de support et de débogage",
      "Accès sécurisé par rôle SUPER_ADMIN uniquement",
    ],
    screenshotLabel: "Panneau Super Admin — aperçu produit",
    reverse: false,
    bg: 'white' as const,
  },
]

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function FonctionnalitesPage() {
  return (
    <>
      <PageHero
        badge="Fonctionnalités"
        title="Tout ce dont votre salon a besoin, dans une seule application"
        subtitle="Agenda, réservation en ligne sans commission, CRM clients, caisse, stocks, commissions et KPI — conçus pour les salons de coiffure."
        actions={
          <>
            <Button href="/contact?type=essai" variant="white" size="lg">
              Essayer gratuitement
            </Button>
            <Button href="/demo" variant="outline-white" size="lg">
              Voir la démo →
            </Button>
          </>
        }
      />

      <ModuleNav />

      {MODULES.map((module) => (
        <ModuleDetail
          key={module.id}
          id={module.id}
          eyebrow={module.eyebrow}
          title={module.title}
          description={module.description}
          points={module.points}
          screenshotLabel={module.screenshotLabel}
          reverse={module.reverse}
          bg={module.bg}
        />
      ))}

      <CtaBanner
        title="Prêt à transformer la gestion de votre salon ?"
        subtitle="Rejoignez les premiers salons pilotes. Accès gratuit complet, accompagnement personnalisé."
        primaryLabel="Rejoindre les salons pilotes"
        primaryHref="/contact?type=essai"
        secondaryLabel="Voir les tarifs"
        secondaryHref="/tarifs"
        theme="dark"
      />
    </>
  )
}
