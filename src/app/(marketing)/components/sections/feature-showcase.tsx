import { FeatureBlock } from '../ui/feature-block'
import type { FeatureBlockProps } from '../ui/feature-block'

const FEATURES: (FeatureBlockProps & { id: string })[] = [
  {
    id: 'agenda',
    eyebrow: 'Agenda',
    title: "L'agenda de votre équipe, en un coup d'œil",
    description:
      "Plus besoin de jongler entre post-its et agendas papier. KalendHair vous donne la vision complète de votre salon en temps réel, pour chaque employé.",
    points: [
      'Vue semaine multi-employés avec code couleur par employé',
      'Détection automatique des conflits de créneaux',
      "Réservations en ligne synchronisées à l'instant",
      'Horaires individuels, jours de fermeture et congés intégrés',
    ],
    screenshotLabel: 'Agenda semaine multi-employés — capture à venir',
    reverse: false,
    bg: 'white',
  },
  {
    id: 'crm',
    eyebrow: 'Relation client',
    title: 'Connaissez chaque client comme votre meilleur client',
    description:
      "Chaque client a son historique complet. Retrouvez en quelques secondes ce qu'il a pris la dernière fois, ses préférences et vos notes internes.",
    points: [
      'Fiche client avec historique complet des visites et services',
      'Notes internes visibles uniquement par votre équipe',
      "Conversion automatique de l'invité en client fidèle",
      'Recherche rapide par nom, prénom ou téléphone',
    ],
    screenshotLabel: 'Fiche client avec historique — capture à venir',
    reverse: true,
    bg: 'subtle',
  },
  {
    id: 'caisse',
    eyebrow: 'Paiements',
    title: 'Encaissez et tracez chaque paiement, sans paperasse',
    description:
      'Chaque rendez-vous terminé se transforme en paiement en un clic. Espèces, carte ou virement — les reçus conformes DGFIP se génèrent automatiquement.',
    points: [
      'Encaissement multi-méthode depuis la fiche rendez-vous',
      'Reçus numérotés séquentiellement, conformes DGFIP',
      'Annulation et historique complet des transactions',
      'Commissions des employés calculées automatiquement à chaque paiement',
    ],
    screenshotLabel: 'Encaissement rendez-vous — capture à venir',
    reverse: false,
    bg: 'white',
  },
  {
    id: 'stocks',
    eyebrow: 'Stocks',
    title: "Votre inventaire, toujours à jour, sans effort",
    description:
      "Fini les ruptures de stock surprises en plein service. KalendHair alerte dès qu'un produit atteint le seuil critique et simplifie la commande fournisseur.",
    points: [
      'Suivi en temps réel des quantités disponibles par produit',
      'Alertes de rupture de stock paramétrables par seuil',
      "Bons de commande fournisseurs intégrés avec suivi d'état",
      'Historique complet des mouvements de chaque produit',
    ],
    screenshotLabel: 'Hub inventaire avec alertes rupture — capture à venir',
    reverse: true,
    bg: 'subtle',
  },
]

export function FeatureShowcase() {
  return (
    <>
      {FEATURES.map((feature) => (
        <FeatureBlock
          key={feature.id}
          eyebrow={feature.eyebrow}
          title={feature.title}
          description={feature.description}
          points={feature.points}
          screenshotLabel={feature.screenshotLabel}
          reverse={feature.reverse}
          bg={feature.bg}
        />
      ))}
    </>
  )
}
