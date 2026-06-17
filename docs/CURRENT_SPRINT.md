# CURRENT_SPRINT — Sprint en cours (KalendHair 4.0)

> À lire **avant d'agir**. Claude ne travaille que sur ce qui est dans ce sprint.

---

## Sprint actuel

**Sprint 2 — Schéma Prisma** (Phase 2 de la roadmap).

## Objectifs du sprint

- [x] Écrire le schéma Prisma complet (21 modèles, 13 enums) avec relations, index et contraintes.
- [x] `prisma validate` ✅
- [x] `prisma format` ✅
- [x] `typecheck` ✅
- [x] `lint` ✅
- [x] `build` ✅
- [ ] `prisma migrate dev --name init` — **différé** (PostgreSQL local non disponible).
- [x] Validation ChatGPT + merge PR #4 vers `main`. Tag `v0.3.0-prisma-schema`.

## Arbitrages appliqués

| # | Décision |
|---|---|
| 1 | IDs : `cuid()` |
| 2 | Argent : `Int` centimes + `currency` |
| 3 | Horaires : `Int` minutes depuis minuit |
| 4 | Client : global cross-tenant |
| 5 | Invité : champs `guest*` sur `Appointment` |
| 6 | RDV : 1 service par RDV (MVP) |
| 7 | `organizationId` dénormalisé sur Appointment, Employee, AuditLog, IntegrationConnection, FeatureFlag |
| 8 | `ProUser.passwordHash String?` présent, auth non codée |
| 9 | Stripe : placeholders nullable |
| 10 | `ProUser.email` unique global |
| 11 | Soft-delete : `isActive Boolean` |
| 12 | `onDelete` : Cascade (tenant), SetNull (audit/client opt.), Restrict (RDV dangereux) |
| 13 | Dates : `startAt`/`endAt` UTC + `Salon.timezone` |
| 14 | Index : `startAt`, pas `appointmentDate` séparé |
| 15 | `@@map` en snake_case sur tous les modèles et enums |

## Hors périmètre de ce sprint

- Authentification (code, routes, sessions).
- Pages UI et composants.
- Services métier.
- Migration DB (requiert PostgreSQL local).
- Seed de données.

## Condition de sortie du sprint

> ✅ PR `feature/prisma-schema` validée par ChatGPT, mergée dans `main`, tag `v0.3.0-prisma-schema`.
> **Sprint 2 TERMINÉ.**

---

## Sprint précédents (clôturés)

- **Phase 0 — Fondation documentaire** ✅ — tag `v0.1.0-foundations`.
- **Sprint 1 — Bootstrap technique** ✅ — tag `v0.2.0-bootstrap`.

---

_Dernière mise à jour : 2026-06-17._
