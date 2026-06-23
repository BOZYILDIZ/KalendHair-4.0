# CURRENT_SPRINT — Sprint en cours (KalendHair 4.0)

> À lire **avant d'agir**. Claude ne travaille que sur ce qui est dans ce sprint.

---

## Sprint actuel

**Sprint 15 — Professionnalisation (Rappels email + Numérotation reçus)** — TERMINÉ ✅

**Sprint 14 — Module Caisse POS (Payments)** — TERMINÉ ✅

**Sprint 13 — Dashboard & KPI** — TERMINÉ ✅

**Sprint 12 — Notifications Email** — TERMINÉ ✅

**Sprint 11 — Réservation Publique** — TERMINÉ ✅

**Sprint 10 — CRM Clients** — TERMINÉ ✅

**Sprint 9 — Agenda visuel Jour & Semaine** — TERMINÉ ✅

**Sprint 8 — Rendez-vous** — TERMINÉ ✅

**Sprint 7 — Horaires & Disponibilités** — TERMINÉ ✅

**Sprint 6 — Employees & Services** — TERMINÉ ✅

---

## Objectifs Sprint 14

- [x] Migration `20260624000002_payments` — enums `PaymentMethod` (CASH, CARD, TRANSFER, OTHER) + `PaymentStatus` (COMPLETED, CANCELLED), tables `payments` + `payment_lines`, 6 index, FK Restrict/SetNull/Cascade. Additive — zéro ALTER TABLE existant.
- [x] `src/features/payments/types.ts` — 14 types : PaymentMethod, PaymentStatus, AppointmentPaymentState, PaymentLineView, PaymentView, PaymentSummary, PaymentListItem, PaymentsPage, PaymentFilters, CreatePaymentLineInput, CreateAppointmentPaymentInput, CreateFreePaymentInput, PaymentFormState + constantes PAYMENT_METHOD_LABELS, FORM_PAYMENT_METHODS (Codex).
- [x] `src/features/payments/payment.schema.ts` — CreatePaymentLineSchema (unitPriceCents ≥ 1, quantity ≥ 1), CreateAppointmentPaymentSchema (amountCents ≥ 1, paidAt non-futur, CASH|CARD|TRANSFER), CreateFreePaymentSchema, CancelPaymentSchema (Codex).
- [x] `src/lib/permissions/payment.permissions.ts` — `canManagePayment()` → `canAccessTenant()` (Claude).
- [x] `src/features/payments/payment.service.ts` — 9 fonctions exportées : createPaymentForAppointment ($transaction, PAYABLE_STATUSES, totalCents serveur), createFreePayment ($transaction, totalCents serveur), cancelPayment (isActive false), getPayments (PAGE_SIZE=20, filtres, Promise.all 3 requêtes), getPayment, getPaymentsForAppointment, getPaymentSummaryForAppointment (computePaymentState 4 états), getRevenueSummary (Claude).
- [x] `src/features/payments/components/payment-method-badge.tsx` — 4 méthodes dont OTHER (Codex).
- [x] `src/features/payments/components/payment-status-badge.tsx` — AppointmentPaymentStateBadge (unpaid/partial/paid/overpaid) + PaymentTransactionBadge (COMPLETED/CANCELLED) (Codex).
- [x] `src/features/payments/components/payment-summary-card.tsx` — carte résumé RDV avec lien /pay (Codex).
- [x] `src/features/payments/components/payment-history-table.tsx` — tableau paginé avec lien RDV et total période (Codex).
- [x] `src/features/payments/components/payment-form.tsx` — AppointmentPaymentForm + FreePaymentForm, useActionState, OTHER absent du formulaire (Codex).
- [x] `src/features/payments/components/cancel-payment-panel.tsx` — confirm() + useActionState (Codex).
- [x] `src/app/(dashboard)/dashboard/payments/page.tsx` — liste filtrée (30j par défaut), CA encaissé, pagination, 5 filtres méthode (Claude).
- [x] `src/app/(dashboard)/dashboard/payments/new/page.tsx` + `actions.ts` — paiement libre, euros→cents côté action (Claude).
- [x] `src/app/(dashboard)/dashboard/payments/[id]/page.tsx` + `actions.ts` — détail + lignes + annulation (Claude).
- [x] `src/app/(dashboard)/dashboard/appointments/[id]/pay/page.tsx` + `actions.ts` — encaissement RDV, redirect NO_SHOW/CANCELLED (Claude).
- [x] `src/app/(dashboard)/dashboard/page.tsx` modifié — 12ème lien "Caisse" (Claude).
- [x] 4 ajustements ChatGPT intégrés : totalCents côté service uniquement, état overpaid complet, Zod min(1) sur 3 champs, filtre ALL|CASH|CARD|TRANSFER|OTHER.
- [x] `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (30 routes) · 20/20 tests manuels ✅.
- [x] Contributeurs : Claude Sonnet 4.6 (architecture, service, permissions, pages, actions, intégration) + OpenAI Codex (types, schema Zod, 6 composants UI).

## Décisions techniques Sprint 14

| Décision | Valeur |
|---|---|
| `totalCents` | Toujours `unitPriceCents × quantity` côté service — jamais accepté depuis le client |
| `createdByProUserId` | Toujours depuis JWT/session (`session.id`) — jamais depuis FormData |
| Statuts encaissables | `PAYABLE_STATUSES = new Set(["CONFIRMED", "COMPLETED"])` — NO_SHOW non encaissable |
| Double protection NO_SHOW | Redirect UI (page) + throw service — deux gardes indépendantes |
| `PaymentMethod.OTHER` | Enum + filtre + badge uniquement — absent de `FormPaymentMethodSchema` |
| `AppointmentPaymentState` | 4 états : unpaid (0), partial (<expected), paid (===expected), overpaid (>expected) |
| euros → cents | Conversion dans les actions (`Math.round(euros * 100)`) — le formulaire travaille en euros |
| `priceCentsSnapshot` | Utilisé dans `createPaymentForAppointment` — fallback `service.priceCents` |
| Isolation | `salonId + organizationId` dans chaque clause `where` du service |
| `$transaction` | createPaymentForAppointment + createFreePayment — atomicité Payment + PaymentLine |
| `onDelete: Restrict` | Salon → Payment — protection données financières |
| `onDelete: Cascade` | PaymentLine → Payment — intégrité référentielle |
| `receiptNumber` | `String?` nullable — préparé pour Sprint 15 (numérotation reçus) |
| Migration | Strictement additive — zéro `ALTER TABLE` sur tables existantes |

## Condition de sortie du sprint

> ✅ PR `feature/sprint14-payments-pos` (#29) validée par ChatGPT et Hasan (20/20 tests manuels), mergée dans `main` (merge commit `4b7bdfa`), tag `v1.5.0-payments-pos`.
> **Sprint 14 TERMINÉ.**

---

## Objectifs Sprint 13

- [x] `src/features/dashboard/types.ts` — Period, VALID_PERIODS, AppointmentCounts, TopServiceRow, TopEmployeeRow, FillRateResult, DashboardKpi (Codex).
- [x] `src/features/dashboard/dashboard.service.ts` — getDashboardKpi() + 7 agrégats internes (Claude) : fetchRevenue (COMPLETED), fetchAppointmentCounts (groupBy statut), fetchNewClients (salonClient.count), fetchRecurringClients (12 mois, ≥2, COMPLETED), fetchTopServices (top 5 par RDV), fetchTopEmployees (top 5 par RDV + CA + % CA), fetchFillRate (horaires employés × jours ouverts - jours fermeture, plafonné 100 %).
- [x] `src/features/dashboard/components/kpi-card.tsx` — composant générique titre/valeur/sous-titre/badge (Codex).
- [x] `src/features/dashboard/components/kpi-period-selector.tsx` — sélecteur Aujourd'hui/Semaine/Mois, seul "use client" du module (Codex).
- [x] `src/features/dashboard/components/kpi-revenue-card.tsx` — CA en euros fr-FR, badge "Réalisé", sous-titre "RDV terminés uniquement" (Codex).
- [x] `src/features/dashboard/components/kpi-appointments-card.tsx` — barre proportionnelle 4 couleurs, taux annulation + no-show (Codex).
- [x] `src/features/dashboard/components/kpi-clients-card.tsx` — Nouveaux (période) + Récurrents (12 mois, indigo) (Codex).
- [x] `src/features/dashboard/components/kpi-fill-rate-card.tsx` — affiche "—" si null, barre indigo, fmtMin() h/min (Codex).
- [x] `src/features/dashboard/components/kpi-top-services-card.tsx` — table #/Service/RDV/CA, empty state (Codex).
- [x] `src/features/dashboard/components/kpi-top-employees-card.tsx` — table #/Employé/RDV/CA/% CA, point couleur (Codex).
- [x] `src/app/(dashboard)/dashboard/kpi/page.tsx` — Server Component, searchParams async, isValidPeriod(), getDashboardKpi() (Claude).
- [x] `src/app/(dashboard)/dashboard/page.tsx` modifié — 11ème lien "KPI & Tableau de bord" (Claude).
- [x] Aucune migration Prisma · aucune dépendance externe ajoutée.
- [x] `typecheck` ✅ · `lint` ✅ · `build` ✅ (26 routes) · 20/20 tests manuels ✅.
- [x] Contributeurs : Claude Sonnet 4.6 (architecture, service, page, intégration) + OpenAI Codex (types, 8 composants UI).

## Décisions techniques Sprint 13

| Décision | Valeur |
|---|---|
| CA | COMPLETED uniquement — `status: "COMPLETED" as never` dans fetchRevenue, fetchTopServices, fetchTopEmployees |
| Clients récurrents | ≥2 RDV COMPLETED ce salon sur 12 mois glissants — JS `.filter()` (évite `having` sur nullable) |
| Taux remplissage | `Math.min(100, Math.round(...))` — plafonné 100 % |
| Top employés | RDV + CA + `revenueSharePercent = Math.round(empRevenue / totalRevenue * 100)` |
| "use client" | KpiPeriodSelector uniquement (useRouter) — toutes les autres cartes sont Server Components |
| Promise.all | Un seul `await Promise.all([...7 fonctions...])` dans getDashboardKpi |
| Period fallback | `isValidPeriod()` local dans page.tsx — fallback "week" pour valeur invalide |
| Timezone | `todayInTz` = `Intl.DateTimeFormat("fr-CA", { timeZone })` · bornes UTC via `fromZonedTime` |
| noUncheckedIndexedAccess | `parts[0] ?? "2000"` sur tous les `.split("-")`, `Map.get()` avec fallback |
| FillRate null | employees.length === 0 OU availableMinutes === 0 → `ratePercent: null` → "—" |
| FillRate appointments | `status: { not: "CANCELLED" }` — PENDING + CONFIRMED + COMPLETED + NO_SHOW comptés |

## Condition de sortie du sprint

> ✅ PR `feature/sprint13-dashboard-kpi` validée par ChatGPT et Hasan (20/20 tests manuels), mergée dans `main` (merge commit `91669cf`), tag `v1.4.0-dashboard-kpi`.
> **Sprint 13 TERMINÉ.**

---

## Objectifs Sprint 12

- [x] `src/lib/email/email.types.ts` — EmailPayload, SendEmailResult (Codex).
- [x] `src/lib/email/resend.client.ts` — singleton Resend, null si RESEND_API_KEY absent (Claude).
- [x] `src/lib/email/send-email.ts` — wrapper sendEmail(), from/replyTo, gestion erreurs (Claude).
- [x] `src/features/notifications/types.ts` — NotificationContext (Codex).
- [x] `src/features/notifications/notification.service.ts` — sendAppointmentNotification(), buildNotificationContext(), logNotification(), isNotificationEnabled() (Claude).
- [x] `src/features/notifications/templates/appointment-confirmation.template.ts` — renderConfirmationEmail(), escapeHtml(), formatEuros(), formatDate(), header indigo (Codex).
- [x] `src/features/notifications/templates/appointment-cancellation.template.ts` — renderCancellationEmail(), header rouge (Codex).
- [x] `src/features/notifications/templates/appointment-reminder.template.ts` — squelette pour Sprint 13 (Codex).
- [x] `src/features/appointments/appointment.service.ts` modifié — fire-and-forget CONFIRMATION dans createAppointment() + CANCELLED dans cancelAppointment() (Claude).
- [x] `.env.example` modifié — RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_FROM_NAME (Claude).
- [x] Aucune migration Prisma (tables notifications/notification_preferences créées en Sprint 2).
- [x] Dépendance `resend@6.14.0` installée via `pnpm`.
- [x] `typecheck` ✅ · `lint` ✅ · `build` ✅ (25 routes) · 20/20 tests manuels ✅.
- [x] Contributeurs : Claude Sonnet 4.6 (architecture, client Resend, service notification, intégration) + OpenAI Codex (types, templates email).

## Décisions techniques Sprint 12

| Décision | Valeur |
|---|---|
| Fire-and-forget | `.catch()` dans createAppointment/cancelAppointment — email n'affecte jamais la réponse |
| RESEND_API_KEY absent | `getResendClient()` retourne null → SKIPPED silencieux dans sendAppointmentNotification |
| Journalisation | Table `notifications` — SENT / FAILED / SKIPPED pour chaque tentative |
| Préférence notification | Opt-in implicite : pas de record = envoi activé (vrai aussi pour les invités) |
| priceCentsSnapshot | `priceCentsSnapshot ?? servicePriceCents` dans le template — jamais prix actuel seul |
| escapeHtml | Appliqué sur toutes les données dynamiques injectées dans le HTML |
| singleton Resend | Module-level `let _client` — une seule instance par processus |
| organizationId | Toujours depuis JWT/services — jamais depuis l'email ou les params |

## Condition de sortie du sprint

> ✅ PR `feature/sprint12-email-notifications` validée par ChatGPT et Hasan (20/20 tests manuels), mergée dans `main` (squash commit `b92611a`), tag `v1.3.0-email-notifications`.
> **Sprint 12 TERMINÉ.**

---

## Objectifs Sprint 11

- [x] `src/features/booking/types.ts` — PublicSalonView, PublicServiceView, PublicEmployeeView, PublicBookingInput, BookingStep, PublicBookingFormState, `BOOKING_LEAD_MINUTES = 30`.
- [x] `src/features/booking/booking.schema.ts` — PublicBookingSchema (Zod v4, 8 champs).
- [x] `src/features/booking/booking.service.ts` — getPublicSalon (slug + isActive), getPublicServices, getPublicEmployeesForService, getPublicSlots (filtrage timezone-aware, BOOKING_LEAD_MINUTES), createPublicAppointment → createAppointment().
- [x] `src/app/(public)/book/[slug]/page.tsx` — wizard URL 4 étapes (service → employé → date → créneau).
- [x] `src/app/(public)/book/[slug]/confirm/page.tsx` — récapitulatif (service, employé, date, prix) + BookingForm. organizationId bindé server-side.
- [x] `src/app/(public)/book/[slug]/confirm/actions.ts` — bookAppointmentAction : Zod + createPublicAppointment + redirect success.
- [x] `src/app/(public)/book/[slug]/success/page.tsx` — page de confirmation + lien rebooking.
- [x] `src/features/booking/components/booking-salon-header.tsx` — Server Component.
- [x] `src/features/booking/components/booking-service-list.tsx` — Server Component, empty state, liens `?serviceId=`.
- [x] `src/features/booking/components/booking-employee-list.tsx` — Server Component, point de couleur, liens `?serviceId=x&employeeId=y`.
- [x] `src/features/booking/components/booking-date-picker.tsx` — Client Component, `useRouter`, `min={today}`.
- [x] `src/features/booking/components/booking-slot-picker.tsx` — Server Component, liens `/confirm?...&slot=`.
- [x] `src/features/booking/components/booking-form.tsx` — Client Component, `useActionState`, 4 hidden inputs, 4 champs.
- [x] `src/proxy.ts` inchangé — `/book/*` public sans auth.
- [x] Aucune migration Prisma.
- [x] `typecheck` ✅ · `lint` ✅ · `build` ✅ (25 routes) · 23/23 tests manuels ✅.
- [x] Contributeurs : Claude Sonnet 4.6 (architecture, service, actions, pages, sécurité) + OpenAI Codex (types, schema, 6 composants UI).

## Décisions techniques Sprint 11

| Décision | Valeur |
|---|---|
| État wizard | URL searchParams (zéro state client entre étapes) |
| organizationId isolation | Résolu depuis slug via `getPublicSalon()` server-side, bindé via `.bind()` |
| Date passée | `Intl.DateTimeFormat("fr-CA", { timeZone })` — comparaison lexicographique YYYY-MM-DD |
| Créneaux passés | `toZonedTime(new Date(), salonTimezone)` + `nowMinutes + BOOKING_LEAD_MINUTES` |
| BOOKING_LEAD_MINUTES | Constante = 30 dans `types.ts` |
| priceCentsSnapshot | Capturé automatiquement dans `createAppointment()` — aucune modification du service |
| slug immuable | `updateSalon()` n'inclut jamais `slug` dans `data` |
| Revalidation IDs URL | serviceId + employeeId retournés par les services avec filtre salonId → cross-tenant bloqué |
| "use client" | BookingDatePicker (useRouter) + BookingForm (useActionState) uniquement |
| Named exports | Tous les composants — `export default` réservé aux pages (Next.js) |
| Zod v4 | `.issues[0]?.message` |

## Condition de sortie du sprint

> ✅ PR `feature/sprint11-public-booking` validée par ChatGPT et Hasan (23/23 tests manuels), mergée dans `main` (squash commit `2146c45`), tag `v1.2.0-public-booking`.
> **Sprint 11 TERMINÉ.**

---

## Objectifs Sprint 10

- [x] Migration `20260624000001_crm_snapshot_and_indexes` — `priceCentsSnapshot INT?` sur `appointments` + index `clients(phone)` + index `salon_clients(salonId, createdAt)`.
- [x] `src/lib/permissions/client.permissions.ts` — `canManageClient()`.
- [x] `src/features/clients/types.ts` — ClientListItem, ClientView, ClientStats, ClientAppointmentRow, ClientsPage, ClientAppointmentsPage, ClientNotesFormState, ConvertGuestFormState.
- [x] `src/features/clients/client.schema.ts` — UpdateNotesSchema (Zod, max 500 car).
- [x] `src/features/clients/client.service.ts` — getClients, getClient, getClientStats, getClientAppointments, updateClientNotes, convertGuestToClient.
- [x] `src/features/clients/components/client-search.tsx` — Client Component, debounce 300ms, `useRouter`.
- [x] `src/features/clients/components/client-list.tsx` — liste paginée, empty states.
- [x] `src/features/clients/components/client-stats-card.tsx` — 4 stats : total RDV, dernière visite, dépense totale, annulations.
- [x] `src/features/clients/components/client-appointment-history.tsx` — historique RDV paginé.
- [x] `src/features/clients/components/client-notes-form.tsx` — Client Component, `useActionState`.
- [x] `src/app/(dashboard)/dashboard/clients/page.tsx` — liste CRM avec recherche + pagination.
- [x] `src/app/(dashboard)/dashboard/clients/[id]/page.tsx` — fiche client : stats + historique + notes.
- [x] `src/app/(dashboard)/dashboard/clients/[id]/actions.ts` — updateNotesAction, convertGuestAndRedirectAction.
- [x] `src/features/appointments/appointment.service.ts` modifié — `priceCentsSnapshot` capturé à la création.
- [x] `src/features/appointments/components/appointment-detail.tsx` modifié — bouton "Lier ce client au CRM →" pour invités.
- [x] `src/app/(dashboard)/dashboard/appointments/[id]/page.tsx` modifié — `convertGuestAction` passé à `AppointmentDetail`.
- [x] `src/app/(dashboard)/dashboard/page.tsx` modifié — 10ème lien "Clients".
- [x] `typecheck` ✅ · `lint` ✅ · `build` ✅ (22 routes) · 22/22 tests manuels ✅.

## Décisions techniques Sprint 10

| Décision | Valeur |
|---|---|
| `priceCentsSnapshot` | Capturé à la création du RDV — fallback `service.priceCents` pour RDV antérieurs |
| Dépense totale | `priceCentsSnapshot ?? service.priceCents` — jamais depuis `Service.priceCents` actuel seul |
| Notes internes | Isolées par salon (`SalonClient.notes`) — vérification `findUnique` avant update |
| Conversion invité → client | `$transaction` + upsert Client/SalonClient — champs `guest*` conservés intacts |
| Isolation CRM | Toutes les requêtes via `SalonClient.salonId` — cross-tenant bloqué |
| Recherche | `OR` sur firstName/lastName/email/phone avec `mode: "insensitive"` |
| Pagination safePage | `Math.min(page, pageCount)` — dernière page valide sans redirect |
| organizationId | JWT uniquement — jamais depuis searchParams ou FormData |
| Déduplification | Jamais par téléphone en Sprint 10 |
| Zod v4 | `.issues[0]?.message` (pas `.errors`) pour les messages d'erreur |

## Condition de sortie du sprint

> ✅ PR `feature/sprint10-crm-clients` validée par ChatGPT et Hasan (22/22 tests manuels), mergée dans `main` (merge commit `361155b`), tag `v1.1.0-crm-clients`.
> ⚠️ Migration `20260624000001_crm_snapshot_and_indexes` à appliquer via `pnpm db:migrate` dès que Docker + `.env` disponibles.
> **Sprint 10 TERMINÉ.**

---

## Objectifs Sprint 9

- [x] Dépendance : `date-fns@4.4.0` installée.
- [x] `src/features/agenda/types.ts` — AgendaView, GridConfig, AgendaBlock, AgendaColumn, AgendaDayData, AgendaWeekData, SLOT_HEIGHT_REM.
- [x] `src/features/agenda/agenda.service.ts` — `getAgendaDay()`, `getAgendaWeek()`, `computeWeekStart()` (5 requêtes parallèles chacun, sans limite `take`).
- [x] `src/features/agenda/components/agenda-closed-day-banner.tsx` — bannière ClosedDay / salon fermé.
- [x] `src/features/agenda/components/agenda-time-ruler.tsx` — règle horaire (labels toutes les heures).
- [x] `src/features/agenda/components/agenda-appointment-block.tsx` — bloc RDV (tous statuts, `showEmployee` prop pour vue semaine, CANCELLED barré, NO_SHOW italique + "Absent").
- [x] `src/features/agenda/components/agenda-employee-column.tsx` — colonne employé + overlap detection (greedy) + zones hors-horaires hachurées + overlay "Repos".
- [x] `src/features/agenda/components/agenda-day-view.tsx` — vue jour (en-tête employés + couleurs, légende 5 statuts, NowIndicator si today).
- [x] `src/features/agenda/components/agenda-week-view.tsx` — vue semaine (7 colonnes, today surligné, lien vers vue jour, légende employés).
- [x] `src/features/agenda/components/agenda-now-indicator.tsx` — indicateur heure actuelle (Client Component, `Intl.DateTimeFormat` + `setInterval`).
- [x] `src/features/agenda/components/agenda-nav.tsx` — navigation ←/→/Aujourd'hui + toggle Jour/Semaine (Server Component, zéro `useSearchParams`).
- [x] `src/features/agenda/components/agenda-employee-filter.tsx` — filtre employé (Client Component, `useRouter`, zéro `useSearchParams`).
- [x] `src/app/(dashboard)/dashboard/agenda/page.tsx` — route `/dashboard/agenda` (searchParams : view, date, employeeId).
- [x] `src/app/(dashboard)/dashboard/page.tsx` — lien "Agenda" ajouté (9 liens total).
- [x] `typecheck` ✅ · `lint` ✅ · `build` ✅ (20 routes) · 20/20 tests manuels ✅.

## Décisions techniques Sprint 9

| Décision | Valeur |
|---|---|
| Positionnement blocs | CSS absolu (`top`/`height` en rem) calculé depuis `startMinute` et `gridConfig` |
| Overlap detection | Greedy interval grouping — blocs actifs subdivisés, inactifs pleine largeur |
| GridConfig enveloppe | `min(salon.start, allEmp.start)` / `max(salon.end, allEmp.end)` — aucun employé tronqué |
| Timezone serveur | `Intl.DateTimeFormat("fr-CA", { timeZone })` pour date string, `toZonedTime` pour minutes |
| NowIndicator | Client Component — `Intl.DateTimeFormat` avec prop `timezone`, `setInterval(60_000)` |
| AgendaNav | Server Component — `<Link>` purs, zéro `useSearchParams`, zéro Suspense boundary |
| AgendaEmployeeFilter | Client Component — `useRouter` (pas `useSearchParams`), zéro Suspense boundary |
| organizationId | JWT uniquement — jamais depuis searchParams |
| Requêtes Prisma | 5 `Promise.all` parallèles par appel service (employees, schedules, closedDays, salonSchedules, appointments) |
| showEmployee | Prop `boolean` sur `AgendaAppointmentBlock` — vue semaine affiche `employeeFirstName`, vue jour affiche `clientName` |
| CANCELLED / NO_SHOW | Visibles dans l'agenda — CANCELLED : gris + barré ; NO_SHOW : rouge + italique + label "Absent" |

## Condition de sortie du sprint

> ✅ PR `feature/sprint9-agenda` validée par ChatGPT et Hasan (20/20 tests manuels), mergée dans `main` (merge commit `36156b1`), tag `v1.0.0-agenda`.
> **Sprint 9 TERMINÉ.**

---

## Objectifs Sprint 8

- [x] Dépendance : `date-fns-tz@3.2.0` installée.
- [x] Migration `20260618120356_appointment_conflict_index` — index composite `@@index([employeeId, startAt, endAt])`.
- [x] `src/lib/permissions/appointment.permissions.ts` — `canManageAppointment()`.
- [x] `src/features/appointments/types.ts` — AppointmentStatus, AppointmentModificationType, ALLOWED_TRANSITIONS, STATUS_LABELS, STATUS_COLORS, **SLOT_INTERVAL_MINUTES = 15**, vues, états de form.
- [x] `src/features/appointments/appointment.schema.ts` — CreateAppointmentSchema (email normalisé via preprocess), UpdateAppointmentSchema, CancelAppointmentSchema, UpdateStatusSchema.
- [x] `src/features/appointments/appointment-modification.service.ts` — logModification (champ **modifiedById** confirmé), getModifications.
- [x] `src/features/appointments/appointment.service.ts` — createAppointment, updateAppointment, cancelAppointment, updateAppointmentStatus, getAppointments, getAppointment, getServiceEmployeesMap, getActiveServices, getEmployeesForService.
- [x] `src/features/appointments/slots.service.ts` — getAvailableSlots (timezone-aware, sans N+1).
- [x] `src/features/schedules/availability.service.ts` — Step 8 rempli + `options?: { excludeAppointmentId?, startAtUTC? }`.
- [x] `src/features/appointments/components/appointment-status-badge.tsx`
- [x] `src/features/appointments/components/appointment-list.tsx`
- [x] `src/features/appointments/components/appointment-form.tsx`
- [x] `src/features/appointments/components/appointment-detail.tsx`
- [x] Routes `/dashboard/appointments` (liste + filtres), `/dashboard/appointments/new`, `/dashboard/appointments/[id]`.
- [x] Hub `/dashboard` — lien "Rendez-vous" ajouté (7 liens total).
- [x] `typecheck` ✅ · `lint` ✅ · `build` ✅ · `db:seed` ✅.
- [x] 24/24 tests manuels ✅.

## Décisions techniques Sprint 8

| Décision | Valeur |
|---|---|
| Timezone | `fromZonedTime()` de `date-fns-tz` v3 — saisie locale → UTC pour stockage |
| Email normalization | `email.trim().toLowerCase()` dans Zod preprocess ET dans `resolveOrCreateClient` |
| SLOT_INTERVAL_MINUTES | Constante 15 dans `types.ts` (pas de valeur magique) |
| modifiedById | Champ Prisma confirmé (pas `actorProUserId`) |
| Conflit RDV | `isEmployeeAvailable` Step 8 + param `startAtUTC` pour timezone correcte |
| getAvailableSlots | 1 requête appels parallèles + filtrage mémoire (pas N+1) |
| organizationId | JWT uniquement — jamais depuis FormData |
| Race condition | Documentée : READ COMMITTED ne prévient pas les phantom reads (MVP) |

## Condition de sortie du sprint

> ✅ PR `feature/sprint8-appointments` validée par ChatGPT et Hasan (24/24 tests), mergée dans `main` (commit `43f37eb`), tag `v0.9.0-appointments`.
> **Sprint 8 TERMINÉ.**

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
- **Sprint 6 — Employees & Services** ✅ — tag `v0.7.0-employees-services`.
- **Sprint 7 — Horaires & Disponibilités** ✅ — tag `v0.8.0-schedules`.
- **Sprint 8 — Rendez-vous** ✅ — tag `v0.9.0-appointments`.
- **Sprint 9 — Agenda visuel** ✅ — tag `v1.0.0-agenda`.
- **Sprint 10 — CRM Clients** ✅ — tag `v1.1.0-crm-clients`.
- **Sprint 11 — Réservation Publique** ✅ — tag `v1.2.0-public-booking`.
- **Sprint 12 — Notifications Email** ✅ — tag `v1.3.0-email-notifications`.
- **Sprint 13 — Dashboard & KPI** ✅ — tag `v1.4.0-dashboard-kpi`.
- **Sprint 14 — Module Caisse POS** ✅ — tag `v1.5.0-payments-pos`.
- **Sprint 15 — Professionnalisation** ✅ — tag `v1.6.0-reminders-receipts`.

---

## Objectifs Sprint 15 (TERMINÉ ✅)

- [x] Vercel CRON `"0 * * * *"` → `/api/cron/reminders` sécurisé `CRON_SECRET`.
- [x] `reminder.service.ts` : fenêtre 22–26h, CONFIRMED, déduplication Notification.none SENT.
- [x] `notification.service.ts` : dispatch exhaustif CONFIRMATION | REMINDER | CANCELLED + throw final.
- [x] `appointment-reminder.template.ts` : email HTML ambre, Prestation/Coiffeur/Date/Durée, sans prix.
- [x] `SalonReceiptCounter` : modèle Prisma + migration `20260624000003_receipt_counter`.
- [x] `receipt.service.ts` : upsert atomique dans `$transaction`, format `{YEAR}-{00001}`.
- [x] `payment.service.ts` : receiptNumber injecté, `year = paidAt.getUTCFullYear()`.
- [x] `/dashboard/payments/[id]/receipt` : reçu imprimable + bandeau ANNULÉ.
- [x] `ReceiptPrintButton` : Client Component, `print:hidden`, `window.print()`.
- [x] Lien "Imprimer le reçu →" dans page détail si receiptNumber.
- [x] 54/54 vérifications PASS · 0 régression Sprint 12/14.

---

_Dernière mise à jour : 2026-06-24 — Sprint 15 Professionnalisation TERMINÉ, tag v1.6.0-reminders-receipts._
