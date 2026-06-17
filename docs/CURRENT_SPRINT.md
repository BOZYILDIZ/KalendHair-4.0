# CURRENT_SPRINT — Sprint en cours (KalendHair 4.0)

> À lire **avant d'agir**. Claude ne travaille que sur ce qui est dans ce sprint.

---

## Sprint actuel

**Sprint 5 — Organization & Salon Management** — TERMINÉ ✅

## Objectifs du sprint (tous atteints)

- [x] Dépendance : `zod@4.4.3` installée.
- [x] Migration `20260618000001_salon_org_unique` — contrainte unique `Salon.organizationId`.
- [x] Seed mis à jour : création d'un Salon pour l'organisation de test.
- [x] `src/lib/permissions/tenant.ts` — `isSameTenant()` / `isOwner()` / `canAccessTenant()`.
- [x] `src/lib/permissions/organization.permissions.ts` — `canManageOrganization()`.
- [x] `src/lib/permissions/salon.permissions.ts` — `canManageSalon()`.
- [x] `src/features/organizations/types.ts` — `OrganizationView` + `OrganizationFormState`.
- [x] `src/features/organizations/organization.schema.ts` — Zod `UpdateOrganizationSchema`.
- [x] `src/features/organizations/organization.service.ts` — `getOrganization()` / `updateOrganization()`.
- [x] `src/features/organizations/components/organization-form.tsx` — Client Component.
- [x] `src/features/salons/types.ts` — `SalonView` + `SalonFormState`.
- [x] `src/features/salons/salon.schema.ts` — Zod `UpdateSalonSchema` (timezone IANA string).
- [x] `src/features/salons/salon.service.ts` — `getSalon()` / `updateSalon()`.
- [x] `src/features/salons/components/salon-form.tsx` — Client Component.
- [x] `src/app/(dashboard)/dashboard/page.tsx` — hub (`/dashboard`).
- [x] `src/app/(dashboard)/dashboard/organization/actions.ts` + `page.tsx` — `/dashboard/organization`.
- [x] `src/app/(dashboard)/dashboard/salon/actions.ts` + `page.tsx` — `/dashboard/salon`.
- [x] `README.md` mis à jour (stack, scripts, compte DEV, tableau des sprints).
- [x] `typecheck` ✅ · `lint` ✅ · `build` ✅ · `db:seed` ✅.
- [x] Test manuel complet validé par Hasan. ✅
- [x] Validation ChatGPT + merge PR #9 + tag `v0.6.0-org-salon`. ✅

## Décisions techniques Sprint 5

| Décision | Valeur |
|---|---|
| Validation | `zod@4.4.3` — Server Actions uniquement |
| Timezone | String IANA libre (regex `/^[A-Za-z_]+\/[A-Za-z_/]+$/`) |
| Unicité Salon | `@@unique([organizationId])` — 1 salon MVP par organisation |
| Services | Appels Prisma directs dans les services (pas de repositories séparés) |
| Permissions | `lib/permissions/tenant.ts` centralisé → délégué par domaine |
| Routing | `(dashboard)` route group + subfolder `dashboard/` pour les URLs |

## Condition de sortie du sprint

> ✅ PR `feature/sprint5-org-salon` validée par ChatGPT et Hasan (test manuel), mergée dans `main`, tag `v0.6.0-org-salon`.
> **Sprint 5 TERMINÉ.**

---

## Sprints précédents (clôturés)

- **Phase 0 — Fondation documentaire** ✅ — tag `v0.1.0-foundations`.
- **Sprint 1 — Bootstrap technique** ✅ — tag `v0.2.0-bootstrap`.
- **Sprint 2 — Schéma Prisma** ✅ — tag `v0.3.0-prisma-schema`.
- **Sprint 3 — Migration PostgreSQL** ✅ — tag `v0.4.0-db-migration`.
- **Sprint 4 — Authentification** ✅ — tag `v0.5.0-auth`.
- **Sprint 5 — Organization & Salon Management** ✅ — tag `v0.6.0-org-salon`.

---

_Dernière mise à jour : 2026-06-18._
