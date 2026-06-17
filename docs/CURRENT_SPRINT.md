# CURRENT_SPRINT — Sprint en cours (KalendHair 4.0)

> À lire **avant d'agir**. Claude ne travaille que sur ce qui est dans ce sprint.

---

## Sprint actuel

**Sprint 3 — Validation PostgreSQL + Migration Prisma** (Phase 3 de la roadmap).

## Objectifs du sprint

- [x] Docker Desktop installé et opérationnel (v29.5.3 / Compose v5.1.4).
- [x] Container `kalendhair_postgres` démarré (`postgres:16-alpine`, port 5432).
- [x] `prisma migrate dev --name init` ✅ — migration `20260617014217_init` appliquée.
- [x] 21 tables métier + 13 enums créés en base PostgreSQL.
- [x] `prisma generate` ✅ — Prisma Client régénéré.
- [x] `typecheck` ✅
- [x] `lint` ✅
- [x] `build` ✅
- [ ] Validation ChatGPT + merge PR vers `main`. Tag `v0.4.0-db-migration`.

## Résultat de la migration

| Élément | Valeur |
|---|---|
| Fichier migration | `prisma/migrations/20260617014217_init/migration.sql` |
| Tables créées | 21 (+ `_prisma_migrations` Prisma interne) |
| Enums créés | 13 |
| PostgreSQL | `localhost:5432` · DB `kalendhair_dev` · user `kalendhair` |

## Hors périmètre de ce sprint

- Authentification (code, routes, sessions).
- Pages UI et composants.
- Services métier.
- Seed de données.

## Condition de sortie du sprint

> PR `feature/sprint3-db-migration` validée par ChatGPT, mergée dans `main`, tag `v0.4.0-db-migration`.

---

## Sprints précédents (clôturés)

- **Phase 0 — Fondation documentaire** ✅ — tag `v0.1.0-foundations`.
- **Sprint 1 — Bootstrap technique** ✅ — tag `v0.2.0-bootstrap`.
- **Sprint 2 — Schéma Prisma** ✅ — tag `v0.3.0-prisma-schema`.

---

_Dernière mise à jour : 2026-06-17._
