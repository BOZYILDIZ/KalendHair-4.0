# PROJECT_STATE — État actuel du projet (KalendHair 4.0)

> À lire **en premier** au début de chaque session. À **mettre à jour à la fin** de chaque session.

---

## Phase actuelle

**Phase 1 / Sprint 1 — Bootstrap technique : TERMINÉ et mergé** ✅

**Phase 2 / Sprint 2 — Schéma Prisma : TERMINÉ et mergé** ✅

**Sprint 3 — Validation PostgreSQL + Migration Prisma : TERMINÉ et mergé** ✅

**Sprint 4 — Authentification ProUser (OWNER) : TERMINÉ et mergé** ✅

**Sprint 5 — Organization & Salon Management : TERMINÉ et mergé** ✅

**Sprint 6 — Employees & Services : TERMINÉ et mergé** ✅

**Sprint 7 — Horaires & Disponibilités : TERMINÉ et mergé** ✅

**Sprint 8 — Rendez-vous : TERMINÉ et mergé** ✅

**Sprint 9 — Agenda visuel Jour & Semaine : TERMINÉ et mergé** ✅

**Sprint 10 — CRM Clients : TERMINÉ et mergé** ✅

**Sprint 11 — Réservation Publique : TERMINÉ et mergé** ✅

**Sprint 12 — Notifications Email : TERMINÉ et mergé** ✅

**Sprint 13 — Dashboard & KPI : TERMINÉ et mergé** ✅

**Sprint 14 — Module Caisse POS (Payments) : TERMINÉ et mergé** ✅

## État du code

- **Auth custom** : `jose` (JWT HS256, 24h) + `bcryptjs` + cookie `HttpOnly`.
- **Proxy Next.js 16** (`src/proxy.ts`) : protection `/dashboard/:path*`.
- **Pages** :
  - `/login` — formulaire ProUser OWNER
  - `/dashboard` — hub (12 liens : Organisation, Salon, Employés, Services, Horaires du salon, Jours de fermeture, Rendez-vous, Agenda, Clients, KPI & Tableau de bord, **Caisse**)
  - `/dashboard/organization` — lecture + modification Organisation
  - `/dashboard/salon` — lecture + modification Salon
  - `/dashboard/salon/schedule` — grille 7 jours horaires du salon (**Sprint 7**)
  - `/dashboard/employees` — liste employés (actifs + inactifs)
  - `/dashboard/employees/new` — création employé (avec avertissement doublon)
  - `/dashboard/employees/[id]` — édition + associations services + statut + lien Horaires
  - `/dashboard/employees/[id]/schedule` — grille 7 jours horaires employé (**Sprint 7**)
  - `/dashboard/services` — liste services (actifs + inactifs)
  - `/dashboard/services/new` — création service
  - `/dashboard/services/[id]` — édition + statut
  - `/dashboard/closed-days` — gestion jours fermeture exceptionnels (**Sprint 7**)
  - `/dashboard/appointments` — liste RDV avec filtres (date, employé, statut) (**Sprint 8**)
  - `/dashboard/appointments/new` — création RDV (service → employé → date/heure → client) (**Sprint 8**)
  - `/dashboard/appointments/[id]` — détail RDV + actions statut + annulation + historique + bouton Lier client (**Sprint 8 / 10**)
  - `/dashboard/agenda` — agenda visuel Jour & Semaine + nav + filtre employé (**Sprint 9**)
  - `/dashboard/clients` — liste CRM paginée + recherche (**Sprint 10**)
  - `/dashboard/clients/[id]` — fiche client : stats + historique RDV + notes internes (**Sprint 10**)
  - `/dashboard/kpi` — tableau de bord KPI : CA, RDV, clients, taux remplissage, top services, top employés (**Sprint 13**)
  - `/dashboard/payments` — liste paginée des paiements : filtres ALL|CASH|CARD|TRANSFER|OTHER, CA encaissé sur la période (**Sprint 14**)
  - `/dashboard/payments/new` — paiement libre : libellé, prix unitaire, quantité, méthode, date, client optionnel (**Sprint 14**)
  - `/dashboard/payments/[id]` — détail paiement + lignes de prestation + annulation avec confirmation (**Sprint 14**)
  - `/dashboard/appointments/[id]/pay` — encaissement lié à un RDV (CONFIRMED/COMPLETED uniquement) (**Sprint 14**)
  - `/book/[slug]` — wizard public réservation : étape 1 (services) (**Sprint 11**)
  - `/book/[slug]/confirm` — récapitulatif + formulaire coordonnées (**Sprint 11**)
  - `/book/[slug]/success` — confirmation réservation (**Sprint 11**)
- **Permissions** : `src/lib/permissions/` — `tenant.ts` + `organization.permissions.ts` + `salon.permissions.ts` + `employee.permissions.ts` + `service.permissions.ts` + `schedule.permissions.ts` + `appointment.permissions.ts` + `client.permissions.ts` + `payment.permissions.ts`
- **Services métier** : `src/features/organizations/` + `src/features/salons/` + `src/features/employees/` + `src/features/services/` + `src/features/schedules/` + `src/features/appointments/` + `src/features/clients/` + `src/features/dashboard/` + `src/features/payments/`
- **Validation** : `zod@4.4.3` — Server Actions
- **Seed DEV** : `owner@test.local / Test1234!` (Organisation "Salon Test" + Salon "Salon Test").
- **Schéma Prisma** : 23 modèles + 15 enums + 6 migrations (4 appliquées + 1 en attente Docker + 1 new Sprint 14 en attente Docker).
- **Dépendances Sprint 8** : `date-fns-tz@3.2.0` (conversion timezone ↔ UTC).
- **Dépendances Sprint 9** : `date-fns@4.4.0` (requis par `date-fns-tz`).
- **CRM Sprint 10** :
  - `src/features/clients/types.ts` — ClientListItem, ClientView, ClientStats, ClientAppointmentRow
  - `src/features/clients/client.schema.ts` — UpdateNotesSchema (Zod, max 500 car)
  - `src/features/clients/client.service.ts` — getClients, getClient, getClientStats, getClientAppointments, updateClientNotes, convertGuestToClient
  - 5 composants : client-search (Client), client-list, client-stats-card, client-appointment-history, client-notes-form (Client)
  - `priceCentsSnapshot Int?` capturé à la création du RDV (`createAppointment`) — fallback `service.priceCents` pour RDV antérieurs
  - Notes internes isolées par salon (`SalonClient.notes`)
  - Conversion invité → client : `clientId` renseigné, champs `guest*` conservés comme snapshot historique
- **Réservation publique Sprint 11** :
  - `src/features/booking/types.ts` — PublicSalonView, PublicServiceView, PublicEmployeeView, PublicBookingInput, BookingStep, PublicBookingFormState, `BOOKING_LEAD_MINUTES = 30`
  - `src/features/booking/booking.schema.ts` — PublicBookingSchema (Zod v4 : firstName, lastName, email, phone, serviceId, employeeId, date, slot)
  - `src/features/booking/booking.service.ts` — getPublicSalon (résolution slug + isActive), getPublicServices, getPublicEmployeesForService, getPublicSlots (filtrage dates/créneaux passés timezone-aware), createPublicAppointment → createAppointment()
  - `src/app/(public)/book/[slug]/confirm/actions.ts` — bookAppointmentAction (salonId + organizationId bindés server-side)
  - 6 composants UI : booking-salon-header, booking-service-list, booking-employee-list, booking-date-picker (Client), booking-slot-picker, booking-form (Client)
  - Wizard URL multi-étapes : service → employé → date → créneau → confirm → success
  - `organizationId` résolu depuis le slug, jamais transmis par le client
  - `priceCentsSnapshot` capturé automatiquement via `createAppointment()`
  - `proxy.ts` matcher `/dashboard/:path*` inchangé — `/book/*` public sans auth
- **Module Caisse POS Sprint 14** :
  - `src/features/payments/types.ts` — PaymentMethod, PaymentStatus, AppointmentPaymentState (unpaid/partial/paid/overpaid), PaymentView, PaymentLineView, PaymentSummary, PaymentListItem, PaymentsPage, PaymentFilters, CreatePaymentLineInput, CreateAppointmentPaymentInput, CreateFreePaymentInput, PaymentFormState
  - `src/features/payments/payment.schema.ts` — CreatePaymentLineSchema (unitPriceCents ≥ 1, quantity ≥ 1), CreateAppointmentPaymentSchema (amountCents ≥ 1, paidAt non-futur, method CASH|CARD|TRANSFER), CreateFreePaymentSchema, CancelPaymentSchema
  - `src/features/payments/payment.service.ts` — 9 fonctions : createPaymentForAppointment ($transaction, totalCents calculé, CONFIRMED+COMPLETED uniquement), createFreePayment ($transaction, totalCents calculé), cancelPayment (status CANCELLED + isActive false), getPayments (paginé PAGE_SIZE=20, filtres ALL|CASH|CARD|TRANSFER|OTHER), getPayment, getPaymentsForAppointment, getPaymentSummaryForAppointment (4 états), getRevenueSummary (CA réel)
  - `src/lib/permissions/payment.permissions.ts` — canManagePayment (→ canAccessTenant)
  - 6 composants UI : PaymentMethodBadge (4 méthodes), AppointmentPaymentStateBadge (4 états), PaymentTransactionBadge (2 états), PaymentSummaryCard, PaymentHistoryTable, AppointmentPaymentForm + FreePaymentForm, CancelPaymentPanel
  - `totalCents` jamais accepté depuis le client — toujours `unitPriceCents × quantity` côté service
  - `createdByProUserId` toujours depuis JWT/session
  - NO_SHOW non encaissable — redirect immédiat page + throw service
  - PaymentMethod.OTHER : filtres/badges uniquement, exclu du formulaire
  - Isolation stricte `salonId + organizationId` sur toutes les requêtes
  - Migration `20260624000002_payments` : additive, zéro ALTER TABLE sur tables existantes
- **Dashboard KPI Sprint 13** :
  - `src/features/dashboard/types.ts` — Period, VALID_PERIODS, AppointmentCounts, TopServiceRow, TopEmployeeRow, FillRateResult, DashboardKpi
  - `src/features/dashboard/dashboard.service.ts` — getDashboardKpi(), 7 agrégats parallèles (Promise.all) : fetchRevenue, fetchAppointmentCounts, fetchNewClients, fetchRecurringClients, fetchTopServices, fetchTopEmployees, fetchFillRate
  - 8 composants Server/Client (1 seul "use client" : KpiPeriodSelector) : kpi-card, kpi-period-selector, kpi-revenue-card, kpi-appointments-card, kpi-clients-card, kpi-fill-rate-card, kpi-top-services-card, kpi-top-employees-card
  - CA = COMPLETED uniquement · clients récurrents = ≥2 COMPLETED sur 12 mois · taux remplissage plafonné 100 % · top employés : RDV + CA + % CA total
  - Aucune migration Prisma · aucune dépendance externe ajoutée
- **Notifications email Sprint 12** :
  - `src/lib/email/resend.client.ts` — singleton Resend, null si RESEND_API_KEY absent
  - `src/lib/email/send-email.ts` — wrapper sendEmail(), gestion erreurs, from/replyTo
  - `src/lib/email/email.types.ts` — EmailPayload, SendEmailResult
  - `src/features/notifications/types.ts` — NotificationContext
  - `src/features/notifications/notification.service.ts` — sendAppointmentNotification(), buildNotificationContext(), logNotification(), isNotificationEnabled()
  - 3 templates : confirmation (indigo), annulation (rouge), reminder (squelette Sprint 13)
  - Hooks fire-and-forget dans `createAppointment()` (CONFIRMATION) et `cancelAppointment()` (CANCELLED)
  - Journalisation DB : table `notifications` — SENT | FAILED | SKIPPED pour chaque tentative
  - `RESEND_API_KEY` absent → SKIPPED silencieux — booking/annulation non affectés
  - Aucune migration Prisma (tables `notifications/*` créées par Sprint 2)
  - Dépendance : `resend@6.14.0`
- **⚠️ Migration en attente** : `prisma/migrations/20260624000001_crm_snapshot_and_indexes/migration.sql` — à appliquer via `pnpm db:migrate` dès que Docker + `.env` disponibles (non destructive : colonne nullable + 2 index).
- **Agenda Sprint 9** :
  - `src/features/agenda/types.ts` — AgendaView, GridConfig, AgendaBlock, AgendaColumn, AgendaDayData, AgendaWeekData, SLOT_HEIGHT_REM
  - `src/features/agenda/agenda.service.ts` — `getAgendaDay()`, `getAgendaWeek()`, `computeWeekStart()` (5 requêtes Prisma parallèles chacun)
  - 8 composants : `agenda-closed-day-banner`, `agenda-time-ruler`, `agenda-appointment-block`, `agenda-employee-column`, `agenda-day-view`, `agenda-week-view`, `agenda-now-indicator` (Client), `agenda-nav` (Server), `agenda-employee-filter` (Client)
  - Positionnement CSS absolu (top/height en rem) + overlap detection (greedy interval grouping)
  - Indicateur "maintenant" : `Intl.DateTimeFormat` + `setInterval(60_000)` côté client
  - Grille : enveloppe `min(salon.start, allEmp.start)` / `max(salon.end, allEmp.end)` (aucun employé tronqué)
- **Horaires Sprint 7** :
  - `SalonSchedule` — grille 7 jours (saveMany en `$transaction`)
  - `EmployeeSchedule` — grille 7 jours (cross-validé vs salon)
  - `ClosedDay` — fermetures exceptionnelles (date UTC, motif optionnel)
  - `isEmployeeAvailable()` — vérifie salon ouvert + pas ClosedDay + employé actif + horaires employé + conflits RDV (Sprint 8, `options.startAtUTC`)
- **Rendez-vous Sprint 8** :
  - `createAppointment` — timezone-aware (`date-fns-tz`), email normalisé, résolution Client, conflit via `isEmployeeAvailable`
  - `updateAppointment` — reschedule + update notes, `excludeAppointmentId` pour ignorer le RDV courant
  - `cancelAppointment` / `updateAppointmentStatus` — transitions validées via `ALLOWED_TRANSITIONS`
  - `getAvailableSlots` — slots 15 min (`SLOT_INTERVAL_MINUTES`), sans N+1 (requêtes parallèles + filtrage en mémoire)
  - `AppointmentModification` — log automatique : CREATED / RESCHEDULED / CANCELLED / STATUS_CHANGED / NOTE_UPDATED
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
| resend | 6.14.0 |

## Vérifications (toutes ✅)

`pnpm prisma validate` · `pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm db:seed` → **OK**.
Tests logique métier Sprint 6 : 45/45 ✅
Sprint 7 : `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm build` ✅ · `pnpm db:seed` ✅
Sprint 8 : `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm build` ✅ · `pnpm db:seed` ✅ · 24/24 tests manuels ✅
Sprint 9 : `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm build` ✅ (20 routes) · 20/20 tests manuels ✅ · `pnpm db:seed` : prérequis environnement (Docker + `.env` requis, non fonctionnel hors environnement local configuré)
Sprint 10 : `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm build` ✅ (22 routes) · 22/22 tests manuels ✅ · `pnpm db:migrate` / `pnpm db:seed` : ⚠️ en attente Docker + `.env` (migration non destructive prête)
Sprint 11 : `typecheck` ✅ · `lint` ✅ · `build` ✅ (25 routes) · 23/23 tests manuels ✅
Sprint 12 : `typecheck` ✅ · `lint` ✅ · `build` ✅ (25 routes) · 20/20 tests manuels ✅
Sprint 13 : `typecheck` ✅ · `lint` ✅ · `build` ✅ (26 routes) · 20/20 tests manuels ✅
Sprint 14 : `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (30 routes) · 20/20 tests manuels ✅

## Migrations appliquées

| Nom | Description |
|---|---|
| `20260617014217_init` | Schéma initial (21 tables + 13 enums) |
| `20260618000001_salon_org_unique` | Contrainte unique `Salon.organizationId` (1 salon/org MVP) |
| `20260618000002_employee_photo_url` | `photoUrl TEXT` nullable sur `employees` (préparation Sprint 7+) |
| `20260618120356_appointment_conflict_index` | Index composite `@@index([employeeId, startAt, endAt])` sur `appointments` (**Sprint 8**) |
| `20260624000001_crm_snapshot_and_indexes` | ⚠️ **EN ATTENTE** — `priceCentsSnapshot INT?` sur `appointments` + `@@index([phone])` sur `clients` + `@@index([salonId, createdAt])` sur `salon_clients` (**Sprint 10**) |
| `20260624000002_payments` | ⚠️ **EN ATTENTE** — enums `payment_method` + `payment_status`, tables `payments` + `payment_lines`, 6 index, FK Restrict (salon), SetNull (appointment/client/createdBy), Cascade (paymentLine→payment) (**Sprint 14**) |

## Git / Release

- `main` = seule branche stable active.
- Tags : `v0.1.0-foundations` · `v0.2.0-bootstrap` · `v0.3.0-prisma-schema` · `v0.4.0-db-migration` · `v0.5.0-auth` · `v0.6.0-org-salon` · `v0.7.0-employees-services` · `v0.8.0-schedules` · `v0.9.0-appointments` · `v1.0.0-agenda` · `v1.1.0-crm-clients` · `v1.2.0-public-booking` · `v1.3.0-email-notifications` · `v1.4.0-dashboard-kpi` · **`v1.5.0-payments-pos`**.
- PR **#17** (`feature/sprint9-agenda`) **mergée** dans `main` (merge commit `36156b1`).
- PR **#18** (`docs/sprint9-closure`) **mergée** dans `main` (commit `7976531`).
- PR **#19** (`feature/sprint10-crm-clients`) **mergée** dans `main` (merge commit `361155b`).
- PR **#21** (`feature/sprint11-public-booking`) **mergée** dans `main` (squash commit `2146c45`).
- PR **#22** (`docs/codex-guidelines`) **mergée** dans `main` (squash commit `2dbf910`).
- PR **#23** (`docs/codex-coauthor-rule`) **mergée** dans `main` (squash commit `86716e8`).
- PR **#25** (`feature/sprint12-email-notifications`) **mergée** dans `main` (squash commit `b92611a`).
- PR **#27** (`feature/sprint13-dashboard-kpi`) **mergée** dans `main` (merge commit `91669cf`).
- PR **#29** (`feature/sprint14-payments-pos`) **mergée** dans `main` (merge commit `4b7bdfa`).
- Branches feature/sprint9-agenda, docs/sprint9-closure, feature/sprint10-crm-clients, feature/sprint11-public-booking, docs/codex-guidelines, docs/codex-coauthor-rule, feature/sprint12-email-notifications, feature/sprint13-dashboard-kpi, feature/sprint14-payments-pos **supprimées** (locale + distante).

## Base de données

- PostgreSQL local via Docker Compose — base DEV isolée.
- Migrations appliquées : voir tableau ci-dessus.
- Seed DEV : `owner@test.local / Test1234!` + Salon "Salon Test" (commande : `pnpm db:seed`).

## Prochaine étape

Sprint 15 : à définir avec ChatGPT (numérotation des reçus, rappels email, Stripe, multi-salons, etc.)

⚠️ **Prérequis persistant** : appliquer les migrations en attente via `pnpm db:migrate` dès que Docker + `.env` disponibles :
- `20260624000001_crm_snapshot_and_indexes` (Sprint 10 — non destructive)
- `20260624000002_payments` (Sprint 14 — non destructive)

---

_Dernière mise à jour : 2026-06-24 — PR #29 mergée, tag v1.5.0-payments-pos. Sprint 14 Module Caisse POS TERMINÉ._
