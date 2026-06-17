# PROJECT_STATE — État actuel du projet (KalendHair 4.0)

> À lire **en premier** au début de chaque session. À **mettre à jour à la fin** de chaque session.

---

## Phase actuelle

**Phase 1 / Sprint 1 — Bootstrap technique : TERMINÉ et mergé** ✅

**Phase 2 / Sprint 2 — Schéma Prisma : TERMINÉ et mergé** ✅

**Sprint 3 — Validation PostgreSQL + Migration Prisma : TERMINÉ et mergé** ✅

**Sprint 4 — Authentification ProUser (OWNER) : TERMINÉ et mergé** ✅

## État du code

- **Auth custom** : `jose` (JWT HS256, 24h) + `bcryptjs` + cookie `HttpOnly`.
- **Proxy Next.js 16** (`src/proxy.ts`) : protection `/dashboard/:path*`.
- **Pages** : `/login` (formulaire) · `/dashboard` (placeholder protégé).
- **Seed DEV** : `owner@test.local / Test1234!` (Organisation "Salon Test").
- **Permissions** : `src/lib/auth/permissions.ts` placeholder (Sprint 5+).
- **Schéma Prisma complet** : 21 modèles + 13 enums + migration `20260617014217_init` appliquée.
- **PostgreSQL local** : container `kalendhair_postgres` (Docker Compose, port 5432).
- Aucune page métier, aucun service métier.

## Stack & versions installées

| Élément | Version |
|---|---|
| Next.js | 16.2.9 |
| React | 19.2.4 |
| TypeScript | 5.x (strict + `noUncheckedIndexedAccess`) |
| Tailwind CSS | v4 |
| Prisma / @prisma/client | 6.19.3 |
| jose | 6.2.3 |
| bcryptjs | 3.0.3 |
| tsx | 4.22.4 |
| Gestionnaire | pnpm 11.5 |
| Node (cible) | 22 LTS (`.nvmrc`) |

## Vérifications (toutes ✅)

`pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm db:seed` → **OK**.

## Git / Release

- `main` = seule branche stable active.
- Tags : `v0.1.0-foundations` · `v0.2.0-bootstrap` · `v0.3.0-prisma-schema` · `v0.4.0-db-migration` · **`v0.5.0-auth`**.
- PR **#7** (`feature/sprint4-auth`) **mergée** dans `main` (merge commit `3b25821`).
- Branche `feature/sprint4-auth` **supprimée** (locale + distante).

## Base de données

- PostgreSQL local via Docker Compose — base DEV isolée.
- Migration `20260617014217_init` appliquée (21 tables + 13 enums).
- Seed DEV : `owner@test.local / Test1234!` (commande : `pnpm db:seed`).

## Prochaine étape

Conception Sprint 5 (à définir) — permissions fines et/ou premiers modules métier.

---

_Dernière mise à jour : 2026-06-17 — PR #7 mergée, tag v0.5.0-auth. Sprint 4 terminé._
