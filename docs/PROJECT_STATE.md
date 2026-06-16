# PROJECT_STATE — État actuel du projet (KalendHair 4.0)

> À lire **en premier** au début de chaque session. À **mettre à jour à la fin** de chaque session.

---

## Phase actuelle

**Phase 1 / Sprint 1 — Bootstrap technique : TERMINÉ et mergé** ✅
(Sprint 2 non démarré.)

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

- `main` contient les fondations (tag `v0.1.0-foundations`) **et** le bootstrap technique.
- PR **#2** (`feature/bootstrap-nextjs`) **mergée** dans `main` (merge commit `cf7c936`).
- Branche `feature/bootstrap-nextjs` **supprimée** (locale + distante).
- Tag **`v0.2.0-bootstrap`** créé sur `main`.
- Prochaine étape Git : démarrage du **Sprint 2** sur une branche dédiée (non commencé).

## Base de données

- PostgreSQL local via **Docker Compose** (`docker-compose.yml`) — base de DEV isolée, jamais la prod.
- `schema.prisma` minimal (datasource + generator), **aucun modèle**. Modélisation = Phase 2.

## Prochaine étape

Validation Hasan / ChatGPT du bootstrap, puis **Phase 2** (Auth + Organizations + Salons),
avec modélisation des entités Prisma (voir `docs/DATABASE.md`).

---

_Dernière mise à jour : 2026-06-17 — PR #2 mergée dans main, tag v0.2.0-bootstrap. Sprint 2 non démarré._
