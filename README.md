# KalendHair 4.0

SaaS moderne de gestion de rendez-vous pour salons de coiffure.

> ⚠️ Nouveau projet **isolé**. Ne pas confondre avec `kalendhair.fr` (production actuelle,
> intouchable) ni avec l'ancien KalendHair. Voir `docs/`.

## Stack

- **Next.js 16** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4**
- **Prisma 6** + **PostgreSQL 16**
- **jose** (JWT HS256) + **bcryptjs** (auth custom)
- **Zod** (validation)
- **ESLint** + **Prettier**
- Gestionnaire de paquets : **pnpm**

## Prérequis

- Node **22 LTS** (voir `.nvmrc`)
- pnpm
- Docker (pour la base PostgreSQL locale)

## Démarrage local

```bash
# 1. Dépendances
pnpm install

# 2. Variables d'environnement
cp .env.example .env
# Éditer .env : DATABASE_URL + JWT_SECRET (voir .env.example)

# 3. Base de données PostgreSQL locale (Docker)
docker compose up -d

# 4. Appliquer les migrations
pnpm db:migrate

# 5. Générer le client Prisma
pnpm db:generate

# 6. Seeder la base DEV
pnpm db:seed

# 7. Lancer le serveur de dev
pnpm dev
```

## Compte DEV

Après le seed :

| Champ | Valeur |
|---|---|
| Email | `owner@test.local` |
| Mot de passe | `Test1234!` |
| Rôle | `OWNER` |
| Organisation | Salon Test |

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build de production |
| `pnpm start` | Serveur de production |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `pnpm format` / `pnpm format:check` | Prettier (écriture / vérification) |
| `pnpm db:generate` | Générer le client Prisma |
| `pnpm db:migrate` | Migration de développement |
| `pnpm db:seed` | Seeder la base DEV |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:validate` | Valider le schéma Prisma |

## Architecture

Projet **multi-tenant**, organisé **par modules / features** (`src/features/*`),
avec séparation UI / logique métier / accès données (`src/lib/*`).
Voir `docs/ARCHITECTURE.md` et `docs/DATABASE.md`.

## État actuel

**Sprint 18 — Abonnements SaaS & Facturation (Core sans Stripe)** — TERMINÉ ✅

| Sprint | Description | Tag |
|---|---|---|
| Phase 0 | Fondations documentaires | `v0.1.0-foundations` |
| Sprint 1 | Bootstrap Next.js / Prisma / TypeScript | `v0.2.0-bootstrap` |
| Sprint 2 | Schéma Prisma complet (21 modèles) | `v0.3.0-prisma-schema` |
| Sprint 3 | Migration PostgreSQL | `v0.4.0-db-migration` |
| Sprint 4 | Auth custom jose (OWNER) | `v0.5.0-auth` |
| Sprint 5 | Gestion Organisation + Salon | `v0.6.0-org-salon` |
| Sprint 6 | Employés + Services + Associations | `v0.7.0-employees-services` |
| Sprint 7 | Horaires salon + employé + jours fermeture + disponibilité | `v0.8.0-schedules` |
| Sprint 8 | Rendez-vous CRUD + slots disponibles + historique | `v0.9.0-appointments` |
| Sprint 9 | Agenda visuel Jour & Semaine + navigation + filtre employé | `v1.0.0-agenda` |
| Sprint 10 | CRM Clients : liste, recherche, fiche, stats, historique, notes internes | `v1.1.0-crm-clients` |
| Sprint 11 | Réservation publique /book/[slug] : wizard URL, slots timezone-aware, isolation tenant | `v1.2.0-public-booking` |
| Sprint 12 | Notifications email : confirmation + annulation, fire-and-forget, journalisation DB | `v1.3.0-email-notifications` |
| Sprint 13 | Dashboard KPI : CA, RDV, clients, taux remplissage, top services, top employés, sélecteur période | `v1.4.0-dashboard-kpi` |
| Sprint 14 | Module Caisse POS : encaissement RDV, paiement libre, historique filtré, annulation, CA réel | `v1.5.0-payments-pos` |
| Sprint 15 | Rappels email 24h (Vercel CRON + Resend) · Numérotation DGFIP des reçus · Reçu imprimable | `v1.6.0-reminders-receipts` |
| Sprint 16 | Stocks & Produits : catégories, CRUD produits, entrées/sorties, vente avec encaissement, alertes rupture | `v1.7.0-inventory` |
| Sprint 17 | Fournisseurs & Bons de Commande : CRUD fournisseurs, machine à états commandes, réception partielle/complète, StockMovement PURCHASE_RECEIPT | `v1.8.0-suppliers-purchase-orders` |
| Sprint 18 | Abonnements SaaS Core : plans ESSENTIAL/PRO/BUSINESS, feature gates, quotas, simulation sans Stripe | `v1.9.0-billing-core` |
