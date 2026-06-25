# MARKETING_WEBSITE_V1 — Architecture de la vitrine SaaS KalendHair

> Document de conception — Phase Product 1 — Marketing Website v1.
> Aucune implémentation dans cette PR. Ce document est la spec à valider par ChatGPT avant tout développement.
> **Révision v1.1 — 2026-06-25** : ajout pages `/demo`, `/pourquoi-kalendhair`, `/a-propos`, `/roadmap`, `/aide` ; révision stratégie CTA ; stratégie salon de démonstration.

---

## Table des matières

1. [Positionnement & cible](#1-positionnement--cible)
2. [Architecture des pages (sitemap)](#2-architecture-des-pages-sitemap)
3. [Arborescence technique](#3-arborescence-technique)
4. [Spécifications par page](#4-spécifications-par-page)
   - [4.1 Accueil `/`](#41-accueil-)
   - [4.2 Fonctionnalités `/fonctionnalites`](#42-fonctionnalités-fonctionnalites)
   - [4.3 Tarifs `/tarifs`](#43-tarifs-tarifs)
   - [4.4 Démonstration `/demo`](#44-démonstration-demo)
   - [4.5 Pourquoi KalendHair `/pourquoi-kalendhair`](#45-pourquoi-kalendhair-pourquoi-kalendhair)
   - [4.6 À propos `/a-propos`](#46-à-propos-a-propos)
   - [4.7 Roadmap `/roadmap`](#47-roadmap-roadmap)
   - [4.8 Aide `/aide`](#48-aide-aide)
   - [4.9 Contact `/contact`](#49-contact-contact)
   - [4.10 Pages légales](#410-pages-légales)
5. [Navigation & Footer](#5-navigation--footer)
6. [Parcours utilisateur & stratégie de conversion](#6-parcours-utilisateur--stratégie-de-conversion)
7. [Stratégie SEO](#7-stratégie-seo)
8. [Stratégie des captures produit & salon de démonstration](#8-stratégie-des-captures-produit--salon-de-démonstration)
9. [Hiérarchie visuelle & design system](#9-hiérarchie-visuelle--design-system)
10. [Architecture technique](#10-architecture-technique)
11. [Composants à créer](#11-composants-à-créer)
12. [Contraintes & décisions de périmètre](#12-contraintes--décisions-de-périmètre)
13. [Priorités d'implémentation](#13-priorités-dimplémentation)

---

## 1. Positionnement & cible

### Produit

KalendHair est un **SaaS de gestion tout-en-un pour salons de coiffure et instituts de beauté**, hébergé en Europe, conçu pour les gérants indépendants.

Il regroupe en une seule plateforme :
- Prise de rendez-vous & agenda visuel
- Réservation publique en ligne (page partageable)
- CRM clients
- Caisse & paiements (reçus conformes DGFIP)
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
| Marché | France (priorité) — Belgique, Suisse francophone ensuite |
| Maturité digitale | Variable : papier/téléphone → Google Calendar → outils spécialisés |
| Problème principal | Jongler entre 3–4 outils séparés, ou payer trop cher pour un logiciel surdimensionné |
| Motivation d'achat | Gagner du temps, proposer la réservation en ligne, centraliser la gestion, professionnaliser |

### Cible secondaire

- Gérant(e) cherchant à quitter Planity / Fresha / Mindbody (coût, dépendance, manque de contrôle)
- Jeune coiffeur ouvrant son premier salon
- Manager d'une chaîne de 2–3 salons (plan PRO/BUSINESS)

### Positionnement différenciateur

> **"Tout ce dont votre salon a besoin. Une seule plateforme. Un seul prix."**

KalendHair se positionne contre :
- **La fragmentation** : fin des 4 outils séparés
- **La complexité** : interface conçue pour les coiffeurs, pas les DSI
- **Le coût caché** : prix transparent, zéro commission sur les réservations
- **La dépendance** : données hébergées en Europe, exportables

---

## 2. Architecture des pages (sitemap)

```
kalendhair.fr/
│
├── /                           → Accueil (landing page principale)
├── /fonctionnalites            → 14 modules détaillés
├── /demo                       → Démonstration visuelle du produit      ← NOUVEAU
├── /pourquoi-kalendhair        → Bénéfices métier & comparatif          ← NOUVEAU
├── /tarifs                     → Plans & tarifs avec comparatif complet
├── /a-propos                   → Histoire, vision, engagement            ← NOUVEAU
├── /roadmap                    → Fonctionnalités disponibles & à venir   ← NOUVEAU
├── /aide                       → Base de connaissances & support         ← NOUVEAU
├── /contact                    → Demande d'accès pilote / essai gratuit
│   └── /contact/merci          → Confirmation de soumission
├── /mentions-legales           → Mentions légales
├── /politique-confidentialite  → Politique de confidentialité
└── /cgv                        → Conditions générales de vente
```

**Périmètre v1 :** Les 10 premières pages + les 3 légales.

**Hors périmètre v1 (v2+) :**
- `/blog` — Articles SEO, conseils gestion salon
- `/partenaires` — Intégrations & partenaires
- `/changelog` — Journal détaillé des évolutions (v2 — la roadmap en tient lieu en v1)
- `/[slug]-demo` — Landing page personnalisée par salon pilote

---

## 3. Arborescence technique

```
src/app/
├── (marketing)/                    ← Nouveau route group (URLs non affectées)
│   ├── layout.tsx                  ← Layout marketing : MarketingNav + MarketingFooter
│   ├── page.tsx                    ← Accueil /
│   ├── fonctionnalites/
│   │   └── page.tsx
│   ├── demo/
│   │   └── page.tsx                ← NOUVEAU
│   ├── pourquoi-kalendhair/
│   │   └── page.tsx                ← NOUVEAU
│   ├── tarifs/
│   │   └── page.tsx
│   ├── a-propos/
│   │   └── page.tsx                ← NOUVEAU
│   ├── roadmap/
│   │   └── page.tsx                ← NOUVEAU
│   ├── aide/
│   │   └── page.tsx                ← NOUVEAU
│   ├── contact/
│   │   ├── page.tsx
│   │   ├── merci/
│   │   │   └── page.tsx
│   │   └── actions.ts
│   ├── mentions-legales/
│   │   └── page.tsx
│   ├── politique-confidentialite/
│   │   └── page.tsx
│   └── cgv/
│       └── page.tsx
│
├── (marketing)/components/         ← Composants marketing uniquement
│   ├── marketing-nav.tsx
│   ├── marketing-footer.tsx
│   ├── hero-section.tsx
│   ├── feature-block.tsx
│   ├── pricing-card.tsx
│   ├── pricing-toggle.tsx          ← "use client"
│   ├── faq-accordion.tsx           ← "use client"
│   ├── mobile-menu.tsx             ← "use client"
│   ├── stats-strip.tsx
│   ├── testimonial-card.tsx
│   ├── cta-banner.tsx
│   ├── demo-screen-tab.tsx         ← "use client" — NOUVEAU
│   ├── roadmap-item.tsx            ← NOUVEAU
│   ├── benefit-card.tsx            ← NOUVEAU
│   ├── comparison-table.tsx        ← NOUVEAU
│   ├── help-category-card.tsx      ← NOUVEAU
│   ├── screenshot-frame.tsx
│   ├── section-badge.tsx
│   └── page-hero.tsx
│
└── page.tsx                        ← À déplacer vers (marketing)/page.tsx
```

**Note :** `src/app/page.tsx` (placeholder actuel) sera déplacé vers `src/app/(marketing)/page.tsx`. Le route group `(marketing)` est transparent pour les URLs.

---

## 4. Spécifications par page

---

### 4.1 Accueil `/`

**Objectif :** Convaincre un gérant de salon en moins de 90 secondes que KalendHair est fait pour lui et l'inciter à essayer gratuitement.

**Meta SEO :**
- `title`: "KalendHair — Logiciel de gestion pour salons de coiffure | Rendez-vous, caisse, stocks"
- `description`: "Gérez votre salon de coiffure avec une seule plateforme : agenda, réservation en ligne, caisse, stocks et clients. Essayez KalendHair gratuitement."
- `og:image`: Capture dashboard KPI (salon de démonstration)

---

#### Section 1 — Hero

**Layout :** Fond sombre (gradient `#0F0F1A` → `#1e1b4b`), texte blanc, capture produit à droite (desktop) / en dessous (mobile).

**Headline :**
> "Votre salon, géré depuis une seule application."

**Sous-headline :**
> "Rendez-vous, caisse, stocks, clients. KalendHair remplace tous vos outils par une plateforme conçue pour les coiffeurs."

**CTA primaire :** `Essayer gratuitement` → `/contact?type=essai`
**CTA secondaire :** `Voir la démo →` → `/demo`

**Éléments de confiance :** (sous les CTA, en ligne)
- "✓ Sans commission sur les réservations"
- "✓ Hébergé en Europe"
- "✓ Sans engagement"

**Capture produit :** Dashboard KPI du salon de démonstration (voir section 8).
**Placeholder v1 dev :** Rectangle `rounded-xl shadow-2xl bg-slate-800` + label "Dashboard KalendHair — capture à venir".

---

#### Section 2 — Bande de confiance (trust strip)

**Layout :** Fond blanc, centré, 3 chiffres.

**Indicateurs :**
- `14` modules intégrés
- `3` plans adaptés à chaque taille de salon
- `0 €` de commission sur les réservations

> Ces chiffres sont factuels. À compléter avec les données pilotes dès qu'elles sont disponibles (ex. nombre de salons).

---

#### Section 3 — Vue d'ensemble des modules

**Titre :** "Tout ce dont votre salon a besoin"
**Sous-titre :** "Une plateforme. Pas 5 abonnements."
**Layout :** Grille 3×3 (desktop), 2×4 (tablet), 1×N (mobile)

| Icône | Module | Description 1 ligne |
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

**CTA :** `Voir toutes les fonctionnalités →` → `/fonctionnalites`

---

#### Section 4 — Feature showcase 1 : Agenda & Rendez-vous

**Titre :** "L'agenda de votre salon, enfin clair"
**Corps :**
- Vue semaine multi-employés avec détection automatique des conflits
- Créneaux disponibles calculés en temps réel
- Historique complet de chaque modification

**Visuel :** Capture agenda visuel `/dashboard/agenda` (salon de démonstration)
**Layout :** Texte gauche, capture droite

---

#### Section 5 — Feature showcase 2 : Réservation publique

**Titre :** "Votre salon ouvert 24h/24 en ligne"
**Corps :**
- Une page de réservation à votre image, partageable partout
- Le client choisit le service, l'employé et le créneau
- Confirmation automatique — zéro commission

**Visuel :** Capture `/book/[slug]`
**Layout :** Capture gauche, texte droite

---

#### Section 6 — Feature showcase 3 : Caisse & Paiements

**Titre :** "Encaissez en un clic, conformément à la loi"
**Corps :**
- Reçus numérotés séquentiellement, conformes DGFIP
- Espèces, carte, virement ou autre
- Annulation et historique complet

**Visuel :** Capture `/dashboard/payments` ou reçu imprimable
**Layout :** Texte gauche, capture droite

---

#### Section 7 — Feature showcase 4 : KPI & Pilotage

**Titre :** "Pilotez votre salon avec les bonnes données"
**Corps :**
- Chiffre d'affaires réel, taux de remplissage, top services
- Filtres par période : aujourd'hui, semaine, mois
- Commissions des employés calculées automatiquement

**Visuel :** Capture `/dashboard/kpi`
**Layout :** Capture gauche, texte droite

---

#### Section 8 — Teaser tarifs

**Titre :** "Des tarifs transparents, adaptés à votre salon"
**Layout :** 3 cartes simplifiées, lien vers `/tarifs`

| Plan | Prix | Pour qui |
|---|---|---|
| ESSENTIAL | 29 €/mois | Solo ou duo |
| PRO | 59 €/mois | Équipe jusqu'à 10 |
| BUSINESS | 99 €/mois | Multi-salons |

**CTA :** `Voir tous les tarifs →` → `/tarifs`

---

#### Section 9 — Témoignages pilotes (placeholder)

**Titre :** "Ce que disent les salons pilotes"
**Note dev :** Section commentée en v1 dev. Décommenter dès que des témoignages réels sont disponibles.

Format :
- Citation (max 120 caractères)
- Prénom + Nom du gérant
- Nom du salon + Ville
- Avatar (initiales si pas de photo)

---

#### Section 10 — CTA final

**Titre :** "Prêt à rejoindre les premiers salons pilotes ?"
**Sous-titre :** "Essayez KalendHair gratuitement. Aucun engagement, aucune carte bancaire requise."
**CTA primaire :** `Essayer gratuitement →` → `/contact?type=essai`
**CTA secondaire :** `Voir la démo →` → `/demo`
**Fond :** Gradient indigo sombre (cohérent avec le hero)

---

### 4.2 Fonctionnalités `/fonctionnalites`

**Objectif :** Référence exhaustive des modules pour le visiteur déjà convaincu, et page d'entrée SEO sur les fonctionnalités spécifiques.

**Meta SEO :**
- `title`: "Fonctionnalités KalendHair — Agenda, Caisse, Stocks, CRM pour salons de coiffure"
- `description`: "Découvrez les 14 modules de KalendHair : agenda visuel, réservation publique, caisse DGFIP, gestion stocks, CRM, commissions et KPI."

---

**Hero :**
- Titre : "Toutes les fonctionnalités de KalendHair"
- Sous-titre : "Conçu pour les coiffeurs. Construit pour durer."
- Barre de navigation rapide : ancres `#rdv #agenda #reservation #clients #caisse #stocks #fournisseurs #commissions #kpi #abonnement`

---

**10 sections modules (patron identique pour chacune) :**

```
[Badge catégorie]
[Titre H2]
[Sous-titre]
[3–5 bullet points détaillés]
[ScreenshotFrame — capture salon démo ou placeholder]
[CTA inline : "Essayer gratuitement →"]
```

Ordre :
1. Rendez-vous — statuts PENDING → CONFIRMED → COMPLETED, historique modifications
2. Agenda visuel — jour/semaine, multi-employés, indicateur temps réel, zones hors-horaires
3. Réservation publique — `/book/[slug]`, wizard 4 étapes, zéro commission
4. Clients & CRM — fiche client, historique, notes internes, conversion invité → client
5. Caisse & Paiements — multi-méthode, reçus DGFIP séquentiels, annulation
6. Stocks & Produits — catégories, entrées/sorties, alertes rupture, mouvements
7. Fournisseurs & Commandes — états DRAFT → RECEIVED, réceptions partielles
8. Commissions — règles par employé/service/produit, calcul auto, ajustements manuels
9. KPI & Dashboard — CA, taux remplissage, top services, top employés, filtres période
10. Abonnements — plans ESSENTIAL/PRO/BUSINESS, quotas, changement de cycle

---

**Section finale : Comparatif concurrents**

> **Note :** Tableau informatif, sans jugement de valeur. Les informations seront vérifiées avec des sources publiques avant publication. Le tableau ne constitue pas une publicité comparative au sens légal.

| Fonctionnalité | KalendHair | Méthodes traditionnelles | Logiciels concurrents |
|---|---|---|---|
| Agenda multi-employés | ✅ | Agenda papier / Google Calendar (limité) | Selon l'outil |
| Réservation en ligne sans commission | ✅ | ❌ | Certains facturent par réservation |
| Caisse avec reçus conformes DGFIP | ✅ | Caisse enregistreuse séparée | Selon l'outil |
| Gestion des stocks intégrée | ✅ | Tableur séparé | Selon l'outil |
| Commissions automatiques | ✅ | Calcul manuel | Rare |
| Hébergement en Europe | ✅ | N/A | Variable |
| Données exportables | ✅ (v2 auto) | N/A | Variable |
| Prix tout inclus | ✅ | N/A | Variable |

---

**CTA final :**
- `Essayer gratuitement →` → `/contact?type=essai`
- `Voir la démo →` → `/demo`

---

### 4.3 Tarifs `/tarifs`

**Objectif :** Permettre au visiteur de choisir son plan en moins de 2 minutes. Supprimer toute friction liée au prix.

**Meta SEO :**
- `title`: "Tarifs KalendHair — À partir de 29€/mois, sans commission"
- `description`: "Plans transparents pour salons de coiffure : ESSENTIAL 29€, PRO 59€, BUSINESS 99€. Sans engagement, sans commission, hébergé en Europe."

---

**Hero :**
- Titre : "Des tarifs clairs pour chaque salon"
- Sous-titre : "Sans engagement. Sans commission. Sans mauvaise surprise."
- Toggle mensuel / annuel — économie affichée : "Économisez 2 mois en annuel"

---

**3 cartes plan** (données de `billing.service.ts`) :

| | ESSENTIAL | PRO | BUSINESS |
|---|---|---|---|
| Prix mensuel | 29 €/mois | 59 €/mois | 99 €/mois |
| Prix annuel | 290 €/an | 590 €/an | 990 €/an |
| Salons | 1 | 3 | Illimités |
| Employés | 2 | 10 | Illimités |
| Rendez-vous & Agenda | ✅ | ✅ | ✅ |
| Réservation publique | ✅ | ✅ | ✅ |
| CRM Clients | ✅ | ✅ | ✅ |
| Commissions | ✅ | ✅ | ✅ |
| Caisse & Paiements | ❌ | ✅ | ✅ |
| Stocks & Produits | ❌ | ✅ | ✅ |
| Fournisseurs | ❌ | ✅ | ✅ |
| KPI & Dashboard | ❌ | ✅ | ✅ |
| Support | Email | Email prioritaire | Dédié |

**Marquage :** Plan PRO = badge "Le plus populaire" + `ring-2 ring-indigo-600`.

**CTA par plan :**
- ESSENTIAL : `Essayer gratuitement →`
- PRO : `Essayer gratuitement →`
- BUSINESS : `Nous contacter →`

→ Les deux premiers CTA pointent vers `/contact?type=essai&plan=ESSENTIAL` / `?plan=PRO`.
→ BUSINESS → `/contact?type=business`.

---

**Comparatif complet** (tableau groupé par catégorie — Gestion du salon / Rendez-vous / Réservation / CRM / Caisse / Stocks / Fournisseurs / Commissions / KPI / Support & Sécurité)

---

**FAQ tarifs (10 questions)**

1. Y a-t-il un engagement de durée ?
   > Non. Vous pouvez annuler ou changer de plan à tout moment.

2. Puis-je commencer gratuitement ?
   > Oui. Pendant le pilote fermé, les premiers salons sélectionnés bénéficient d'un accès gratuit. Remplissez le formulaire, nous vous répondons sous 24h.

3. Y a-t-il des commissions sur les réservations ?
   > Non, jamais. Vous payez uniquement votre abonnement. Chaque réservation vous revient intégralement.

4. Puis-je changer de plan ?
   > Oui, depuis votre espace professionnel → Mon abonnement, à tout moment.

5. Comment fonctionne la facturation annuelle ?
   > Vous payez 10 mois et bénéficiez de 12 mois d'accès. Économie de ~17%.

6. Mes données sont-elles hébergées en Europe ?
   > Oui. KalendHair est hébergé sur Neon (Frankfurt, Allemagne) et Vercel (Europe).

7. Puis-je exporter mes données ?
   > L'export est disponible sur demande. L'export automatique est prévu en v2.

8. Que se passe-t-il si j'ai plus d'employés que mon plan ?
   > Vous êtes informé lors de la création. Un changement de plan suffit.

9. Le plan ESSENTIAL est-il adapté à un salon solo ?
   > Oui. Il inclut agenda, rendez-vous, réservation publique, clients et commissions. La caisse et les stocks nécessitent le plan PRO.

10. Y a-t-il un support technique ?
    > Oui. Email inclus dans tous les plans. Support prioritaire à partir de PRO.

---

**Garanties :**
- "🛡️ Données sécurisées" — Hébergement Europe, chiffrement en transit
- "🔄 Sans engagement" — Résiliez à tout moment
- "🚫 Zéro commission" — Vos réservations, vos revenus

**CTA final :**
- `Essayer gratuitement →` → `/contact?type=essai`
- `Voir la démo →` → `/demo`

---

### 4.4 Démonstration `/demo`

**Objectif :** Permettre à un visiteur non encore inscrit de visualiser le produit en détail, module par module, à travers des captures d'écran commentées — sans avoir besoin de s'inscrire. Réduire la friction avant la demande d'accès.

**Meta SEO :**
- `title`: "Démo KalendHair — Découvrez le logiciel pour salons de coiffure en images"
- `description`: "Explorez les écrans de KalendHair : agenda, caisse, CRM, stocks, dashboard KPI. Tout ce que vous devez voir avant d'essayer."

---

**Structure de la page :**

**Hero :**
- Titre : "Découvrez KalendHair en images"
- Sous-titre : "Naviguez entre les modules. Voyez exactement ce que vous gérerez au quotidien."
- CTA : `Essayer gratuitement →` → `/contact?type=essai`

---

**Navigation par onglet / module** (`DemoScreenTab` — composant "use client")

L'utilisateur navigue entre 7 modules via une barre d'onglets. Chaque onglet affiche :
1. Une ou plusieurs captures d'écran dans un `ScreenshotFrame`
2. Un titre + sous-titre descriptif
3. 3 bullet points clés du module
4. Un lien vers la section correspondante de `/fonctionnalites`

**Modules présentés :**

| Onglet | Titre affiché | Captures prévues (salon démo) |
|---|---|---|
| 📅 Agenda | "L'agenda de votre équipe, en un coup d'œil" | Agenda semaine multi-employés |
| 👥 Clients | "La fiche complète de chaque client" | Fiche client + historique |
| 💳 Caisse | "Encaissements et reçus conformes" | Liste paiements + reçu imprimable |
| 📦 Stocks | "Vos produits, toujours à jour" | Hub inventaire + alertes rupture |
| 📊 KPI | "Vos performances en un regard" | Dashboard KPI mensuel |
| 🌐 Réservation | "La page que vos clients voient" | Wizard `/book/[slug]` |
| ⚙️ Administration | "La gestion de votre salon au quotidien" | Hub dashboard + paramètres |

---

**Placeholders pendant le développement :**

Chaque onglet affiche un `ScreenshotFrame` avec un rectangle gris et le libellé :
```
[Capture à venir — Salon de démonstration en cours de constitution]
```
Les vraies captures sont intégrées dès que le salon de démonstration est prêt (voir section 8).

---

**Section "Prêt à essayer ?" (bas de page) :**
- Titre : "Vous avez vu ce que KalendHair peut faire pour votre salon."
- CTA primaire : `Essayer gratuitement →` → `/contact?type=essai`
- CTA secondaire : `Voir les tarifs →` → `/tarifs`

---

### 4.5 Pourquoi KalendHair `/pourquoi-kalendhair`

**Objectif :** Convaincre le visiteur encore hésitant en articulant les bénéfices métier concrets. Page d'entrée SEO sur les recherches de type "pourquoi changer de logiciel" ou "avantages logiciel coiffure".

**Meta SEO :**
- `title`: "Pourquoi KalendHair ? Les bénéfices métier pour votre salon de coiffure"
- `description`: "Gagnez du temps, réduisez les oublis, centralisez votre gestion. Découvrez pourquoi les salons de coiffure choisissent KalendHair."

---

**Hero :**
- Titre : "Pourquoi les coiffeurs choisissent KalendHair"
- Sous-titre : "Pas pour les fonctionnalités. Pour ce que ça change au quotidien."

---

**5 sections bénéfices métier :**

Chaque section : titre H2 + sous-titre + 3–4 bullet points + capture illustrative + chiffre clé si disponible.

---

**Bénéfice 1 — Gain de temps**

> Titre : "Récupérez les heures perdues à gérer les outils"

Bullet points :
- Fini les doubles saisies entre agenda et caisse — tout est synchronisé
- La réservation en ligne remplit votre agenda sans que vous décrochiez le téléphone
- Le dashboard KPI vous donne en 10 secondes ce qu'une heure de comptabilité prenait avant
- Les rappels automatiques réduisent les no-shows sans appels préventifs

Chiffre clé (indicatif, à confirmer avec les pilotes) : "Jusqu'à 2h économisées par semaine sur la gestion administrative."

---

**Bénéfice 2 — Réduction des oublis**

> Titre : "Fini les clients oubliés et les stocks épuisés"

Bullet points :
- Rappels de rendez-vous automatiques — vos clients n'oublient plus
- Alertes de rupture de stock avant qu'il soit trop tard
- Historique complet de chaque client — aucune information perdue
- Bons de commande aux fournisseurs traçables de bout en bout

---

**Bénéfice 3 — Centralisation**

> Titre : "Un seul outil. Zéro jonglage."

Bullet points :
- Agenda, caisse, stock, clients, commissions — dans le même tableau de bord
- Vos employés, votre salon, votre réservation publique : tout paramétré en un endroit
- L'historique complet de chaque rendez-vous est lié au paiement et à la fiche client
- Accédez à votre salon depuis n'importe quel navigateur, sans installation

---

**Bénéfice 4 — Gestion des employés**

> Titre : "Gérez votre équipe sans friction"

Bullet points :
- Horaires individuels configurables, avec zones hors-service visibles dans l'agenda
- Commissions calculées automatiquement à chaque paiement
- Chaque employé dispose de ses propres performances visibles dans les KPI
- Les modifications de rendez-vous sont tracées — qui a fait quoi, quand

---

**Bénéfice 5 — Pilotage de l'activité**

> Titre : "Pilotez votre salon comme une vraie entreprise"

Bullet points :
- Chiffre d'affaires réel par période, par service, par employé
- Taux de remplissage pour mesurer l'efficacité de votre agenda
- Détection des services les plus rentables et des employés les plus performants
- Données sur les commandes fournisseurs pour piloter les coûts

---

**Section : Comparatif avec les méthodes traditionnelles**

> **Note :** Tableau factuel et informatif. Aucun dénigrement de logiciel concurrent ou de méthode de travail. L'objectif est de montrer ce que KalendHair apporte, pas de décrédibiliser d'autres approches.

| Défi courant | Sans KalendHair | Avec KalendHair |
|---|---|---|
| Prendre un rendez-vous | Appel téléphonique ou SMS manuel | Page de réservation en ligne 24h/24 |
| Éviter les doubles réservations | Vérification manuelle dans l'agenda | Vérification automatique en temps réel |
| Encaisser et émettre un reçu | Caisse enregistreuse séparée | Intégré dans la fiche rendez-vous |
| Savoir si un produit est en stock | Vérification physique ou tableur | Alerte automatique dans le tableau de bord |
| Calculer les commissions | Calcul manuel en fin de mois | Calcul automatique à chaque paiement |
| Connaître son chiffre d'affaires | Consolidation manuelle | Dashboard mis à jour en temps réel |
| Relancer les clients inactifs | Mémoire personnelle ou rien | Historique CRM accessible en un clic |
| Commander aux fournisseurs | Email ou téléphone, sans trace | Bon de commande structuré avec historique |

---

**CTA final :**
- `Essayer gratuitement →` → `/contact?type=essai`
- `Voir toutes les fonctionnalités →` → `/fonctionnalites`

---

### 4.6 À propos `/a-propos`

**Objectif :** Humaniser le projet. Donner confiance aux salons pilotes en présentant la vision, l'histoire et l'engagement d'amélioration continue. Montrer que KalendHair est un projet de long terme, pas un outil opportuniste.

**Meta SEO :**
- `title`: "À propos de KalendHair — L'histoire et la vision du logiciel pour salons de coiffure"
- `description`: "Découvrez l'histoire de KalendHair, un logiciel conçu avec et pour les salons de coiffure, avec l'engagement d'évoluer grâce aux retours des utilisateurs."

---

**Structure de la page :**

**Hero :**
- Titre : "KalendHair, fait pour durer"
- Sous-titre : "Un projet construit avec les salons, pas seulement pour eux."

---

**Section 1 — L'histoire**

> Titre : "Pourquoi KalendHair existe"

Corps (à personnaliser avec la vraie histoire de Hasan) :

> KalendHair est né d'un constat simple : les salons de coiffure méritent un logiciel pensé pour leur métier, pas un outil générique adapté tant bien que mal. L'idée : partir de zéro, construire chaque module en écoutant les besoins réels des gérants, et livrer une plateforme cohérente, sans compromis.
>
> [Contenu à compléter par Hasan — contexte personnel, déclencheur du projet, parcours]

---

**Section 2 — La vision produit**

> Titre : "Une plateforme. Pas un agrégat de fonctionnalités."

Corps :

> KalendHair n'est pas un assemblage de modules juxtaposés. Chaque fonctionnalité est conçue pour fonctionner avec les autres : le rendez-vous alimente la caisse, la caisse alimente les KPI, les KPI éclairent les décisions du gérant. L'objectif n'est pas d'avoir la liste de fonctionnalités la plus longue — c'est d'avoir le flux de travail le plus cohérent.

Valeurs produit :
- **Simplicité d'abord** — Une interface qu'on comprend le premier jour
- **Données vous appartiennent** — Hébergées en Europe, exportables, jamais vendues
- **Transparence** — Des tarifs affichés, pas de commissions cachées
- **Continuité** — Un projet maintenu, mis à jour, amélioré dans la durée

---

**Section 3 — L'engagement d'amélioration continue**

> Titre : "KalendHair évolue avec vous"

Corps :

> Les premières versions de KalendHair ont été construites en suivant les besoins du terrain. La phase pilote fermée, actuellement en cours, permet à une sélection de salons de tester le produit en conditions réelles et de remonter leurs retours directement à l'équipe.
>
> Chaque retour est pris en compte. Chaque friction identifiée devient une amélioration. La roadmap publique (disponible sur `/roadmap`) reflète l'état des travaux en cours et à venir.

Engagement :
- Réponse personnelle à chaque retour utilisateur pendant le pilote
- Mise à jour régulière du produit en fonction des usages réels
- Aucune fonctionnalité supprimée sans préavis et migration

---

**Section 4 — L'équipe**

> Titre : "L'équipe derrière KalendHair"

Contenu (à compléter par Hasan) :
- Hasan Biçer — Fondateur & développeur principal
- [Autres contributeurs si applicables]
- Mention des salons pilotes comme co-constructeurs du produit

**Note dev :** Section minimale en v1. Peut être développée ultérieurement.

---

**CTA :**
- `Rejoindre les premiers salons pilotes →` → `/contact?type=pilote`
- `Voir la roadmap →` → `/roadmap`

---

### 4.7 Roadmap `/roadmap`

**Objectif :** Montrer la trajectoire du produit. Donner confiance en la pérennité de KalendHair. Permettre aux prospects de voir si leurs besoins futurs seront couverts.

> **Mention légale obligatoire** (affichée en haut de page, encadrée) :
> "Cette roadmap est fournie à titre informatif. Elle reflète les intentions actuelles de l'équipe KalendHair et ne constitue pas un engagement contractuel. Les priorités peuvent évoluer en fonction des retours utilisateurs et des contraintes techniques."

**Meta SEO :**
- `title`: "Roadmap KalendHair — Fonctionnalités disponibles et à venir"
- `description`: "Découvrez ce qui est disponible dans KalendHair aujourd'hui, ce qui est en développement et ce qui est prévu pour les prochaines versions."

---

**Structure : 3 colonnes / sections**

---

**Colonne 1 — ✅ Disponible maintenant**

Fonctionnalités en production sur `pro.kalendhair.fr` :

- Gestion organisation & salon (profil, horaires, jours de fermeture)
- Gestion des employés (profil, services associés, horaires individuels)
- Gestion des services (catalogue, durée, prix)
- Rendez-vous (création, modification, annulation, historique)
- Agenda visuel jour & semaine (multi-employés, indicateur temps réel)
- Réservation publique en ligne (`/book/[slug]`, sans commission)
- CRM Clients (fiche, historique, notes internes, conversion invité → client)
- Notifications email (confirmation, annulation, rappel — selon configuration)
- Caisse & Paiements (multi-méthode, reçus DGFIP numérotés)
- Gestion des stocks & produits (catégories, entrées/sorties, alertes)
- Fournisseurs & bons de commande (machine à états complète)
- Commissions des employés (règles automatiques, ajustements manuels)
- Dashboard KPI (CA, taux remplissage, top services, top employés)
- Abonnements SaaS (plans ESSENTIAL/PRO/BUSINESS, cycles mensuel/annuel)
- Super Admin (gestion multi-organisations, impersonation, audit)

---

**Colonne 2 — 🔄 En préparation**

Fonctionnalités identifiées pour les prochains cycles de développement (après le pilote fermé) :

- Configuration des notifications email (RESEND — activation planifiée)
- Export des données clients et paiements (CSV/PDF)
- Inscription en libre-service (`/register`)
- Réinitialisation de mot de passe (self-service)
- Amélioration de l'interface mobile (optimisation responsive)
- Remises et promotions (codes promo, remises sur service)
- Rappels SMS (intégration opérateur à définir)
- Factures fournisseurs attachées aux bons de commande
- Statistiques avancées fournisseurs (coûts, délais, qualité)

---

**Colonne 3 — 📋 Prévu (horizon v2+)**

Fonctionnalités envisagées à plus long terme, en attente de priorisation :

- Paiement en ligne lors de la réservation (intégration Stripe)
- Application mobile native (iOS / Android)
- Blog intégré avec articles conseils salon
- Intégrations tierces (Google Calendar, Instagram Booking, etc.)
- Système de fidélité clients (points, réductions)
- Génération de devis
- Multi-langues (interface en anglais, espagnol)
- API publique pour intégrations partenaires
- Caisse autonome (mode offline)

---

**Note de bas de page :**
> "Vous avez une fonctionnalité à suggérer ? Contactez-nous — les retours des salons pilotes façonnent directement la roadmap."
> CTA : `Suggérer une fonctionnalité →` → `/contact?type=suggestion`

---

### 4.8 Aide `/aide`

**Objectif :** Centraliser toute la documentation, les tutoriels et les canaux de support. Réduire la charge de support en permettant l'auto-résolution. Devenir la référence pour les utilisateurs qui cherchent de l'aide.

**Meta SEO :**
- `title`: "Aide & Support KalendHair — FAQ, tutoriels et guides d'utilisation"
- `description`: "Trouvez les réponses à vos questions sur KalendHair : FAQ, tutoriels pas à pas, guides par module et contact du support."

---

**Structure de la page :**

**Hero :**
- Titre : "Comment pouvons-nous vous aider ?"
- Sous-titre : "FAQ, guides et support — tout ce qu'il faut pour bien utiliser KalendHair."
- Barre de recherche (placeholder en v1 — fonctionnelle en v2 : `"use client"`, filtre les FAQ en temps réel)

---

**Section 1 — FAQ (20 questions, regroupées par thème)**

**Thème : Prise en main**
1. Comment me connecter à mon espace professionnel ?
2. Comment configurer mon salon pour la première fois ?
3. Comment ajouter un employé ?
4. Comment créer un service ?
5. Comment paramétrer les horaires d'ouverture ?

**Thème : Rendez-vous & Agenda**
6. Comment créer un rendez-vous ?
7. Comment modifier ou annuler un rendez-vous ?
8. Comment activer la réservation en ligne ?
9. Que signifient les statuts PENDING, CONFIRMED, COMPLETED ?
10. Comment configurer les créneaux disponibles ?

**Thème : Caisse & Paiements**
11. Comment encaisser un rendez-vous ?
12. Comment imprimer un reçu ?
13. Comment annuler un paiement ?
14. Comment configurer les méthodes de paiement acceptées ?

**Thème : Stocks & Fournisseurs**
15. Comment ajouter un produit à l'inventaire ?
16. Comment enregistrer une entrée ou une sortie de stock ?
17. Comment créer un bon de commande fournisseur ?

**Thème : Abonnement & Facturation**
18. Comment changer de plan ?
19. Comment passer en facturation annuelle ?
20. Comment contacter le support ?

---

**Section 2 — Tutoriels pas à pas** *(v1 : liste structurée, contenu à rédiger)*

Format par tutoriel :
- Titre
- Durée estimée
- Prérequis
- Étapes numérotées
- Capture d'écran à chaque étape clé

**Tutoriels prévus (v1 — squelettes, contenu à rédiger) :**

| # | Titre | Durée | Module |
|---|---|---|---|
| 1 | Configurer son salon de A à Z | 15 min | Salon & Organisation |
| 2 | Créer et gérer ses premiers rendez-vous | 10 min | Rendez-vous |
| 3 | Activer la page de réservation publique | 5 min | Réservation |
| 4 | Encaisser et émettre un reçu | 5 min | Caisse |
| 5 | Gérer son inventaire produits | 10 min | Stocks |
| 6 | Créer des règles de commissions | 10 min | Commissions |
| 7 | Lire et interpréter le dashboard KPI | 10 min | KPI |
| 8 | Changer de plan d'abonnement | 3 min | Abonnement |

---

**Section 3 — Guides par module** *(v1 : liens vers sections de `/fonctionnalites`)*

9 liens avec icône + titre + description 1 ligne → ancre `/fonctionnalites#[module]`

---

**Section 4 — Vidéos** *(placeholder v1)*

> "Les vidéos tutoriels sont en cours de production. Ils seront disponibles dès le lancement de la bêta publique."

Format prévu : Embed YouTube ou vidéo auto-hébergée (Vercel Blob) par module.

---

**Section 5 — Contact support**

- Email : `support@kalendhair.fr` (alias à créer — vers `hasan@netzinformatique.fr`)
- Délai de réponse : "Sous 24h en semaine"
- Pendant le pilote fermé : "Hasan vous répond personnellement."
- CTA : `Envoyer un message →` → `/contact?type=support`

---

**Note dev :** En v1, la barre de recherche est une balise HTML `<input>` sans comportement (`disabled` ou `placeholder` visible). La fonctionnalité de recherche est planifiée en v2 (filtre côté client avec `useState` sur la liste FAQ).

---

### 4.9 Contact `/contact`

**Objectif :** Collecter les demandes d'accès pilote, d'essai gratuit et de support. CTA principal de conversion.

> **Changement v1.1 :** Le formulaire est désormais orienté "Essayer gratuitement" et "Rejoindre les salons pilotes" — non plus seulement "Contact". La page est le point d'atterrissage de tous les CTA du site.

**Meta SEO :**
- `title`: "Essayer KalendHair gratuitement — Rejoignez les premiers salons pilotes"
- `description`: "Demandez un accès gratuit à KalendHair. Premiers salons pilotes — accompagnement personnalisé, aucune carte bancaire requise."

---

**Layout :** Deux colonnes — formulaire gauche, informations droite.

**Formulaire :**

Champs :
- Prénom + Nom (requis)
- Email professionnel (requis)
- Téléphone (optionnel)
- Nom du salon (requis)
- Ville (requis)
- Nombre d'employés : `1` / `2–3` / `4–5` / `6–10` / `10+`
- Type de demande (radio, `hidden` si paramètre URL `?type=`) :
  - "Essai gratuit / Accès pilote" — option par défaut
  - "Demande de démo"
  - "Question sur un plan"
  - "Support technique"
  - "Suggestion de fonctionnalité"
  - "Autre"
- Message libre (optionnel, max 500 caractères)
- Consentement RGPD (requis)

**Action serveur :**
- Logger dans une table `contact_requests` (migration additive) OU envoyer par RESEND quand configuré
- Rediriger vers `/contact/merci`
- Si ni DB ni RESEND : message de succès + log console (non bloquant)

**Informations droite :**
- "🎉 Accès gratuit pendant le pilote"
- "⚡ Réponse personnelle sous 24h en semaine"
- "🛡️ Aucune carte bancaire requise"
- "📍 Hasan vous répond personnellement"

**Page `/contact/merci` :**
- Titre : "Votre demande est bien reçue."
- Corps : "Nous vous répondrons dans les 24 heures avec les informations d'accès ou les prochaines étapes."
- CTA : `Voir la démo en attendant →` → `/demo`

---

### 4.10 Pages légales

**`/mentions-legales`**
- Éditeur : Hasan Biçer (entité juridique à préciser)
- Hébergeur : Vercel Inc. / Neon Inc.
- RGPD : contact DPO
- Contenu à compléter par Hasan

**`/politique-confidentialite`**
- Données collectées (email, nom, données salon, cookies Vercel Analytics)
- Durée de conservation
- Droits : accès, rectification, suppression
- Cookies : Vercel Analytics (anonyme) + SpeedInsights
- Contenu à compléter par Hasan

**`/cgv`**
- Plans et tarifs (référence aux plans actuels)
- Conditions de résiliation
- Politique de remboursement
- Contenu à compléter par Hasan

---

## 5. Navigation & Footer

### Navigation principale (MarketingNav)

**Desktop :**
```
[Logo KalendHair]   Produit ▾   Ressources ▾   Tarifs   [Se connecter]  [Essayer gratuitement →]
```

**Menu déroulant "Produit" :**
- Fonctionnalités → `/fonctionnalites`
- Démonstration → `/demo`
- Pourquoi KalendHair → `/pourquoi-kalendhair`

**Menu déroulant "Ressources" :**
- À propos → `/a-propos`
- Roadmap → `/roadmap`
- Aide & Support → `/aide`

**Liens directs :**
- Tarifs → `/tarifs`

**Actions :**
- "Se connecter" → `https://pro.kalendhair.fr/login` (target blank)
- "Essayer gratuitement →" → `/contact?type=essai` (bouton primaire indigo)

**Comportement :**
- Sticky avec `backdrop-blur` après le scroll du hero
- Fond transparent sur hero sombre → fond blanc/blur en scrollant
- Menu mobile : burger → drawer avec tous les liens

---

### Footer (MarketingFooter)

**Layout :** 4 colonnes (desktop), 2×2 (tablet), 1 colonne (mobile)

```
Colonne 1 — Brand
  Logo + tagline "Gestion de salon. Simple."
  © 2026 KalendHair
  "Fait avec ♥ en France"

Colonne 2 — Produit
  Fonctionnalités → /fonctionnalites
  Démonstration → /demo
  Tarifs → /tarifs
  Roadmap → /roadmap

Colonne 3 — Ressources
  Pourquoi KalendHair → /pourquoi-kalendhair
  À propos → /a-propos
  Aide & Support → /aide
  Contact → /contact

Colonne 4 — Légal & Accès
  Mentions légales
  Politique de confidentialité
  CGV
  ──────────────────
  Espace professionnel ↗  (pro.kalendhair.fr/login)
  Espace admin ↗          (admin.kalendhair.fr)
```

---

## 6. Parcours utilisateur & stratégie de conversion

### CTA principal révisé

> **Changement v1.1 :** Le CTA principal n'est plus "Contact" mais "Essayer gratuitement". La page `/contact` reste le point de conversion, mais son entrée est portée par un message d'invitation à l'essai gratuit plutôt que par une démarche de prise de contact.

**Libellés CTA selon le contexte :**

| Contexte | CTA primaire | CTA secondaire |
|---|---|---|
| Hero homepage | `Essayer gratuitement` | `Voir la démo →` |
| Features showcases | `Essayer gratuitement` | `Voir toutes les fonctionnalités →` |
| Page fonctionnalités | `Essayer gratuitement` | `Voir la démo →` |
| Page démo | `Essayer gratuitement` | `Voir les tarifs →` |
| Page pourquoi | `Essayer gratuitement` | `Voir les fonctionnalités →` |
| Page tarifs | `Essayer gratuitement` | `Voir la démo →` |
| Page à propos | `Rejoindre les premiers salons pilotes` | `Voir la roadmap →` |
| Page roadmap | `Essayer gratuitement` | `Suggérer une fonctionnalité →` |
| Page aide | `Envoyer un message →` | — |
| Navigation | `Essayer gratuitement →` | "Se connecter" (secondaire) |

**Tous les CTA "Essayer gratuitement" pointent vers `/contact?type=essai`.**
Le paramètre `type` est pré-rempli dans le sélecteur du formulaire.

---

### Funnel principal

```
Découverte (SEO / bouche-à-oreille / réseau social)
    ↓
Homepage (/)  OU  page d'entrée SEO (/pourquoi-kalendhair, /fonctionnalites, /demo)
    ↓
[10 secondes] Scan rapide — hero + trust strip
    ↓
[1–2 minutes] Exploration — features, démo, tarifs
    ↓
[30 secondes] Décision
    ↓
CTA "Essayer gratuitement" → /contact?type=essai
    ↓
Formulaire (5 champs obligatoires, 2 min pour remplir)
    ↓
Onboarding manuel par Hasan (PILOT_RUNBOOK.md)
    ↓
Premier accès à pro.kalendhair.fr
```

### Stratégie de conversion (v1)

**Essai gratuit sans frein :** "Essayer gratuitement" est plus engageant que "Nous contacter" — cela positionne la démarche comme un bénéfice pour le salon, pas comme une requête vers une équipe commerciale.

**Accompagnement mis en avant :** "Aucun commercial. Hasan vous répond personnellement." réduit l'anxiété face au formulaire.

**Urgence douce :** "Rejoindre les premiers salons pilotes" crée une rareté factuelle — le pilote est réellement limité en nombre de salons.

**Frein prix supprimé :** "Aucune carte bancaire requise" est mentionné systématiquement sous le CTA.

**Ancrage prix :** BUSINESS (99€) en premier → PRO (59€) perçu comme le bon rapport qualité/prix.

**Confiance sans artifice :** Pas de faux témoignages, pas de faux chiffres. Les indicateurs (14 modules, 3 plans, 0€ commission) sont factuels.

---

## 7. Stratégie SEO

### Mots-clés cibles

**Volume fort :**
- "logiciel salon coiffure"
- "logiciel coiffeur"
- "agenda coiffeur en ligne"

**Volume moyen :**
- "logiciel gestion salon coiffure"
- "réservation en ligne coiffeur"
- "logiciel caisse coiffeur"
- "prise de rendez-vous coiffeur"
- "pourquoi changer logiciel coiffure"

**Longue traîne (nouvelles pages v1.1) :**
- "démonstration logiciel salon coiffure"
- "avantages logiciel gestion salon"
- "alternatives agenda papier coiffeur"
- "fonctionnalités logiciel coiffeur 2026"
- "aide logiciel salon coiffure"
- "roadmap logiciel coiffeur"

### Metadata par page (complète)

| Page | Title | Description |
|---|---|---|
| `/` | "KalendHair — Logiciel de gestion pour salons de coiffure" | "Gérez votre salon avec une seule plateforme : agenda, réservation en ligne, caisse, stocks. Essayez gratuitement." |
| `/fonctionnalites` | "Fonctionnalités — Agenda, Caisse, Stocks, CRM" | "14 modules pour les salons de coiffure : agenda visuel, réservation publique, caisse DGFIP, stocks, KPI." |
| `/demo` | "Démo KalendHair — Découvrez le logiciel en images" | "Explorez les écrans de KalendHair : agenda, caisse, CRM, stocks, dashboard. Tout voir avant d'essayer." |
| `/pourquoi-kalendhair` | "Pourquoi KalendHair ? Bénéfices métier pour votre salon" | "Gain de temps, réduction des oublis, centralisation. Pourquoi les salons choisissent KalendHair." |
| `/tarifs` | "Tarifs KalendHair — À partir de 29€/mois, sans commission" | "Plans transparents : ESSENTIAL 29€, PRO 59€, BUSINESS 99€. Sans engagement, hébergé en Europe." |
| `/a-propos` | "À propos de KalendHair — Histoire et vision" | "Un logiciel construit avec les salons, par une équipe engagée dans l'amélioration continue." |
| `/roadmap` | "Roadmap KalendHair — Fonctionnalités disponibles et à venir" | "Ce qui est disponible, en développement et prévu dans KalendHair." |
| `/aide` | "Aide & Support KalendHair — FAQ, tutoriels, guides" | "FAQ, tutoriels pas à pas et support pour bien utiliser KalendHair." |
| `/contact` | "Essayer KalendHair gratuitement — Premiers salons pilotes" | "Demandez un accès gratuit. Aucune carte bancaire. Réponse personnelle sous 24h." |

### Données structurées (JSON-LD)

**`/` — SoftwareApplication**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "KalendHair",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "AggregateOffer", "lowPrice": "29", "priceCurrency": "EUR" },
  "description": "Logiciel de gestion tout-en-un pour salons de coiffure"
}
```

**`/tarifs` — Offres produit**
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    { "@type": "Offer", "name": "ESSENTIAL", "price": "29", "priceCurrency": "EUR" },
    { "@type": "Offer", "name": "PRO", "price": "59", "priceCurrency": "EUR" },
    { "@type": "Offer", "name": "BUSINESS", "price": "99", "priceCurrency": "EUR" }
  ]
}
```

**`/aide` — FAQPage**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Comment me connecter ?", "acceptedAnswer": { "@type": "Answer", "text": "..." } }
  ]
}
```

### Fichiers SEO techniques

**`src/app/sitemap.ts`** (toutes les pages marketing) :
```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://kalendhair.fr', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://kalendhair.fr/fonctionnalites', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://kalendhair.fr/demo', changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://kalendhair.fr/pourquoi-kalendhair', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://kalendhair.fr/tarifs', changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://kalendhair.fr/a-propos', changeFrequency: 'yearly', priority: 0.5 },
    { url: 'https://kalendhair.fr/roadmap', changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://kalendhair.fr/aide', changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://kalendhair.fr/contact', changeFrequency: 'monthly', priority: 0.6 },
  ]
}
```

**`src/app/robots.ts`** :
```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard/', '/admin/', '/api/'] }],
    sitemap: 'https://kalendhair.fr/sitemap.xml',
  }
}
```

---

## 8. Stratégie des captures produit & salon de démonstration

### Principe directeur

> **Les captures définitives ne seront réalisées qu'après la constitution d'un salon de démonstration complet.**
>
> L'objectif est de présenter une interface crédible et représentative d'un usage réel : un salon avec des données cohérentes, des employés réels (fictifs), des services variés, des rendez-vous passés et futurs, des paiements effectués, des produits en stock, des commandes fournisseurs.
>
> Des captures réalisées sur un salon vide ou partiellement configuré donneraient une image appauvrie du produit et nuiraient à la crédibilité de la vitrine.

---

### Spécifications du salon de démonstration

**Nom :** "L'Atelier Lumière" — Salon de coiffure et beauté (fictif)
**Slug :** `atelier-lumiere`
**Ville :** Paris 11e (fictif)
**Plan :** PRO (pour présenter tous les modules)

**Données à constituer :**

| Donnée | Quantité | Détail |
|---|---|---|
| Employés | 4 | Sophie, Lucas, Marie, Thomas — avec horaires et couleurs d'agenda distincts |
| Services | 12 | Coupe femme, coupe homme, coloration, mèches, soin, brushing, balayage, permanente, coupe enfant, shampoing, lissage, couleur |
| Rendez-vous passés | 30+ | Sur 30 jours glissants — mix statuts CONFIRMED/COMPLETED/CANCELLED |
| Rendez-vous futurs | 10+ | Sur 7 jours à venir — pour remplir l'agenda |
| Clients | 20+ | Mix clients avec historique et invités |
| Paiements | 25+ | Mix CASH/CARD/TRANSFER, reçus numérotés |
| Produits | 15 | Shampoings, après-shampoings, colorations, accessoires |
| Stock | Varié | Certains produits en alerte rupture pour illustrer la fonctionnalité |
| Commissions | 3 règles | PERCENTAGE sur coupe (15%), PERCENTAGE sur coloration (20%), FIXED sur produit vendu |
| Fournisseurs | 3 | Schwarzkopf, L'Oréal Professionnel, Wella |
| Bons de commande | 4 | Mix DRAFT/SENT/RECEIVED/PARTIALLY_RECEIVED |
| Horaires salon | Complets | Lun-Sam 9h-19h |
| Jours de fermeture | 1-2 | Pour illustrer la fonctionnalité |

**Comptes d'accès démo :**
- Owner : `demo@atelier-lumiere.kalendhair.fr` / mot de passe temporaire (réinitialisé après capture)
- Accès uniquement pour la prise de captures — jamais publié sur la vitrine

---

### Captures à réaliser (20 au total)

| # | Capture | Page URL | Section vitrine |
|---|---|---|---|
| 1 | Dashboard KPI — vue mensuelle complète | `/dashboard/kpi` | Hero homepage, page démo |
| 2 | Agenda semaine — 4 employés, RDV colorés | `/dashboard/agenda` | Feature showcase 1, démo |
| 3 | Agenda jour — vue détaillée 1 employé | `/dashboard/agenda?view=day` | Page fonctionnalités |
| 4 | Réservation publique — étape choix service | `/book/atelier-lumiere` | Feature showcase 2, démo |
| 5 | Réservation publique — étape choix créneau | `/book/atelier-lumiere/confirm` | Page fonctionnalités |
| 6 | Liste rendez-vous avec filtres actifs | `/dashboard/appointments` | Page fonctionnalités, démo |
| 7 | Détail rendez-vous + historique | `/dashboard/appointments/[id]` | Page fonctionnalités |
| 8 | Encaissement rendez-vous | `/dashboard/appointments/[id]/pay` | Feature showcase 3 |
| 9 | Reçu imprimable | `/dashboard/payments/[id]/receipt` | Feature showcase 3, démo caisse |
| 10 | Fiche client avec historique | `/dashboard/clients/[id]` | Feature showcase 4, démo CRM |
| 11 | Liste clients | `/dashboard/clients` | Page fonctionnalités |
| 12 | Hub inventaire avec alertes rupture | `/dashboard/inventory` | Page fonctionnalités, démo stocks |
| 13 | Liste produits | `/dashboard/inventory/products` | Page fonctionnalités |
| 14 | Vue commissions employé | `/dashboard/employees/[id]/commissions` | Page fonctionnalités |
| 15 | Liste bons de commande | `/dashboard/purchase-orders` | Page fonctionnalités |
| 16 | Dashboard abonnement | `/dashboard/billing` | Page tarifs |
| 17 | Catalogue plans | `/dashboard/plans` | Page tarifs |
| 18 | Hub dashboard — liste modules | `/dashboard` | Page démo |
| 19 | Liste paiements filtrée | `/dashboard/payments` | Démo caisse |
| 20 | Super Admin — liste organisations | `/admin/organizations` | (interne / communication) |

---

### Spécifications techniques des captures

- **Résolution :** 2560×1600 (Retina 2x) — affichées à 1280×800
- **Format source :** PNG — optimisé en WebP/AVIF pour la prod via `next/image`
- **Navigateur :** Chrome 127+ macOS — chrome browser frame via outil tiers (Screely, Carbon ou similaire)
- **Données :** Salon "L'Atelier Lumière" — aucune donnée de vrai salon
- **Post-traitement :** Masquage de l'URL exacte si nécessaire. Aucune retouche sur les données.

---

### Placeholders pendant le développement

Pendant la phase de développement de la vitrine, avant constitution du salon de démonstration :

```jsx
<ScreenshotFrame label="Agenda semaine — capture à venir">
  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
    <span className="text-slate-400 text-sm">
      Capture en cours de préparation — salon de démonstration
    </span>
  </div>
</ScreenshotFrame>
```

La structure HTML est définitive — seule l'image est remplacée, sans refactoring.

---

## 9. Hiérarchie visuelle & design system

### Palette de couleurs

```
--marketing-bg-dark:    #0F0F1A   (hero, sections sombres — slate-950 nuancé indigo)
--marketing-bg-light:   #FFFFFF   (sections claires)
--marketing-bg-subtle:  #F8F8FC   (fond carte, alternance sections)
--marketing-accent:     #4F46E5   (indigo-600 — identique à l'app)
--marketing-accent-2:   #818CF8   (indigo-400 — gradients, highlights)
--marketing-text-dark:  #0F172A   (slate-900)
--marketing-text-muted: #64748B   (slate-500)
--marketing-border:     #E2E8F0   (slate-200)
```

**Philosophie :** Alternance claire-sombre pour créer du rythme. Hero et CTA finale = sombre. Contenu informatif = clair.

### Typographie (Geist Sans, déjà chargé)

| Usage | Taille | Poids |
|---|---|---|
| Headline hero | 56px / 4xl | 700 |
| Headline section | 36px / 3xl | 700 |
| Sous-titre section | 20px | 400 |
| Corps | 16px | 400 |
| Badge / caption | 12px | 500 |
| Nav links | 14px | 500 |
| CTA button | 15px | 600 |

**Espacement :** `py-24` (desktop) / `py-16` (mobile) entre sections. Max 65 caractères par ligne.

### Composants visuels

- **Badge section :** `rounded-full bg-indigo-50 text-indigo-700 text-xs px-3 py-1`
- **Feature card :** `bg-white border border-slate-200 shadow-sm rounded-xl`
- **Screenshot frame :** `rounded-xl shadow-2xl ring-1 ring-slate-200`
- **CTA primaire :** `bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-3`
- **CTA secondaire :** `text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg px-6 py-3`
- **Roadmap badge ✅ :** `bg-green-50 text-green-700 border border-green-200`
- **Roadmap badge 🔄 :** `bg-amber-50 text-amber-700 border border-amber-200`
- **Roadmap badge 📋 :** `bg-slate-50 text-slate-600 border border-slate-200`

### Layout & grilles

- **Max-width :** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Sections alternées :** Feature showcases alternent capture-gauche/texte-droite
- **Grid tarifs :** `grid-cols-3` desktop, `grid-cols-1` mobile — PRO avec `ring-2 ring-indigo-600`
- **Grid démo onglets :** Barre onglets horizontale desktop, select mobile

---

## 10. Architecture technique

### Route group et isolation

Le layout `(marketing)` est **totalement indépendant** des layouts `(dashboard)`, `(admin)` et `(auth)`. Il n'importe aucun code métier.

### Pages statiques vs dynamiques

| Page | Type | Justification |
|---|---|---|
| `/` | `○ Static` | Contenu fixe, SEO maximal |
| `/fonctionnalites` | `○ Static` | Contenu fixe |
| `/demo` | `○ Static` | Onglets gérés côté client, pas de données DB |
| `/pourquoi-kalendhair` | `○ Static` | Contenu fixe |
| `/tarifs` | `○ Static` | Prix hardcodés |
| `/a-propos` | `○ Static` | Contenu fixe |
| `/roadmap` | `○ Static` | Mise à jour manuelle acceptable |
| `/aide` | `○ Static` | FAQ statique (recherche = v2) |
| `/contact` | `ƒ Dynamic` | Server Action formulaire |
| `/contact/merci` | `○ Static` | Page de confirmation |
| Légales | `○ Static` | Contenu fixe |

**Note :** Les prix de `/tarifs` et l'état de `/roadmap` sont hardcodés pour le rendu statique. Synchronisation manuelle lors des mises à jour.

### Composants "use client" (minimum nécessaire)

- `PricingToggle` — bascule mensuel/annuel
- `FaqAccordion` — open/close FAQ (aide + tarifs)
- `MobileMenu` — burger menu
- `ContactForm` — `useActionState`
- `DemoScreenTab` — navigation onglets démo

**Tous les autres composants sont Server Components.**

---

## 11. Composants à créer

### Composants marketing (`src/app/(marketing)/components/`)

| Composant | Type | Pages |
|---|---|---|
| `MarketingNav` | Server | Toutes |
| `MarketingFooter` | Server | Toutes |
| `HeroSection` | Server | `/` |
| `TrustStrip` | Server | `/` |
| `ModuleGrid` | Server | `/` |
| `FeatureBlock` | Server | `/`, `/fonctionnalites` |
| `PricingTeaser` | Server | `/` |
| `PricingCard` | Server | `/tarifs` |
| `PricingToggle` | **Client** | `/tarifs` |
| `PricingTable` | Server | `/tarifs` |
| `FaqAccordion` | **Client** | `/tarifs`, `/aide` |
| `FaqItem` | **Client** | `/tarifs`, `/aide` |
| `TestimonialCard` | Server | `/` (placeholder) |
| `CtaBanner` | Server | Toutes |
| `StatCard` | Server | `/` |
| `ContactForm` | **Client** | `/contact` |
| `ScreenshotFrame` | Server | `/`, `/fonctionnalites`, `/demo` |
| `SectionBadge` | Server | Toutes |
| `PageHero` | Server | Pages secondaires |
| `DemoScreenTab` | **Client** | `/demo` |
| `RoadmapItem` | Server | `/roadmap` |
| `RoadmapColumn` | Server | `/roadmap` |
| `BenefitCard` | Server | `/pourquoi-kalendhair` |
| `ComparisonTable` | Server | `/pourquoi-kalendhair`, `/fonctionnalites` |
| `HelpCategoryCard` | Server | `/aide` |
| `TutorialCard` | Server | `/aide` |

**Total : 26 composants** — 5 Client, 21 Server.

### Fichiers additionnels

| Fichier | Description |
|---|---|
| `src/app/(marketing)/contact/actions.ts` | Server Action formulaire contact |
| `src/app/sitemap.ts` | Sitemap XML — 9 URLs marketing |
| `src/app/robots.ts` | robots.txt |
| `src/lib/marketing-constants.ts` | Plans, prix, modules, roadmap items (source de vérité) |

---

## 12. Contraintes & décisions de périmètre

### Ce que cette PR NE fait PAS

- ❌ Aucune modification du back-office (`/dashboard/`, `/admin/`)
- ❌ Aucune modification de Prisma, Neon, auth
- ❌ Aucune modification de `/book/`
- ❌ Aucune implémentation de `/register`
- ❌ Aucun nouveau package npm

### Décisions actées (v1.1)

| Décision | Justification |
|---|---|
| CTA "Essayer gratuitement" → `/contact?type=essai` | Plus engageant que "Contact" — positionne le bénéfice avant la démarche |
| Captures après salon de démonstration | Interface vide = anti-vitrine. Mieux vaut un bon placeholder qu'une mauvaise capture. |
| Prix hardcodés sur `/tarifs` | Rendu statique — synchro manuelle acceptée pour v1 |
| Roadmap sans engagement contractuel | Mention légale obligatoire en haut de page |
| `/roadmap` remplace `/changelog` en v1 | Scope réduit, plus utile pour le prospect |
| Comparatif concurrents neutre | Factuel et vérifiable avant publication — jamais diffamatoire |
| Barre de recherche `/aide` = placeholder | Fonctionnalité v2 — HTML prêt pour l'upgrade |
| `src/lib/marketing-constants.ts` | Source de vérité unique — plans, prix, features, roadmap items |

### Dépendances pour le développement

| Dépendance | État | Responsable |
|---|---|---|
| Salon de démonstration "L'Atelier Lumière" | À constituer avant les captures | Hasan / Claude Code |
| 20 captures produit | Après constitution du salon démo | Hasan |
| Contenu légal (CGV, mentions, RGPD) | À rédiger | Hasan |
| Email `contact@kalendhair.fr` | Alias à créer sur IONOS | Hasan |
| Contenu `/a-propos` (histoire personnelle) | À rédiger | Hasan |
| Témoignages pilotes | Disponibles après 4 semaines de pilote | Pilote |
| RESEND (formulaire contact) | Dépend validation Hasan | Hasan |

---

## 13. Priorités d'implémentation

### Sprint Marketing v1 (une fois ce document validé par ChatGPT)

**Phase 1 — Structure & navigation (jour 1)**
1. `src/app/(marketing)/layout.tsx`
2. `MarketingNav` (avec menus déroulants Produit / Ressources)
3. `MarketingFooter`
4. `src/app/robots.ts` + `src/app/sitemap.ts`
5. Migration `src/app/page.tsx` → `src/app/(marketing)/page.tsx`

**Phase 2 — Homepage (jours 2–3)**
6. `HeroSection` (placeholder capture)
7. `TrustStrip` + `ModuleGrid`
8. 4 × `FeatureBlock` (placeholders captures)
9. `PricingTeaser`
10. `CtaBanner` finale

**Phase 3 — Pages produit (jours 4–5)**
11. `/demo` — `DemoScreenTab` + 7 onglets placeholders
12. `/fonctionnalites` — 10 sections + `ComparisonTable`
13. `/pourquoi-kalendhair` — 5 sections bénéfices + comparatif
14. `/tarifs` — `PricingCard` × 3 + `PricingToggle` + `PricingTable` + `FaqAccordion`

**Phase 4 — Pages ressources (jour 6)**
15. `/a-propos` — squelette avec zones de contenu
16. `/roadmap` — `RoadmapColumn` × 3 avec items `src/lib/marketing-constants.ts`
17. `/aide` — `FaqAccordion` × 5 thèmes + `TutorialCard` × 8 + `HelpCategoryCard`
18. `/contact` + `actions.ts` + `/contact/merci`
19. Pages légales (squelettes HTML)

**Phase 5 — SEO & accessibilité (jour 7)**
20. `generateMetadata()` sur toutes les pages
21. JSON-LD (SoftwareApplication, FAQPage, ItemList)
22. Aria-labels, focus visible, `prefers-reduced-motion`
23. Responsive test (mobile, tablet, desktop)
24. `next/image` avec lazy loading sur toutes les captures

**Phase 6 — Salon de démonstration & captures (après phase 5)**
25. Constitution du salon "L'Atelier Lumière" (via Super Admin + script de seed)
26. Réalisation des 20 captures
27. Optimisation WebP/AVIF
28. Intégration finale dans les `ScreenshotFrame`

---

_Document créé le 2026-06-25 — Phase Product 1 — Marketing Website v1._
_Révision v1.1 — 2026-06-25 : ajout /demo, /pourquoi-kalendhair, /a-propos, /roadmap, /aide ; révision CTA vers "Essayer gratuitement" ; stratégie salon de démonstration._
_Auteur : Claude Sonnet 4.6. À valider par ChatGPT avant tout développement._
