# PROJECT_STATE — État actuel du projet (KalendHair 4.0)

> À lire **en premier** au début de chaque session. À **mettre à jour à la fin** de chaque session.

---

## Phase actuelle

**Phase 1 / Sprint 1 — Bootstrap technique : RÉALISÉ** (en attente de validation).

## État du code

- **Aucune fonctionnalité métier.** Aucun modèle Prisma métier, aucun auth, aucun connecteur.
- Socle technique en place : **Next.js 16.2.9** (App Router, `src/`), **TypeScript strict**,
  **Tailwind CSS v4**, **Prisma 6.19.3 + PostgreSQL**, **ESLint 9 + Prettier**.
- Structure modulaire vide conforme à `docs/ARCHITECTURE.md` (`src/features/*`, `src/lib/*`).
- Page d'accueil = placeholder technique neutre.

## Stack & versions installées

| Élément | Version |
|---|---|
| Next.js | 16.2.9 (version stable proposée par create-next-app) |
| React | 19.2.4 |
| TypeScript | 5.x (strict + `noUncheckedIndexedAccess`) |
| Tailwind CSS | v4 |
| Prisma / @prisma/client | 6.19.3 |
| Gestionnaire | pnpm 11.5 |
| Node (cible) | 22 LTS (`.nvmrc`) |

## Vérifications (toutes ✅)

`pnpm typecheck` · `pnpm lint` · `pnpm format:check` · `pnpm build` · `pnpm prisma validate` → **OK**.

## Git / Release

- `main` = fondations Phase 0 (tag `v0.1.0-foundations`).
- Branche de travail : **`feature/bootstrap-nextjs`** (ce Sprint 1).
- PR vers `main` à ouvrir via `gh` après ce commit. **Pas de merge auto.**

## Base de données

- PostgreSQL local via **Docker Compose** (`docker-compose.yml`) — base de DEV isolée, jamais la prod.
- `schema.prisma` minimal (datasource + generator), **aucun modèle**. Modélisation = Phase 2.

## Prochaine étape

Validation Hasan / ChatGPT du bootstrap, puis **Phase 2** (Auth + Organizations + Salons),
avec modélisation des entités Prisma (voir `docs/DATABASE.md`).

---

_Dernière mise à jour : 2026-06-17 — Sprint 1 bootstrap technique réalisé, vérifications OK._
