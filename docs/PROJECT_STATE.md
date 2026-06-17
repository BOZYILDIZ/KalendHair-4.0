# PROJECT_STATE — État actuel du projet (KalendHair 4.0)

> À lire **en premier** au début de chaque session. À **mettre à jour à la fin** de chaque session.

---

## Phase actuelle

**Phase 1 / Sprint 1 — Bootstrap technique : TERMINÉ et mergé** ✅

**Phase 2 / Sprint 2 — Schéma Prisma : TERMINÉ et mergé** ✅

**Sprint 3 — Validation PostgreSQL + Migration Prisma : TERMINÉ et mergé** ✅

**Sprint 4 — Authentification ProUser (OWNER) : TERMINÉ et mergé** ✅

**Sprint 5 — Organization & Salon Management : TERMINÉ et mergé** ✅

## État du code

- **Auth custom** : `jose` (JWT HS256, 24h) + `bcryptjs` + cookie `HttpOnly`.
- **Proxy Next.js 16** (`src/proxy.ts`) : protection `/dashboard/:path*`.
- **Pages** :
  - `/login` — formulaire ProUser OWNER
  - `/dashboard` — hub (nom org + nom salon + navigation + logout)
  - `/dashboard/organization` — lecture + modification Organisation
  - `/dashboard/salon` — lecture + modification Salon
- **Permissions** : `src/lib/permissions/` — `tenant.ts` + `organization.permissions.ts` + `salon.permissions.ts`
- **Services métier** : `src/features/organizations/` + `src/features/salons/`
- **Validation** : `zod@4.4.3` — Server Actions
- **Seed DEV** : `owner@test.local / Test1234!` (Organisation "Salon Test" + Salon "Salon Test").
- **Schéma Prisma** : 21 modèles + 13 enums + 2 migrations appliquées.
- **PostgreSQL local** : container `kalendhair_postgres` (Docker Compose, port 5432).

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
| zod | 4.4.3 |
| Gestionnaire | pnpm 11.5 |
| Node (cible) | 22 LTS (`.nvmrc`) |

## Vérifications (toutes ✅)

`pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm db:seed` → **OK**.
Test manuel complet validé par Hasan (login, /dashboard, /dashboard/organization, /dashboard/salon, persistance en base).

## Migrations appliquées

| Nom | Description |
|---|---|
| `20260617014217_init` | Schéma initial (21 tables + 13 enums) |
| `20260618000001_salon_org_unique` | Contrainte unique `Salon.organizationId` (1 salon/org MVP) |

## Git / Release

- `main` = seule branche stable active.
- Tags : `v0.1.0-foundations` · `v0.2.0-bootstrap` · `v0.3.0-prisma-schema` · `v0.4.0-db-migration` · `v0.5.0-auth` · **`v0.6.0-org-salon`**.
- PR **#9** (`feature/sprint5-org-salon`) **mergée** dans `main` (merge commit `fd15428`).
- Branche `feature/sprint5-org-salon` **supprimée** (locale + distante).

## Base de données

- PostgreSQL local via Docker Compose — base DEV isolée.
- Migrations appliquées : voir tableau ci-dessus.
- Seed DEV : `owner@test.local / Test1234!` + Salon "Salon Test" (commande : `pnpm db:seed`).

## Prochaine étape

Conception Sprint 6 (à définir) — prochains modules métier (Employees, Services, ou autre selon roadmap).

---

_Dernière mise à jour : 2026-06-18 — PR #9 mergée, tag v0.6.0-org-salon. Sprint 5 TERMINÉ._
