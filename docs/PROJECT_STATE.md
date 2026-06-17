# PROJECT_STATE — État actuel du projet (KalendHair 4.0)

> À lire **en premier** au début de chaque session. À **mettre à jour à la fin** de chaque session.

---

## Phase actuelle

**Phase 1 / Sprint 1 — Bootstrap technique : TERMINÉ et mergé** ✅

**Phase 2 / Sprint 2 — Schéma Prisma : TERMINÉ et mergé** ✅
(Sprint 3 non démarré.)

## État du code

- **Schéma Prisma complet** : 21 modèles + 13 enums + relations + index + contraintes.
  Migration non encore appliquée (PostgreSQL local requis).
- Aucune page UI, aucun service métier, aucune auth.
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
- `schema.prisma` **COMPLET** : 21 modèles, 13 enums, relations, index, `@@map` snake_case.
- Migration différée : `prisma migrate dev --name init` à lancer quand PostgreSQL sera disponible.

## Git / Release

- `main` = seule branche active.
- Tags : `v0.1.0-foundations` · `v0.2.0-bootstrap` · **`v0.3.0-prisma-schema`**.
- PR **#4** (`feature/prisma-schema`) **mergée** dans `main` (merge commit `3ae299c`).
- Branche `feature/prisma-schema` **supprimée** (locale + distante).
- Prochaine étape Git : **Sprint 3** sur une branche dédiée (non commencé).

## Prochaine étape

Validation Hasan / ChatGPT, puis **Sprint 3 — Authentification** (ProUser login, sessions, guards).

---

_Dernière mise à jour : 2026-06-17 — PR #4 mergée, tag v0.3.0-prisma-schema. Sprint 2 terminé._
