# MARKETING_WEBSITE_V1 — Architecture de la vitrine SaaS KalendHair

> Document de conception — Phase Product 1 — Marketing Website v1.
> Aucune implémentation dans cette PR. Ce document est la spec à valider par ChatGPT avant tout développement.
> Version initiale — 2026-06-25.

---

## Table des matières

1. [Positionnement & cible](#1-positionnement--cible)
2. [Architecture des pages (sitemap)](#2-architecture-des-pages-sitemap)
3. [Arborescence technique](#3-arborescence-technique)
4. [Spécifications par page](#4-spécifications-par-page)
   - [4.1 Accueil `/`](#41-accueil-)
   - [4.2 Fonctionnalités `/fonctionnalites`](#42-fonctionnalités-fonctionnalites)
   - [4.3 Tarifs `/tarifs`](#43-tarifs-tarifs)
   - [4.4 Contact `/contact`](#44-contact-contact)
   - [4.5 Pages légales](#45-pages-légales)
5. [Navigation & Footer](#5-navigation--footer)
6. [Parcours utilisateur & stratégie de conversion](#6-parcours-utilisateur--stratégie-de-conversion)
7. [Stratégie SEO](#7-stratégie-seo)
8. [Stratégie des captures produit](#8-stratégie-des-captures-produit)
9. [Hiérarchie visuelle & design system](#9-hiérarchie-visuelle--design-system)
10. [Architecture technique](#10-architecture-technique)
11. [Composants à créer](#11-composants-à-créer)
12. [Contraintes & décisions de périmètre](#12-contraintes--décisions-de-périmètre)
13. [Priorités d'implémentation](#13-priorités-dimplémentation)

---

## 1. Positionnement & cible

### Produit

KalendHair est un **SaaS de gestion tout-en-un pour salons de coiffure et instituts de beauté**, hébergé en France, conçu pour les gérants indépendants.

Il regroupe en une seule plateforme :
- Prise de rendez-vous & agenda visuel
- Réservation publique (page de réservation en ligne)
- CRM clients
- Caisse & paiements (reçus DGFIP)
- Gestion des stocks & produits
- Fournisseurs & bons de commande
- Commissions des employés
- Dashboard KPI
- Abonnements SaaS

### Cible principale

| Profil | Détail |
|---|---|
| Rôle | Gérant(e) d'un salon de coiffure ou d'un institut de beauté |
| Structure | Indépendant(e) ou petite équipe (1 à 10 employés) |
| Marché | France (priorité) — potentiellement Belgique, Suisse |
| Maturité digitale | Varie : certains encore sur papier/téléphone, d'autres déjà sur Planity ou Google Calendar |
| Problème principal | Jongler entre 3–4 outils (agenda, caisse, stock, comptabilité) ou payer trop cher pour un logiciel trop complexe |
| Motivation d'achat | Gagner du temps, avoir une vue complète, proposer la réservation en ligne, professionnaliser la gestion |

### Cible secondaire

- Gérant(e) cherchant à quitter Planity / Fresha / Mindbody (coût, manque de contrôle)
- Jeune coiffeur ouvrant son premier salon
- Manager / directeur d'une chaîne de 2–3 salons (plan PRO/BUSINESS)

### Positionnement différenciateur

> **"Tout ce dont votre salon a besoin. Une seule plateforme. Un seul prix."**

KalendHair se positionne contre :
- **La fragmentation** : fin des 4 outils séparés
- **La complexité** : interface conçue pour les coiffeurs, pas les développeurs
- **Le coût caché** : prix transparent, sans commission sur les réservations
- **La dépendance** : vos données vous appartiennent, hébergées en Europe

---

## 2. Architecture des pages (sitemap)

```
kalendhair.fr/
├── /                          → Accueil (landing page principale)
├── /fonctionnalites           → Fonctionnalités détaillées par module
├── /tarifs                    → Plans & tarifs avec comparatif
├── /contact                   → Contact / Demande de démo
├── /mentions-legales          → Mentions légales
├── /politique-confidentialite → Politique de confidentialité
└── /cgv                       → Conditions générales de vente
```

**Périmètre v1 :** Les 4 premières pages plus les légales.

**Hors périmètre v1 (v2+) :**
- `/blog` — Articles SEO, conseils gestion salon
- `/a-propos` — Histoire, équipe, vision
- `/partenaires` — Intégrations & partenaires
- `/[slug]-demo` — Landing page personnalisée par salon pilote
- `/changelog` — Journal des évolutions produit

---

## 3. Arborescence technique

```
src/app/
├── (marketing)/               ← Nouveau route group (n'affecte pas les URLs)
│   ├── layout.tsx             ← Layout marketing : MarketingNav + MarketingFooter
│   ├── page.tsx               ← Accueil / (remplace l'actuel placeholder)
│   ├── fonctionnalites/
│   │   └── page.tsx
│   ├── tarifs/
│   │   └── page.tsx
│   ├── contact/
│   │   ├── page.tsx
│   │   └── actions.ts         ← Server Action (log demande en DB ou email)
│   ├── mentions-legales/
│   │   └── page.tsx
│   ├── politique-confidentialite/
│   │   └── page.tsx
│   └── cgv/
│       └── page.tsx
│
├── (marketing)/components/    ← Composants marketing uniquement
│   ├── marketing-nav.tsx
│   ├── marketing-footer.tsx
│   ├── hero-section.tsx
│   ├── feature-block.tsx      ← Section feature avec screenshot
│   ├── pricing-card.tsx
│   ├── pricing-toggle.tsx     ← "use client" — bascule mensuel/annuel
│   ├── faq-accordion.tsx      ← "use client" — accordion FAQ
│   ├── stats-strip.tsx
│   ├── testimonial-card.tsx
│   └── cta-banner.tsx
│
└── page.tsx                   ← À supprimer / déplacer vers (marketing)
```

**Note :** L'actuel `src/app/page.tsx` sera remplacé par `src/app/(marketing)/page.tsx`. Le route group `(marketing)` est transparent pour les URLs — `/` reste `/`.

---

## 4. Spécifications par page

---

### 4.1 Accueil `/`

**Objectif :** Convaincre un gérant de salon en moins de 90 secondes que KalendHair est fait pour lui.

**Meta SEO :**
- `title`: "KalendHair — Logiciel de gestion pour salons de coiffure | Rendez-vous, caisse, stocks"
- `description`: "Gérez votre salon de coiffure avec une seule plateforme : agenda, réservation en ligne, caisse, stocks et clients. Essayez KalendHair gratuitement."
- `og:image`: Hero screenshot du dashboard

---

#### Section 1 — Hero

**Layout :** Fond sombre (gradient slate-950 → indigo-950), texte blanc, screenshot produit à droite (sur desktop) ou en dessous (mobile).

**Headline :** (1 ligne, 8 mots max)
> "Votre salon, géré depuis une seule application."

**Sous-headline :** (2 lignes, 20 mots max)
> "Rendez-vous, caisse, stocks, clients. KalendHair remplace tous vos outils par une plateforme conçue pour les coiffeurs."

**CTA primaire :** `Démarrer gratuitement` → `/contact` (en attendant `/register`)
**CTA secondaire :** `Voir le produit` → scroll vers #apercu ou `/fonctionnalites`

**Capture produit :** Dashboard KPI ou Agenda visuel (à intégrer en v1 dev)
**Placeholder v1 :** Mockup stylisé ou screenshot flou avec overlay "Dashboard KalendHair"

**Éléments de confiance :** (sous les CTA)
- "✓ Sans commission sur les réservations"
- "✓ Hébergé en Europe"
- "✓ Sans engagement"

---

#### Section 2 — Bande de confiance (trust strip)

**Layout :** Fond blanc, 1 ligne, centré.

**Contenu :**
> "Utilisé par les salons pilotes dès 2026 — Rejoignez les premiers."

**Indicateurs chiffrés** (à affiner avec les vraies données pilote) :
- `14` modules intégrés
- `3` plans adaptés à votre salon
- `0 €` de commission sur les réservations

**Note :** Ces chiffres sont factuels et ne nécessitent pas de fake social proof. À remplacer dès que de vraies statistiques pilotes sont disponibles.

---

#### Section 3 — Vue d'ensemble des modules

**Titre :** "Tout ce dont votre salon a besoin"
**Sous-titre :** "Une plateforme. Pas 5 abonnements."

**Layout :** Grille 3×3 (desktop) / 2×4 (tablet) / 1×N (mobile)

**9 modules avec icône + titre + description courte (1 ligne) :**

| Icône | Module | Description |
|---|---|---|
| 📅 | Rendez-vous | Créez, modifiez, annulez en quelques secondes. |
| 🗓️ | Agenda visuel | Vue jour et semaine par employé, en temps réel. |
| 🌐 | Réservation publique | Votre page de réservation, partageable sur Instagram. |
| 👥 | Clients & CRM | Historique complet, notes internes, fidélisation. |
| 💳 | Caisse & Paiements | Encaissement, reçus numérotés conformes DGFIP. |
| 📦 | Stocks & Produits | Suivi des quantités, alertes rupture, mouvements. |
| 🏭 | Fournisseurs | Bons de commande, réceptions, prix de revient. |
| 💰 | Commissions | Règles automatiques par employé, service ou produit. |
| 📊 | KPI & Dashboard | Chiffre d'affaires, taux de remplissage, top services. |

---

#### Section 4 — Feature showcase 1 : Agenda & Rendez-vous

**Titre :** "L'agenda de votre salon, enfin clair"
**Corps :** (3 bullet points)
- "Vue semaine multi-employés avec détection des conflits"
- "Créneaux disponibles calculés en temps réel"
- "Historique complet de chaque modification"

**Visuel :** Screenshot de l'agenda visuel `/dashboard/agenda` (à intégrer)
**Layout :** Texte gauche, screenshot droite (alterné sur la section suivante)
**CTA inline :** `Voir toutes les fonctionnalités →`

---

#### Section 5 — Feature showcase 2 : Réservation publique

**Titre :** "Votre salon ouvert 24h/24 en ligne"
**Corps :**
- "Une page de réservation à votre image, partageable partout"
- "Le client choisit le service, l'employé, le créneau"
- "Confirmation automatique dès la réservation"

**Visuel :** Screenshot de `/book/[slug]` (à intégrer)
**Layout :** Screenshot gauche, texte droite

---

#### Section 6 — Feature showcase 3 : Caisse & Paiements

**Titre :** "Encaissez en un clic, conformément à la loi"
**Corps :**
- "Reçus numérotés séquentiellement, conformes aux obligations DGFIP"
- "Paiement en espèces, carte, virement ou autre"
- "Annulation et historique complet de chaque transaction"

**Visuel :** Screenshot de `/dashboard/payments` ou reçu imprimable
**Layout :** Texte gauche, screenshot droite

---

#### Section 7 — Feature showcase 4 : KPI & Pilotage

**Titre :** "Pilotez votre salon avec les bonnes données"
**Corps :**
- "Chiffre d'affaires réel, taux de remplissage, top services"
- "Filtres par période : aujourd'hui, semaine, mois"
- "Commissions des employés calculées automatiquement"

**Visuel :** Screenshot de `/dashboard/kpi`
**Layout :** Screenshot gauche, texte droite

---

#### Section 8 — Teaser tarifs

**Titre :** "Des tarifs transparents, adaptés à votre salon"
**Layout :** 3 cartes plan (simplifié — juste nom + prix + CTA), lien vers `/tarifs`

| Plan | Prix | Pour qui |
|---|---|---|
| ESSENTIAL | 29 €/mois | Solo ou duo |
| PRO | 59 €/mois | Équipe jusqu'à 10 |
| BUSINESS | 99 €/mois | Multi-salons |

**CTA :** `Voir tous les tarifs →` → `/tarifs`

---

#### Section 9 — Témoignages / Pilote (placeholders)

**Titre :** "Ce que disent les salons pilotes"
**Note dev :** En v1, afficher 1–2 placeholders avec des citations génériques non fausses, ou simplement ne pas afficher cette section et la mettre en commentaire `{/* TODO: ajouter témoignages pilotes */}`.

**Format de chaque témoignage :**
- Citation (max 120 caractères)
- Prénom + nom du gérant
- Nom du salon + ville
- Avatar (initiales si pas de photo)

---

#### Section 10 — CTA final

**Titre :** "Prêt à mieux gérer votre salon ?"
**Sous-titre :** "Rejoignez les premiers salons qui font confiance à KalendHair."
**CTA primaire :** `Demander un accès →` → `/contact`
**CTA secondaire :** `Voir les tarifs →` → `/tarifs`
**Fond :** Gradient indigo sombre (cohérent avec le hero)

---

### 4.2 Fonctionnalités `/fonctionnalites`

**Objectif :** Convaincre le visiteur déjà intéressé que chaque module correspond à son besoin réel. Page de référence pour les comparaisons avec les concurrents.

**Meta SEO :**
- `title`: "Fonctionnalités KalendHair — Agenda, Caisse, Stocks, CRM pour salons de coiffure"
- `description`: "Découvrez les 14 modules de KalendHair : agenda visuel, réservation publique, caisse DGFIP, gestion stocks, CRM, commissions, KPI et bien plus."

---

**Structure de la page :**

**Hero (léger) :**
- Titre : "Toutes les fonctionnalités de KalendHair"
- Sous-titre : "Conçu pour les coiffeurs. Construit pour durer."
- Barre de navigation rapide : ancres vers chaque module

---

**Par module (10 sections, une par module) :**

Chaque section suit ce patron :

```
[Badge catégorie]  ex. "Gestion des temps"
[Titre]            ex. "Agenda visuel jour & semaine"
[Sous-titre]       ex. "Votre équipe, en un coup d'œil"
[Corps]            3–5 bullet points détaillés
[Capture]          Screenshot produit (placeholder si non disponible)
[Lien CTA]         "Essayer cette fonctionnalité →"
```

**Ordre des sections :**

1. **Rendez-vous** — Création, modification, historique, statuts (PENDING → CONFIRMED → COMPLETED)
2. **Agenda visuel** — Vue jour/semaine, multi-employés, indicateur temps réel, zones hors-horaires
3. **Réservation publique** — Page `/book/[slug]`, wizard en 4 étapes, sans commission
4. **Clients & CRM** — Fiche client, historique, notes internes, conversion invité → client
5. **Caisse & Paiements** — Encaissement multi-méthode, reçus DGFIP, annulation
6. **Gestion des stocks** — Produits, catégories, entrées/sorties, alertes rupture
7. **Fournisseurs & Commandes** — Machine à états (DRAFT → RECEIVED), réceptions partielles
8. **Commissions** — Règles par employé/service/produit, calcul automatique, ajustements
9. **Dashboard KPI** — CA, RDV, taux remplissage, top services, top employés
10. **Abonnements & Facturation** — Plans, quotas, changement de cycle, sans Stripe en v1

---

**Section finale :** Comparatif module vs concurrents (tableau simplifié)

| Fonctionnalité | KalendHair | Planity | Fresha |
|---|---|---|---|
| Agenda visuel multi-employés | ✅ | ✅ | ✅ |
| Réservation publique sans commission | ✅ | ❌ (commission) | ❌ (commission) |
| Caisse avec reçus DGFIP | ✅ | Partiel | ❌ |
| Gestion des stocks | ✅ | ❌ | Partiel |
| Commissions automatiques | ✅ | ❌ | ❌ |
| Hébergé en Europe | ✅ | ✅ | ❌ |
| Données exportables | ✅ (v2) | Partiel | Partiel |
| Prix transparent (pas de commission) | ✅ | ❌ | ❌ |

> **Note :** Ce tableau sera validé avec des sources avant publication.

---

### 4.3 Tarifs `/tarifs`

**Objectif :** Permettre au visiteur de choisir son plan en moins de 2 minutes, sans friction.

**Meta SEO :**
- `title`: "Tarifs KalendHair — Plans ESSENTIAL, PRO et BUSINESS pour salons"
- `description`: "Découvrez les tarifs de KalendHair : à partir de 29€/mois. Sans engagement, sans commission, hébergé en Europe."

---

**Structure de la page :**

**Hero tarifs :**
- Titre : "Des tarifs clairs pour chaque salon"
- Sous-titre : "Sans engagement. Sans commission. Sans mauvaise surprise."
- Toggle mensuel / annuel (économie annuelle affichée : "Économisez 2 mois")

---

**3 cartes plan :**

Données issues directement de `billing.service.ts` :

| | ESSENTIAL | PRO | BUSINESS |
|---|---|---|---|
| Prix mensuel | 29 €/mois | 59 €/mois | 99 €/mois |
| Prix annuel | 290 €/an | 590 €/an | 990 €/an |
| Salons | 1 salon | 3 salons | Illimités |
| Employés | 2 employés | 10 employés | Illimités |
| Rendez-vous | Illimités | Illimités | Illimités |
| Clients | Illimités | Illimités | Illimités |
| Réservation publique | ✅ | ✅ | ✅ |
| Caisse & Paiements | ❌ | ✅ | ✅ |
| Stocks & Produits | ❌ | ✅ | ✅ |
| Fournisseurs | ❌ | ✅ | ✅ |
| KPI & Dashboard | ❌ | ✅ | ✅ |
| Commissions | ✅ | ✅ | ✅ |
| Support | Email | Email prioritaire | Dédié |

**Marquage :** Le plan PRO est marqué "Populaire" avec un badge.

**CTA par plan :**
- ESSENTIAL : `Commencer avec ESSENTIAL →`
- PRO : `Choisir PRO →`
- BUSINESS : `Contacter l'équipe →`

→ Tous les CTA pointent vers `/contact` en v1 (pas de self-service encore).

---

**Section : Comparatif complet (tableau)**

Tableau exhaustif reprenant toutes les fonctionnalités, groupées par catégorie :
- Gestion du salon
- Rendez-vous & Agenda
- Réservation publique
- Clients & CRM
- Caisse & Paiements
- Stocks & Inventaire
- Fournisseurs
- Commissions
- KPI & Rapports
- Support & Sécurité

---

**Section : FAQ tarifs (10 questions)**

1. Y a-t-il un engagement de durée ?
   > Non. Vous pouvez annuler ou changer de plan à tout moment.

2. Puis-je commencer gratuitement ?
   > Oui. Pendant le pilote fermé, un accès gratuit est proposé aux premiers salons sélectionnés. Contactez-nous.

3. Y a-t-il des commissions sur les réservations ?
   > Non. Jamais. Vous payez uniquement votre abonnement mensuel ou annuel.

4. Puis-je changer de plan ?
   > Oui, depuis votre espace professionnel → Mon abonnement.

5. Comment fonctionne la facturation annuelle ?
   > Vous payez l'équivalent de 10 mois pour 12 mois d'accès.

6. Mes données sont-elles hébergées en Europe ?
   > Oui. KalendHair est hébergé sur Neon (Frankfurt, Allemagne) et Vercel (Europe).

7. Puis-je exporter mes données ?
   > L'export des données est disponible sur demande (v2 pour l'export automatique).

8. Que se passe-t-il si j'ai plus d'employés que mon plan ?
   > Un message vous informe lors de la création. Vous devez changer de plan.

9. Le plan ESSENTIAL est-il adapté à un salon solo ?
   > Oui. Il inclut tous les modules de base : agenda, rendez-vous, réservation publique, clients, commissions.

10. Y a-t-il un support technique ?
    > Oui. Support par email inclus dans tous les plans. Support prioritaire à partir du plan PRO.

---

**Section : Garanties**

3 blocs :
- "🛡️ Données sécurisées" — Hébergé en Europe, chiffrement en transit
- "🔄 Sans engagement" — Résiliez à tout moment
- "🚫 Sans commission" — Vos réservations, vos revenus

---

**CTA final tarifs :**
- Titre : "Vous avez encore des questions ?"
- Bouton : `Nous contacter →` → `/contact`

---

### 4.4 Contact `/contact`

**Objectif :** Collecter les demandes d'accès, de démo ou de questions. CTA principal de conversion en l'absence de self-service `/register`.

**Meta SEO :**
- `title`: "Contact KalendHair — Demandez un accès ou une démo"
- `description`: "Contactez l'équipe KalendHair pour une demande d'accès, une démo ou toute question. Réponse sous 24h."

---

**Layout :** Deux colonnes (desktop) — formulaire à gauche, informations à droite.

**Formulaire (Server Action) :**

Champs :
- Prénom + Nom (requis)
- Email professionnel (requis)
- Téléphone (optionnel)
- Nom du salon (requis)
- Ville (requis)
- Nombre d'employés : 1 / 2–3 / 4–5 / 6–10 / 10+ (sélecteur)
- Type de demande : "Accès pilote" / "Démo produit" / "Question" / "Autre" (radio)
- Message libre (optionnel, max 500 caractères)
- Consentement RGPD (checkbox obligatoire)

**Action serveur :**
- v1 : Envoyer un email à `hasan@netzinformatique.fr` via RESEND (quand configuré) OU journaliser dans une table `contact_requests` (simple log)
- Redirection vers une page de confirmation `/contact/merci`
- Si RESEND non configuré : afficher le formulaire mais logger en DB/console

**Informations contact (colonne droite) :**
- Email : `contact@kalendhair.fr` (alias à créer)
- Délai : "Réponse sous 24h en semaine"
- Localisation : "France"
- Mention : "Aucun commercial. Hasan vous répond personnellement."

**Page confirmation `/contact/merci` :**
- Message : "Votre demande a bien été reçue. Nous vous répondrons dans les 24 heures."
- CTA : `Retour à l'accueil →`

---

### 4.5 Pages légales

**`/mentions-legales`**
- Éditeur : Hasan Biçer (ou entité juridique à compléter)
- Hébergeur : Vercel Inc. + Neon Inc.
- RGPD : DPO contact
- Template standard — contenu à compléter par Hasan

**`/politique-confidentialite`**
- Données collectées (email, nom, données salon)
- Durée de conservation
- Droits des utilisateurs (accès, rectification, suppression)
- Cookies : Vercel Analytics (anonyme), SpeedInsights
- Template standard RGPD — contenu à compléter

**`/cgv`**
- Plans et tarifs (référence aux plans actuels)
- Conditions de résiliation
- Politique de remboursement
- Template standard SaaS — contenu à compléter

---

## 5. Navigation & Footer

### Navigation principale (MarketingNav)

**Desktop :**
```
[Logo KalendHair]   Fonctionnalités   Tarifs   Contact        [Se connecter]  [Commencer →]
```

- Logo : texte "KalendHair" ou SVG — lien vers `/`
- "Se connecter" → `https://pro.kalendhair.fr/login` (lien externe, target blank)
- "Commencer →" → `/contact` — bouton primaire (indigo plein)
- Sticky au scroll avec backdrop-blur

**Mobile :**
- Burger menu → drawer ou menu déroulant
- Même liens + "Se connecter" + CTA

**Comportement :**
- Fond transparent sur hero (fond sombre) → fond blanc/blur après le hero
- Indicateur de page active (underline ou couleur)

---

### Footer (MarketingFooter)

**Layout :** 4 colonnes (desktop), 2×2 (tablet), 1 colonne (mobile)

```
Colonne 1 — Brand
  Logo + tagline
  "Gestion de salon. Simple."
  © 2026 KalendHair

Colonne 2 — Produit
  Fonctionnalités
  Tarifs
  Changelog (v2)
  Roadmap (v2)

Colonne 3 — Légal
  Mentions légales
  Politique de confidentialité
  CGV
  RGPD

Colonne 4 — Contact
  contact@kalendhair.fr
  Accès professionnel ↗
  Accès admin ↗
```

**Bas du footer :**
- "Fait avec ♥ en France"
- Vercel (badge "Powered by Vercel" optionnel)
- Liens LinkedIn / Twitter si créés

---

## 6. Parcours utilisateur & stratégie de conversion

### Funnel principal

```
Découverte (SEO / bouche-à-oreille / réseau)
    ↓
Homepage (/)
    ↓
[Scan rapide — 10 secondes]
  → Hero : comprend ce que c'est
  → Trust strip : rassuré par les chiffres
    ↓
[Exploration — 1 à 2 minutes]
  → Feature showcases : identifie ses besoins
  → Pricing teaser : vérifie que c'est abordable
    ↓
[Décision — 30 secondes]
  → CTA final ou nav vers /tarifs
    ↓
/tarifs → compare les plans
    ↓
CTA → /contact (demande d'accès)
    ↓
Onboarding manuel (pilote fermé)
```

### Stratégie de conversion (v1)

**Absence de self-service :** Il n'existe pas encore de route `/register`. Tous les CTA pointent vers `/contact`. Cette contrainte est acceptable pour le pilote — elle permet de qualifier chaque demande manuellement.

**Ancrage prix :** Le plan BUSINESS (99€) est toujours affiché en premier ou en évidence pour rendre le plan PRO (59€) plus attractif par contraste.

**Urgence douce :** "Rejoignez les premiers salons pilotes" crée une rareté sans être mensonger — le pilote est réellement limité.

**Confiance sans fake :** Pas de faux témoignages, pas de faux chiffres. Les seuls chiffres affichés sont factuels : 14 modules, 3 plans, 0€ de commission, hébergé en Europe.

**Points de friction à réduire :**
- Le formulaire de contact doit être court (5 champs max obligatoires)
- La navigation doit toujours avoir un CTA visible
- Les pages légales ne doivent pas être enterrées

---

## 7. Stratégie SEO

### Mots-clés cibles

**Volume fort (concurrence haute) :**
- "logiciel salon coiffure"
- "logiciel coiffeur"
- "agenda coiffeur en ligne"

**Volume moyen (concurrence modérée) :**
- "logiciel gestion salon coiffure"
- "réservation en ligne coiffeur"
- "logiciel caisse coiffeur"
- "prise de rendez-vous coiffeur"

**Volume faible (longue traîne, concurrence basse) :**
- "logiciel gestion stock salon coiffure"
- "gestion commissions employés coiffure"
- "agenda multi-employés salon coiffure"
- "reçus conformes dgfip coiffeur"
- "alternative planity sans commission"

### Metadata par page

| Page | Title | Description |
|---|---|---|
| `/` | "KalendHair — Logiciel de gestion pour salons de coiffure" | "Gérez votre salon avec une seule plateforme : agenda, réservation en ligne, caisse, stocks. Essayez KalendHair." |
| `/fonctionnalites` | "Fonctionnalités — Agenda, Caisse, Stocks, CRM" | "Découvrez les 14 modules de KalendHair pour les salons de coiffure." |
| `/tarifs` | "Tarifs KalendHair — À partir de 29€/mois" | "Plans transparents, sans commission, sans engagement. ESSENTIAL 29€, PRO 59€, BUSINESS 99€." |
| `/contact` | "Contact — Demandez votre accès KalendHair" | "Demandez un accès pilote ou une démo. Réponse personnelle sous 24h." |

### Données structurées (JSON-LD)

**Sur `/` :**
```json
{
  "@type": "SoftwareApplication",
  "name": "KalendHair",
  "applicationCategory": "BusinessApplication",
  "offers": { "@type": "AggregateOffer", "lowPrice": "29", "priceCurrency": "EUR" },
  "operatingSystem": "Web",
  "description": "Logiciel de gestion pour salons de coiffure"
}
```

**Sur `/tarifs` :**
```json
{
  "@type": "Product",
  "name": "KalendHair PRO",
  "offers": { "@type": "Offer", "price": "59", "priceCurrency": "EUR" }
}
```

### Techniques SEO

- **`generateMetadata()` par page** — metadata dynamique avec title/description/openGraph
- **Sitemap** — `src/app/sitemap.ts` avec toutes les routes marketing
- **robots.txt** — autoriser marketing, bloquer `/dashboard/`, `/admin/`, `/api/`
- **Canonical URLs** — pas de duplication de contenu
- **Balises alt** — sur tous les screenshots/images
- **Heading hierarchy** — H1 unique par page, H2 par section, H3 par sous-section
- **Page speed** — Images en `next/image` avec lazy loading, LCP < 2.5s

---

## 8. Stratégie des captures produit

### Captures à planifier (14 au total)

| # | Capture | Page URL | Utilisation |
|---|---|---|---|
| 1 | Dashboard KPI — période mensuelle | `/dashboard/kpi` | Hero homepage |
| 2 | Agenda semaine — multi-employés | `/dashboard/agenda` | Feature showcase 1 |
| 3 | Réservation publique — étape service | `/book/[slug]` | Feature showcase 2 |
| 4 | Encaissement RDV | `/dashboard/appointments/[id]/pay` | Feature showcase 3 |
| 5 | Reçu imprimable | `/dashboard/payments/[id]/receipt` | Feature showcase 3 |
| 6 | Fiche client | `/dashboard/clients/[id]` | Feature showcase 4 |
| 7 | Liste rendez-vous avec filtres | `/dashboard/appointments` | Page fonctionnalités |
| 8 | Formulaire nouveau rendez-vous | `/dashboard/appointments/new` | Page fonctionnalités |
| 9 | Hub inventaire | `/dashboard/inventory` | Page fonctionnalités |
| 10 | Dashboard abonnement | `/dashboard/billing` | Page tarifs |
| 11 | Catalogue plans | `/dashboard/plans` | Page tarifs |
| 12 | Vue commissions employé | `/dashboard/employees/[id]/commissions` | Page fonctionnalités |
| 13 | Liste bons de commande | `/dashboard/purchase-orders` | Page fonctionnalités |
| 14 | Super Admin — liste organisations | `/admin/organizations` | (interne) |

### Spécifications des captures

- **Résolution :** 1280×800 minimum (Retina 2x recommandé)
- **Format :** PNG ou AVIF pour la qualité, WebP pour la production
- **Données :** Utiliser `salon-beaute-test` ou un salon pilote avec données fictives réalistes
- **Post-traitement :** Fond légèrement flouté ou masqué pour les données sensibles
- **Framing :** Captures dans un chrome de navigateur stylisé (mockup macOS ou browser frame)

### Placeholder v1

En attendant les vraies captures :
- Rectangles colorés avec label "Screenshot [nom]" en texte
- OU imports statiques de fichiers PNG placeholder
- La structure HTML/CSS des sections screenshot est écrite pour accueillir les vraies captures sans refactoring

---

## 9. Hiérarchie visuelle & design system

### Palette de couleurs

La vitrine marketing étend la palette UI existante (indigo-600 comme couleur primaire) avec :

```
--marketing-bg-dark:    #0F0F1A   (fond hero, sections sombres — proche slate-950 avec nuance indigo)
--marketing-bg-light:   #FFFFFF   (sections claires)
--marketing-bg-subtle:  #F8F8FC   (fond carte, alternance de sections)
--marketing-accent:     #4F46E5   (indigo-600 — couleur primaire identique à l'app)
--marketing-accent-2:   #818CF8   (indigo-400 — pour les gradients et highlights)
--marketing-text-dark:  #0F172A   (slate-900)
--marketing-text-muted: #64748B   (slate-500)
--marketing-border:     #E2E8F0   (slate-200)
```

**Philosophie :** Alternance claire-sombre entre sections pour créer du rythme sans être agressif. Le hero et la CTA finale sont sombres. Tout le contenu informatif est sur fond clair.

### Typographie

Geist Sans est déjà chargé globalement. La vitrine l'utilise :

| Usage | Taille | Poids |
|---|---|---|
| Headline hero | 56px / 4xl | 700 (bold) |
| Headline section | 36px / 3xl | 700 |
| Sous-titre section | 20px | 400 |
| Corps | 16px | 400 |
| Badge / caption | 12px | 500 (medium) |
| Nav links | 14px | 500 |
| CTA button | 15px | 600 |

**Espacement :** Sections séparées par `py-24` (desktop) / `py-16` (mobile). Aucun "mur de texte" — les paragraphes ont max 65 caractères par ligne.

### Composants visuels récurrents

- **Badge de section :** Petit rectangle arrondi avec fond indigo très léger + texte indigo — ex. `[📅 Rendez-vous]`
- **Feature card :** Fond blanc, border slate-200, ombre légère `shadow-sm`, icône + titre + corps
- **Screenshot frame :** Conteneur avec `rounded-xl shadow-2xl ring-1 ring-slate-200` — même style que Linear/Vercel
- **CTA button primaire :** Fond indigo-600, hover indigo-700, texte blanc, `rounded-lg px-6 py-3`
- **CTA button secondaire :** Texte indigo-600, border indigo-200, fond transparent, hover fond indigo-50

### Layout & grilles

- **Max-width :** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (standard Tailwind)
- **Sections alternées :** Feature showcases alternent image-gauche/texte-droite
- **Grid tarifs :** `grid-cols-3` desktop, `grid-cols-1` mobile — plan PRO en `ring-2 ring-indigo-600` (mis en avant)

---

## 10. Architecture technique

### Route group et isolation

```
src/app/(marketing)/   ← Nouveau route group dédié
  layout.tsx           ← Layout spécifique : fond blanc, nav marketing, footer
  page.tsx             ← Homepage (/ → remplace l'actuel placeholder)
  ...
```

Le layout marketing est **indépendant** des layouts `(dashboard)`, `(admin)` et `(auth)`. Il n'importe rien du code métier.

### Composants

**Server Components par défaut.** Les seules exceptions `"use client"` :
- `PricingToggle` — bascule mensuel/annuel (useState)
- `FaqAccordion` — open/close FAQ (useState)
- `MobileMenu` — burger menu (useState)
- `ContactForm` — useActionState pour le formulaire

**Aucun composant UI métier importé** (pas de `AppointmentStatusBadge`, pas de `PaymentMethodBadge` etc.) — la vitrine est un produit séparé.

### Pages statiques vs dynamiques

| Page | Type | Justification |
|---|---|---|
| `/` | `○ Static` (SSG) | Contenu fixe, SEO maximal |
| `/fonctionnalites` | `○ Static` | Contenu fixe |
| `/tarifs` | `○ Static` | Plans fixes (hardcodés — sync manuelle avec billing.service.ts) |
| `/contact` | `ƒ Dynamic` | Server Action pour le formulaire |
| `/contact/merci` | `○ Static` | Page de confirmation |
| Légales | `○ Static` | Contenu fixe |

**Note :** Les prix de la page `/tarifs` sont **hardcodés dans le composant** pour permettre le rendu statique. Ils doivent être synchronisés manuellement avec `billing.service.ts` en cas de changement de tarif. Ce choix évite une requête DB au runtime pour une page publique.

### SEO technique

**`src/app/sitemap.ts` :**
```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://kalendhair.fr', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://kalendhair.fr/fonctionnalites', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://kalendhair.fr/tarifs', changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://kalendhair.fr/contact', changeFrequency: 'monthly', priority: 0.7 },
  ]
}
```

**`src/app/robots.ts` :**
```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/admin/', '/api/'] },
    ],
    sitemap: 'https://kalendhair.fr/sitemap.xml',
  }
}
```

### Contact form — table DB (option)

Si RESEND non configuré, le formulaire peut logger dans une nouvelle table `contact_requests` (migration additive) :
```
contact_requests : id, name, email, phone?, salonName, city, employeeCount, requestType, message?, createdAt
```
**Cette table n'est pas bloquante pour v1** — le formulaire peut simplement afficher un message de succès et logger en console si ni RESEND ni DB n'est disponible.

---

## 11. Composants à créer

### Composants marketing (src/app/(marketing)/components/)

| Composant | Type | Description |
|---|---|---|
| `MarketingNav` | Server | Barre de navigation sticky avec CTA |
| `MarketingFooter` | Server | Footer 4 colonnes |
| `HeroSection` | Server | Hero complet avec headline, CTA, screenshot |
| `TrustStrip` | Server | Bande de confiance avec stats |
| `ModuleGrid` | Server | Grille 9 modules |
| `FeatureBlock` | Server | Section feature avec screenshot (props: reversed, title, bullets, imageSrc) |
| `PricingTeaser` | Server | 3 cartes plan simplifiées |
| `PricingCard` | Server | Carte plan complète (props: plan, price, features, highlighted) |
| `PricingToggle` | **Client** | Bascule mensuel/annuel |
| `PricingTable` | Server | Tableau comparatif complet |
| `FaqAccordion` | **Client** | Accordion FAQ |
| `FaqItem` | **Client** | Item individuel FAQ |
| `TestimonialCard` | Server | Carte témoignage (props: quote, name, salon, city) |
| `CtaBanner` | Server | Bannière CTA finale |
| `StatCard` | Server | Carte statistique (props: value, label) |
| `ContactForm` | **Client** | Formulaire de contact avec useActionState |
| `ScreenshotFrame` | Server | Conteneur avec chrome browser stylisé |
| `SectionBadge` | Server | Badge de catégorie |
| `PageHero` | Server | Hero léger pour pages secondaires |

**Total : 19 composants** — 4 Client, 15 Server.

### Fichiers additionnels

| Fichier | Description |
|---|---|
| `src/app/(marketing)/contact/actions.ts` | Server Action formulaire contact |
| `src/app/sitemap.ts` | Sitemap XML automatique |
| `src/app/robots.ts` | robots.txt |
| `src/lib/marketing-constants.ts` | Plans, prix, features (source de vérité marketing) |

---

## 12. Contraintes & décisions de périmètre

### Ce que cette PR NE fait PAS

- ❌ Aucune modification du back-office (`/dashboard/`, `/admin/`)
- ❌ Aucune modification de Prisma, Neon, auth
- ❌ Aucune modification des pages de réservation publique existantes (`/book/`)
- ❌ Aucune implémentation de `/register` (hors périmètre)
- ❌ Aucune connexion à la base de données depuis la vitrine (sauf optionnellement le formulaire contact)
- ❌ Aucun nouveau package npm requis pour cette phase

### Décisions actées

| Décision | Justification |
|---|---|
| CTA → `/contact` (pas `/register`) | Pas de self-service en v1 — qualification manuelle pendant le pilote |
| Prix hardcodés sur `/tarifs` | Rendu statique — synchro manuelle acceptée pour v1 |
| Captures produit en placeholder | Les vraies captures seront intégrées lors du développement |
| Pas de blog en v1 | Scope maîtrisé — le blog SEO est une priorité v2 |
| Comparatif concurrents | À valider factuellement avant publication |
| `salon-beaute-test` comme source captures | Données fictives réalistes, pas de données client réelles |
| Contact form v1 | Logger en console/DB si RESEND absent — pas bloquant |

### Dépendances pour le développement

| Dépendance | État |
|---|---|
| Captures produit (14 screenshots) | À réaliser après développement des pages |
| Contenu légal (CGV, mentions, RGPD) | À fournir par Hasan |
| Email `contact@kalendhair.fr` | À créer sur IONOS (alias vers `hasan@netzinformatique.fr`) |
| Témoignages pilotes | Disponibles après 4 semaines de pilote |
| RESEND (pour le formulaire) | Dépend de la validation Hasan (section 16 du PILOT_RUNBOOK) |

---

## 13. Priorités d'implémentation

### Sprint Marketing v1 (une fois ce document validé)

**Phase 1 — Structure & navigation (jour 1)**
1. Créer `src/app/(marketing)/layout.tsx`
2. `MarketingNav` + `MarketingFooter`
3. Migrer `src/app/page.tsx` → `src/app/(marketing)/page.tsx`
4. `src/app/robots.ts` + `src/app/sitemap.ts`

**Phase 2 — Homepage (jours 2–3)**
5. Hero section (avec placeholder screenshot)
6. Trust strip + Module grid
7. Feature showcases 1–4 (avec placeholders)
8. Pricing teaser
9. CTA finale

**Phase 3 — Pages secondaires (jours 4–5)**
10. `/tarifs` — PricingCard + PricingToggle + PricingTable + FAQ
11. `/fonctionnalites` — 10 sections modules
12. `/contact` — ContactForm + Server Action
13. Pages légales (squelettes)

**Phase 4 — SEO & polish (jour 6)**
14. `generateMetadata()` sur toutes les pages
15. JSON-LD structured data
16. Accessibilité (aria-labels, focus visible)
17. Responsive mobile (test Tailwind breakpoints)

**Phase 5 — Captures produit (après développement)**
18. Réaliser les 14 captures avec `salon-beaute-test`
19. Optimiser en WebP/AVIF
20. Intégrer dans les `ScreenshotFrame`

---

_Document créé le 2026-06-25 — Phase Product 1 — Marketing Website v1._
_Auteur : Claude Sonnet 4.6. À valider par ChatGPT avant tout développement._
