# PROJECT_STATE — État actuel du projet (KalendHair 4.0)

> À lire **en premier** au début de chaque session. À **mettre à jour à la fin** de chaque session.

---

## Phase actuelle

**Phase 1 / Sprint 1 — Bootstrap technique : TERMINÉ et mergé** ✅

**Phase 2 / Sprint 2 — Schéma Prisma : TERMINÉ et mergé** ✅

**Sprint 3 — Validation PostgreSQL + Migration Prisma : TERMINÉ et mergé** ✅

**Sprint 4 — Authentification ProUser (OWNER) : EN COURS** 🔄
(Implémentation terminée — PR en attente de review.)

## État du code

- **Auth custom** : `jose` (JWT HS256, 24h) + `bcryptjs` + cookie `HttpOnly`.
- **Proxy Next.js 16** (`src/proxy.ts`) : protection `/dashboard/*`.
- **Pages** : `/login` (formulaire) · `/dashboard` (placeholder protégé).
- **Seed DEV** : `owner@test.local / Test1234!` créé en base.
- **Schéma Prisma complet** : 21 modèles + 13 enums + migration appliquée.
- **PostgreSQL local** : container `kalendhair_postgres` (Docker Compose, port 5432).
- Aucune page métier, aucun service métier.
- Socle : **Next.js 16.2.9** · **TypeScript strict** · **Tailwind v4** · **Prisma 6.19.3** · **pnpm 11.5**.

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

## Vérifications Sprint 4 (toutes ✅)

`pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm db:seed` → **OK**.

## Git / Release

- `main` = branche stable (Sprints 1–3 + clôture docs).
- Tags : `v0.1.0-foundations` · `v0.2.0-bootstrap` · `v0.3.0-prisma-schema` · `v0.4.0-db-migration`.
- Branche active : **`feature/sprint4-auth`**.
- Tag cible après merge : `v0.5.0-auth`.

## Base de données

- PostgreSQL local via Docker Compose — base DEV isolée.
- Migration `20260617014217_init` appliquée (21 tables + 13 enums).
- Seed DEV : `owner@test.local / Test1234!` (Organisation "Salon Test").

## Prochaine étape

Review ChatGPT → merge PR Sprint 4 → tag `v0.5.0-auth` → **Sprint 5** (à définir).

---

_Dernière mise à jour : 2026-06-17 — Sprint 4 auth implémenté. PR en attente de review._
