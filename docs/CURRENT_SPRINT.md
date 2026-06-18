# CURRENT_SPRINT — Sprint en cours (KalendHair 4.0)

> À lire **avant d'agir**. Claude ne travaille que sur ce qui est dans ce sprint.

---

## Sprint actuel

**Sprint 7 — Horaires & Disponibilités** — TERMINÉ ✅

**Sprint 6 — Employees & Services** — TERMINÉ ✅

---

## Objectifs Sprint 7

- [x] `src/lib/permissions/schedule.permissions.ts` — `canManageSchedule()`.
- [x] `src/lib/utils/time.ts` — `minutesToTime()` / `timeToMinutes()`.
- [x] `src/features/schedules/types.ts` — DayOfWeek, DAYS_OF_WEEK, DAY_LABELS, UTC_DAY_MAP, DEFAULT_SALON_SCHEDULE, SalonScheduleGridEntry, EmployeeScheduleGridEntry, ClosedDayView, AvailabilityResult, ScheduleFormState, ClosedDayFormState.
- [x] `src/features/schedules/schedule.schema.ts` — SalonScheduleDaySchema, EmployeeScheduleDaySchema, ClosedDaySchema.
- [x] `src/features/schedules/salon-schedule.service.ts` — getSalonSchedule, getSalonScheduleRaw, saveSalonSchedule.
- [x] `src/features/schedules/employee-schedule.service.ts` — getEmployeeSchedule, saveEmployeeSchedule (cross-validation vs salon).
- [x] `src/features/schedules/closed-day.service.ts` — getClosedDays, addClosedDay (UTC, P2002), removeClosedDay.
- [x] `src/features/schedules/availability.service.ts` — isEmployeeAvailable (isActive check + salon + closedDay + employee schedule). PAS de getAvailableSlots.
- [x] `src/features/schedules/components/salon-schedule-form.tsx` — Client Component grille 7 jours.
- [x] `src/features/schedules/components/employee-schedule-form.tsx` — Client Component grille 7 jours + contexte salon.
- [x] `src/features/schedules/components/closed-day-manager.tsx` — Client Component ajout + suppression.
- [x] `src/app/(dashboard)/dashboard/salon/schedule/actions.ts` + `page.tsx`.
- [x] `src/app/(dashboard)/dashboard/employees/[id]/schedule/actions.ts` + `page.tsx`.
- [x] `src/app/(dashboard)/dashboard/closed-days/actions.ts` + `page.tsx`.
- [x] Hub `/dashboard` — 2 nouveaux liens : Horaires du salon + Jours de fermeture.
- [x] `/dashboard/employees/[id]` — lien Horaires vers `/dashboard/employees/[id]/schedule`.
- [x] `typecheck` ✅ · `lint` ✅ · `build` ✅ · `db:seed` ✅.

## Décisions techniques Sprint 7

| Décision | Valeur |
|---|---|
| Pas de @@unique sur SalonSchedule / EmployeeSchedule | Index simples pour multi-créneaux futur |
| Pas de getAvailableSlots | Reporté Sprint 8 avec les rendez-vous |
| isEmployeeAvailable | Vérifie employee.isActive === true (ajustement ChatGPT) |
| saveSchedule | $transaction([deleteMany, createMany]) |
| ClosedDay date | Date.UTC(y, m-1, d) pour éviter ambiguïté timezone |
| DayOfWeek ordering | Toujours trié via DAYS_OF_WEEK (pas l'ordre DB alphabétique) |
| organizationId | JWT uniquement — jamais depuis FormData |

## Condition de sortie du sprint

> ✅ PR `feature/sprint7-schedules` validée par ChatGPT et Hasan (22/22 tests), mergée dans `main`, tag `v0.8.0-schedules`.
> **Sprint 7 TERMINÉ.**

---

## Objectifs du sprint (Sprint 6)

- [x] Migration `20260618000002_employee_photo_url` — `photoUrl TEXT` nullable sur `employees`.
- [x] `src/lib/permissions/employee.permissions.ts` — `canManageEmployee()`.
- [x] `src/lib/permissions/service.permissions.ts` — `canManageService()`.
- [x] `src/features/employees/types.ts` — `EmployeeView` + `EmployeeWithServices` + `EmployeeFormState` (avec `warning`, `requireConfirmation`, `pendingData`).
- [x] `src/features/employees/employee.schema.ts` — `CreateEmployeeSchema` / `UpdateEmployeeSchema`.
- [x] `src/features/employees/employee.service.ts` — CRUD + `findPotentialDuplicate()` + `reactivateEmployee()`.
- [x] `src/features/employees/employee-service.service.ts` — `syncEmployeeServices()`.
- [x] `src/features/employees/components/employee-list.tsx` — liste actifs/inactifs.
- [x] `src/features/employees/components/employee-form.tsx` — form avec flux de confirmation doublon.
- [x] `src/features/employees/components/service-assignment.tsx` — checkboxes services.
- [x] `src/features/employees/components/status-section.tsx` — désactivation/réactivation avec warning.
- [x] `src/features/services/types.ts` — `ServiceView` + `ServiceFormState`.
- [x] `src/features/services/service.schema.ts` — `CreateServiceSchema` / `UpdateServiceSchema`.
- [x] `src/features/services/service.service.ts` — CRUD + `reactivateService()`.
- [x] `src/features/services/components/service-list.tsx`.
- [x] `src/features/services/components/service-form.tsx`.
- [x] Routes `/dashboard/employees` (liste + new + [id]).
- [x] Routes `/dashboard/services` (liste + new + [id]).
- [x] Hub `/dashboard` mis à jour : 4 liens homogènes.
- [x] `typecheck` ✅ · `lint` ✅ · `build` ✅ · `db:seed` ✅ · `prisma validate` ✅.

## Décisions techniques Sprint 6

| Décision | Valeur |
|---|---|
| Doublon employé | Avertissement + confirmation (pas de blocage strict) |
| `pendingData` dans `EmployeeFormState` | Permet re-soumission avec `confirmed=true` |
| `photoUrl` | Nullable, pas d'UI Sprint 6 |
| `currency` | Fixé `"EUR"` dans le service, jamais depuis le client |
| Liaison services→employé | `syncEmployeeServices` avec whitelist `salonServiceIds` |
| bound actions via closures | `"use server"` dans Server Component pour injecter `id` |

## Condition de sortie du sprint

> ✅ PR `feature/sprint6-employees-services` validée par ChatGPT et Hasan (tests logique métier 45/45), mergée dans `main`, tag `v0.7.0-employees-services`.
> **Sprint 6 TERMINÉ.**

---

## Sprints précédents (clôturés)

- **Phase 0 — Fondation documentaire** ✅ — tag `v0.1.0-foundations`.
- **Sprint 1 — Bootstrap technique** ✅ — tag `v0.2.0-bootstrap`.
- **Sprint 2 — Schéma Prisma** ✅ — tag `v0.3.0-prisma-schema`.
- **Sprint 3 — Migration PostgreSQL** ✅ — tag `v0.4.0-db-migration`.
- **Sprint 4 — Authentification** ✅ — tag `v0.5.0-auth`.
- **Sprint 5 — Organization & Salon Management** ✅ — tag `v0.6.0-org-salon`.
- **Sprint 6 — Employees & Services** ✅ — tag `v0.7.0-employees-services`.

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
