# KalendHair 4.0

SaaS moderne de gestion de rendez-vous pour salons de coiffure.

> ⚠️ Nouveau projet **isolé**. Ne pas confondre avec `kalendhair.fr` (production actuelle,
> intouchable) ni avec l'ancien KalendHair. Voir `docs/`.

## Stack

- **Next.js** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4**
- **Prisma** + **PostgreSQL**
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

# 3. Base de données PostgreSQL locale (Docker)
docker compose up -d

# 4. Générer le client Prisma
pnpm db:generate

# 5. Lancer le serveur de dev
pnpm dev
```

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
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:validate` | Valider le schéma Prisma |

## Architecture

Projet **multi-tenant**, organisé **par modules / features** (`src/features/*`),
avec séparation UI / logique métier / accès données (`src/lib/*`).
Voir `docs/ARCHITECTURE.md` et `docs/DATABASE.md`.

> État actuel : **Sprint 1 — bootstrap technique**. Aucune fonctionnalité métier.
