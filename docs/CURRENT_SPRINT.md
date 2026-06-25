# CURRENT_SPRINT — Sprint en cours (KalendHair 4.0)

> À lire **avant d'agir**. Claude ne travaille que sur ce qui est dans ce sprint.

---

## Sprint actuel

**Phase Stabilisation Production** — TERMINÉE ✅ (PR #46 mergée, SHA `46882a0`, déploiement `dpl_GYSE6t8MgFdJXzMX4NA64poViJi5`)

**Sprint 20 — Commissions Employés** — TERMINÉ ✅ (PR #41 mergée, tag v2.1.0-commissions)

**Sprint 19 — Super Admin SaaS** — TERMINÉ ✅ (PR #39 mergée, tag v2.0.0-super-admin)

**Sprint 18 — Abonnements SaaS & Facturation (Core sans Stripe)** — TERMINÉ ✅

---

## Phase actuelle : Product Phase 1 — Marketing Website v1 (EN COURS)

> Branche `marketing/website-v1-architecture` — PR #50 ouverte.
> En attente validation finale ChatGPT avant toute implémentation.

### Objectifs de la phase Marketing Website v1

- [x] `docs/MARKETING_WEBSITE_V1.md` v1.0 — architecture initiale (PR #50, Session 48)
- [x] `docs/MARKETING_WEBSITE_V1.md` v1.1 — révision ChatGPT intégrée (Session 49)
  - [x] Page `/demo` — galerie produit avec onglets
  - [x] Page `/pourquoi-kalendhair` — bénéfices métier + comparatif
  - [x] Page `/a-propos` — histoire, vision, engagement
  - [x] Page `/roadmap` — disponible / en prépa / prévu (mention non-contractuel)
  - [x] Page `/aide` — base de connaissances, FAQ, tutoriels, support
  - [x] CTA révisé : "Essayer gratuitement" / "Rejoindre les premiers salons pilotes"
  - [x] Stratégie salon de démonstration documentée (20 captures, salon "L'Atelier Lumière")
- [x] `npm run lint` ✅ · `npm run typecheck` ✅
- [x] Validation finale ChatGPT — validée
- [x] PR1 — Structure & Layout : `marketing-nav`, `marketing-footer`, composants UI de base, layout `(marketing)`, page placeholder. Mergée.
- [x] PR2 — Homepage `/` : `HeroSection` (quasi-plein-écran, dot grid, glow, 2 CTAs), `TrustStrip` (4 items factuels), `ModuleGrid` (9 modules + `ModuleCard`). PR ouverte, en attente validation ChatGPT.
- [ ] PR3 — Pages produit : `/fonctionnalites`, `/demo`, `/pourquoi-kalendhair`
- [ ] PR4 — Pages ressources : `/tarifs`, `/a-propos`, `/roadmap`, `/aide`
- [ ] PR5 — Page `/contact` + Server Action + `/contact/merci`
- [x] PR6 — Pages légales : `/mentions-legales`, `/confidentialite`, `/conditions-utilisation` (PR #57)
- [ ] PR7 — SEO : `sitemap.ts`, `robots.ts`, JSON-LD, metadata complètes
- [ ] Constitution du salon de démonstration "L'Atelier Lumière"
- [ ] 20 captures produit (après salon démo constitué)

### Contraintes de la phase

- Aucune implémentation avant validation ChatGPT
- Aucun Sprint 21 avant fin du pilote fermé
- RESEND non configuré (à activer uniquement sur validation Hasan)
- `salon-beaute-test` conservé (ne pas supprimer sans validation Hasan)

---

## Phase Pilote Fermé — OPÉRATIONNEL 🚀

> PR #49 mergée (SHA `0e3cd2a`), déploiement `dpl_EV43Eg9Tk65b2SQgrpXpursjxrqH` READY.

### Objectifs de la phase pilote fermée

- [x] `docs/PILOT_RUNBOOK.md` — runbook opérationnel complet (18 sections)
- [x] `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅
- [x] Review ChatGPT — validée
- [x] Merge PR #49 — `main` HEAD `0e3cd2a`
- [x] Déploiement production READY — `dpl_EV43Eg9Tk65b2SQgrpXpursjxrqH`
- [x] Tests runtime 5/5 ✅
- [ ] Sélection des premiers salons pilotes (3–5 salons) — décision Hasan
- [ ] Onboarding premier salon pilote — processus manuel via Super Admin

---

## Objectifs Sprint 20 — Commissions Employés (TERMINÉ ✅)

- [x] Migration `20260624000009_commissions` — 2 enums (`commission_type`, `commission_entry_status`) + 3 tables (`commission_rules`, `commission_entries`, `commission_adjustments`) + FK Cascade/Restrict/SetNull. Additive — zéro DROP/ALTER TABLE (Claude).
- [x] `prisma/schema.prisma` modifié — 2 nouveaux enums (`CommissionType`, `CommissionEntryStatus`) + 3 nouveaux modèles (`CommissionRule`, `CommissionEntry`, `CommissionAdjustment`) + back-relations sur Organization, ProUser, Salon, Employee, Service, Product, Payment, PaymentLine, Appointment (Claude).
- [x] `src/features/commissions/types.ts` — CommissionType, CommissionEntryStatus, CommissionRuleView, CommissionEntryView, CommissionAdjustmentView, CommissionSummary, CommissionEntriesPage, CommissionRulesPage, TopCommissionEmployee, CommissionKpi, CommissionOverview, RuleFormState, AdjustFormState (Codex).
- [x] `src/features/commissions/commission.schema.ts` — CreateCommissionRuleSchema (refine : serviceId XOR productId, PERCENTAGE → 1–100), UpdateCommissionRuleSchema, DeactivateCommissionRuleSchema, AdjustCommissionSchema (deltaCents ≠ 0, reason min 10 chars) (Codex).
- [x] `src/lib/permissions/commission.permissions.ts` — `canManageCommissionRules()` (OWNER uniquement), `canViewCommissions()` (OWNER + MANAGER), `canAdjustCommissions()` (OWNER uniquement) (Claude).
- [x] `src/features/commissions/commission-calculator.service.ts` — `ruleSpecificity()` (0–3), `resolveRule()` (tri DESC spécificité → DESC createdAt, premier match), `calculateAndRecordCommissions(tx, opts)` — appelé uniquement dans `$transaction` existant (Claude).
- [x] `src/features/commissions/commission-rule.service.ts` — `getCommissionRules`, `getCommissionRule`, `createCommissionRule`, `updateCommissionRule` (type+valeur), `deactivateCommissionRule` (guard) (Claude).
- [x] `src/features/commissions/commission-entry.service.ts` — `getCommissionEntries` (paginé), `getCommissionEntriesForPayment`, `getEmployeeCommissions`, `getEmployeeCommissionSummary` (CANCELLED exclus), `getCommissionOverview` (byEmployee, CANCELLED exclus), `adjustCommission` ($transaction, guard CANCELLED) (Claude).
- [x] `src/features/payments/payment.service.ts` modifié — `createPaymentForAppointment` : intègre `calculateAndRecordCommissions(tx)` dans `$transaction` · `cancelPayment` : wrappé dans `$transaction` + `commissionEntry.updateMany({status: CANCELLED})` atomique (Claude).
- [x] `src/features/inventory/stock.service.ts` modifié — `createProductSalePayment` : résolution `employee.findFirst({proUserId, salonId})` + `calculateAndRecordCommissions(tx)` si employé trouvé (Claude).
- [x] `src/features/dashboard/types.ts` modifié — `TopCommissionEmployee`, `CommissionKpi`, `DashboardKpi` étendu (Claude).
- [x] `src/features/dashboard/dashboard.service.ts` modifié — `fetchCommissionTotals` + `fetchTopCommissionEmployees` + `getDashboardKpi` 9 agrégats (Claude).
- [x] 7 composants UI (Codex) : `commission-status-badge`, `commission-summary-card`, `commission-entry-table` (`showEmployee?`), `commission-rule-list` (Client), `commission-rule-form` (Client), `commission-adjust-form` (Client), `kpi-commission-card`.
- [x] `src/app/(dashboard)/dashboard/commissions/rules/actions.ts` — `createCommissionRuleAction`, `updateCommissionRuleAction`, `deactivateCommissionRuleAction` (Claude).
- [x] `src/app/(dashboard)/dashboard/commissions/actions.ts` — `adjustCommissionAction` (OWNER uniquement) (Claude).
- [x] `src/app/(dashboard)/dashboard/commissions/page.tsx` — vue d'ensemble par employé (OWNER + MANAGER) (Claude).
- [x] `src/app/(dashboard)/dashboard/commissions/rules/page.tsx` — liste règles actives/inactives (OWNER) (Claude).
- [x] `src/app/(dashboard)/dashboard/commissions/rules/new/page.tsx` — création règle (Claude).
- [x] `src/app/(dashboard)/dashboard/commissions/rules/[id]/edit/page.tsx` — modification règle (`boundAction` typé `RuleFormState`) (Claude).
- [x] `src/app/(dashboard)/dashboard/employees/[id]/commissions/page.tsx` — commissions employé + ajustement (Claude).
- [x] `src/app/(dashboard)/dashboard/payments/[id]/page.tsx` modifié — `CommissionEntryTable` avec `showEmployee={true}` (Claude).
- [x] `src/app/(dashboard)/dashboard/kpi/page.tsx` modifié — `KpiCommissionCard` (Claude).
- [x] `src/app/(dashboard)/dashboard/page.tsx` modifié — lien "Commissions" (Claude).
- [x] `prisma validate` ✅ · `prisma generate` ✅ · `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ (Claude).
- [x] Score final : **45/45 PASS** — T01→T45 + sections transactions, algorithme de priorité, sécurité, régressions, risques non bloquants.

## Décisions techniques Sprint 20

| Décision | Valeur |
|---|---|
| Atomicité commissions | `calculateAndRecordCommissions(tx)` uniquement dans `$transaction` existant — jamais hors transaction |
| Algorithme priorité | spécificité = (employeeId ? 2 : 0) + (serviceId ∥ productId ? 1 : 0) ; tri DESC spécificité → DESC createdAt ; premier match |
| CommissionEntry immuable | `commissionCents` jamais modifié ; tout delta via `CommissionAdjustment.deltaCents` ; net = base + SUM(deltas) |
| Annulation paiement | `cancelPayment` wrappé dans `$transaction` → `commissionEntry.updateMany({status: CANCELLED})` atomique |
| ProUser → Employee (produits) | `employee.findFirst({proUserId, salonId, isActive: true})` dans tx ; introuvable → commission silencieusement ignorée |
| CANCELLED exclus des KPI | `getEmployeeCommissionSummary`, `getCommissionOverview`, `fetchCommissionTotals` : `status: { not: "CANCELLED" }` |
| organizationId | Toujours depuis `session.organizationId` (JWT) — aucune donnée commission depuis client FormData |
| salonId | Toujours depuis `getSalon(session.organizationId)` server-side |
| Migration | Strictement additive — 2 CREATE TYPE + 3 CREATE TABLE, zéro DROP/ALTER TABLE existant |
| Permissions | `canManageCommissionRules` + `canAdjustCommissions` = OWNER uniquement ; `canViewCommissions` = OWNER + MANAGER |

## Risques non bloquants Sprint 20

| ID | Risque | Sévérité |
|---|---|---|
| R1 | UX ajustement : formulaire fixé sur le premier entry du paginator | LOW |
| R2 | `cancelPayment` sans `tx` explicite en signature (fonctionnel) | LOW |
| R3 | Filtre rules par `salonId` uniquement (cosmétique, sécurisé par FK) | LOW |
| R4 | Bouton "Règles" visible en MANAGER (redirect server-side actif) | LOW |
| R5 | `createFreePayment` sans commission (comportement voulu) | LOW |

## Condition de sortie du sprint

> ✅ PR `feature/sprint20-commissions` (#41) validée par ChatGPT (45/45 PASS), mergée dans `main` (merge commit `b44e07f`), tag `v2.1.0-commissions`.
> **Sprint 20 TERMINÉ.**

---

## Objectifs Sprint 19 — Super Admin SaaS (TERMINÉ ✅)

- [x] Migration `20260624000007_super_admin` — enum `admin_action` (11 valeurs initiales) + 6 tables : `admin_users`, `admin_audit_logs`, `admin_impersonation_logs`, `organization_admin_notes`, `billing_discounts`, `billing_change_cycles`. Additive — zéro DROP/ALTER TABLE (Claude).
- [x] Migration `20260624000008_admin_note_audit` — `ALTER TYPE "admin_action" ADD VALUE IF NOT EXISTS` pour ADD_NOTE, UPDATE_NOTE, DELETE_NOTE. Additive (Claude).
- [x] `prisma/schema.prisma` modifié — AdminUser, AdminAuditLog, AdminImpersonationLog, OrganizationAdminNote, BillingDiscount + 14 valeurs d'enum AdminAction (Claude).
- [x] `src/features/admin/types.ts` — 12 types (OrgListItem, OrgAdminView, AdminAuditLogEntry, etc.) (Claude).
- [x] `src/features/admin/admin.schema.ts` — 10 schémas Zod : ChangePlanSchema, GrantFreePlanSchema, RevokeFreePlanSchema, CreateDiscountSchema, DeactivateDiscountSchema, SuspendSchema, ReactivateSchema, ExtendTrialSchema, AddNoteSchema, UpdateNoteSchema, DeleteNoteSchema, AdminLoginSchema (Claude).
- [x] `src/features/admin/admin.service.ts` — 13 fonctions exportées : getAllOrganizations, getOrganizationById, getAdminAuditLogs, changeOrganizationPlan, grantFreePlan, revokeFreePlan, createDiscount, deactivateDiscount, suspendOrganization, reactivateOrganization, extendTrial, addOrganizationNote, updateOrganizationNote, deleteOrganizationNote, startImpersonation, endImpersonation. Toutes les mutations dans `$transaction` avec `logAdminAction` (Claude).
- [x] `src/features/admin/admin-audit.service.ts` — `logAdminAction()` prend `TransactionClient` (Claude).
- [x] `src/features/admin/auth.service.ts` — `verifyAdminCredentials`, `getAdminSession` (JWT `admin_session` cookie séparé) (Claude).
- [x] `src/features/admin/components/note-item.tsx` — Client Component avec useState (view/edit/delete) + useActionState pour updateAction et deleteAction (Claude).
- [x] `src/app/(admin)/admin/login/page.tsx` + `actions.ts` — `adminLoginAction` (Claude).
- [x] `src/app/(admin)/admin/organizations/page.tsx` — liste toutes les organisations (Claude).
- [x] `src/app/(admin)/admin/organizations/[id]/page.tsx` — détail org + NoteItem (Claude).
- [x] `src/app/(admin)/admin/organizations/[id]/actions.ts` — 9 Server Actions dont updateNoteAction, deleteNoteAction (Claude).
- [x] `src/app/(admin)/admin/audit/page.tsx` — log d'audit global (Claude).
- [x] `src/app/(admin)/admin/impersonate/start/route.ts` + `end/route.ts` — Route Handlers impersonation (Claude).
- [x] `src/features/dashboard/components/impersonation-banner.tsx` — Client Component `useSyncExternalStore` (Claude).
- [x] `src/app/(dashboard)/dashboard/suspended/page.tsx` — page suspension (Claude).
- [x] `middleware.ts` — remplacement de `proxy.ts` : dual JWT check, impersonation, suspension, x-pathname header (Claude).
- [x] `prisma/seed.ts` modifié — upsert `admin@kalend.dev` / `AdminDev123!` (Claude).
- [x] `prisma validate` ✅ · `prisma generate` ✅ · `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ (Claude).
- [x] Score final : **62/62 PASS** — T01→T62 + sections Impersonation, JWT, AdminUser, Migration, Risques.

## Décisions techniques Sprint 19

| Décision | Valeur |
|---|---|
| Dual JWT | `session` (tenant, HS256, `JWT_SECRET`) vs `admin_session` (admin, HS256, `admin:${JWT_SECRET}`) — zéro croisement |
| AdminUser | Credentials séparés, pas de ProRole, pas d'organizationId dans le payload |
| logAdminAction | Toujours dans `$transaction(tx)` — mutation et audit atomiques |
| AdminAction enum | 14 valeurs — ADD_NOTE/UPDATE_NOTE/DELETE_NOTE ajoutées par migration additive |
| Cross-org guard notes | `note.organizationId !== orgId` → throw avant toute écriture |
| DELETE_NOTE reason | Minimum 10 caractères — validé Zod + champ `minLength` UI |
| NoteItem | useState mode + useActionState — un seul composant Client pour edit/delete |
| ImpersonationBanner | `useSyncExternalStore` pour lecture cookie côté client (ESLint compliant) |
| middleware.ts | Remplace proxy.ts — `x-pathname` header forwarding pour éviter /dashboard/suspended redirect infini |
| Migration enum | `ALTER TYPE ... ADD VALUE IF NOT EXISTS` — idempotente, additive, zéro DROP |

## Condition de sortie du sprint

> ✅ PR `feature/sprint19-super-admin` (#39) validée par ChatGPT (62/62 PASS), mergée dans `main` (merge commit `4b501a2`), tag `v2.0.0-super-admin`.
> **Sprint 19 TERMINÉ.**

---

## Objectifs Sprint 18 (TERMINÉ ✅)

- [x] Migration `20260624000006_billing_core` — 3 enums (`subscription_plan_code`, `billing_cycle`, `org_subscription_status`) + 2 tables (`billing_plans`, `organization_subscriptions`). Additive — zéro DROP/ALTER TABLE existant (Claude).
- [x] `prisma/seed.ts` modifié — upsert 3 billing plans : ESSENTIAL (29€/290€, 1 salon, 2 employés), PRO (59€/590€, 3 salons, 10 employés), BUSINESS (99€/990€, illimités) (Claude).
- [x] `src/features/billing/types.ts` — 8 types : PlanCode, BillingCycleType, OrgSubStatus, BillingPlanView, OrgSubscriptionView, QuotaStatus, BillingQuota, BillingDashboard, UpgradePlanFormState (Codex).
- [x] `src/features/billing/billing.schema.ts` — UpgradePlanSchema, ChangeBillingCycleSchema (Zod v4) (Codex).
- [x] `src/features/billing/components/billing-status-badge.tsx` — badge TRIAL/ACTIVE/PAST_DUE/CANCELED (Codex).
- [x] `src/features/billing/components/plan-card.tsx` — carte plan : nom, prix, économies annuelles, quotas, features hardcodées par plan (Codex).
- [x] `src/features/billing/components/billing-quota-card.tsx` — quotas salons/employés avec barres de progression (Codex).
- [x] `src/features/billing/components/billing-current-plan.tsx` — Client Component : plan actuel + changement cycle + upgrade vers autres plans (Codex).
- [x] `src/features/billing/billing.service.ts` — 8 fonctions exportées : getCurrentSubscription, getSubscriptionPlan, getActivePlans, canCreateSalon, canCreateEmployee, getRemainingQuota, isFeatureEnabled (backward compat : true si pas d'abonnement), getBillingDashboard, upsertSubscription (simulation ACTIVE) (Claude).
- [x] `src/lib/permissions/billing.permissions.ts` — 4 helpers : canUseInventory, canUsePayments, canUseSuppliers, canUseDashboard (Claude).
- [x] `src/app/(dashboard)/dashboard/billing/actions.ts` — upgradePlanAction, changeBillingCycleAction (Claude).
- [x] `src/app/(dashboard)/dashboard/billing/page.tsx` — dashboard abonnement : plan actuel, statut, période, quotas (Claude).
- [x] `src/app/(dashboard)/dashboard/plans/page.tsx` — catalogue plans avec marquage plan actuel (Claude).
- [x] `src/app/(dashboard)/dashboard/page.tsx` modifié — 2 nouveaux liens : Mon abonnement + Plans (Claude).
- [x] 5 pages modifiées avec guards billing — redirect `/dashboard/billing` si plan insuffisant : kpi, inventory, payments, suppliers, purchase-orders (Claude).
- [x] `prisma validate` ✅ · `prisma generate` ✅ · `tsc --noEmit` ✅ · `eslint` ✅ · `build` ✅ (53 routes) · 0 régression Sprint 17.
- [x] PR #37 ouverte (`feature/sprint18-billing-core`).

## Décisions techniques Sprint 18

| Décision | Valeur |
|---|---|
| Pas de Stripe | Simulation uniquement — `upsertSubscription` force `status = ACTIVE`, pas de paiement réel |
| `BillingPlan` ≠ `SubscriptionPlan` | Conflit de nom avec enum Sprint 2 → modèle `BillingPlan` + table `billing_plans` |
| `OrgSubscriptionStatus` ≠ `SubscriptionStatus` | Conflit de valeurs avec enum Sprint 2 → `OrgSubscriptionStatus` + `org_subscription_status` |
| Backward compat | `isFeatureEnabled` retourne `true` si `getCurrentSubscription` retourne `null` — zéro régression installations existantes |
| organizationId | Toujours depuis `session.organizationId` (JWT) — jamais depuis FormData |
| Feature gates | ESSENTIAL bloque : kpi, inventory, suppliers, payments. PRO/BUSINESS : tout ouvert |
| Simulation période | MONTHLY : +1 mois depuis now. YEARLY : +12 mois depuis now |
| `upsertSubscription` | Toujours `status: "ACTIVE"` — pas de `TRIALING`, pas de `status` depuis le client |
| Migration | Strictement additive — zéro `ALTER TABLE` sur tables existantes, zéro DROP |
| Seed plans | Upsert idempotent par `code` — relancer le seed ne crée pas de doublons |

## Condition de sortie du sprint

> ✅ PR `feature/sprint18-billing-core` (#37) validée par ChatGPT et Hasan (27/27 tests PASS), mergée dans `main` (merge commit `1688938`), tag `v1.9.0-billing-core`.
> **Sprint 18 TERMINÉ.**

---

**Sprint 17 — Fournisseurs & Bons de Commande** — TERMINÉ ✅

**Sprint 16 — Gestion des Stocks & Produits** — TERMINÉ ✅

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

## Objectifs Sprint 17 (TERMINÉ ✅)

- [x] Migration `20260624000005_suppliers_purchase_orders` — `ALTER TYPE stock_movement_type ADD VALUE IF NOT EXISTS 'PURCHASE_RECEIPT'` + enum `purchase_order_status` (DRAFT/SENT/PARTIALLY_RECEIVED/RECEIVED/CANCELLED) + 5 tables (suppliers, purchase_orders, purchase_order_lines, purchase_order_receipts, purchase_order_receipt_lines). Additive — zéro ALTER TABLE.
- [x] `src/lib/permissions/supplier.permissions.ts` — `canManageSuppliers()` → `canAccessTenant` (Claude).
- [x] `src/lib/permissions/purchase-order.permissions.ts` — `canManagePurchaseOrders()` (OWNER + MANAGER) (Claude).
- [x] `src/features/suppliers/types.ts` — SupplierView, SupplierSummary, SuppliersPage, SupplierFormState (Codex).
- [x] `src/features/suppliers/supplier.schema.ts` — CreateSupplierSchema, UpdateSupplierSchema (Zod v4) (Codex).
- [x] `src/features/suppliers/supplier.service.ts` — getSuppliers, getSupplierSummaries, getSupplier, createSupplier (unicité nom), updateSupplier, deactivateSupplier (**CR-01 : garde DRAFT/SENT ouverts**) (Claude).
- [x] `src/features/purchase-orders/types.ts` — 8 types (Codex).
- [x] `src/features/purchase-orders/purchase-order.schema.ts` — CreatePurchaseOrderSchema, AddPurchaseOrderLineSchema, ReceiveStockSchema (Zod v4) (Codex).
- [x] `src/features/purchase-orders/purchase-order.service.ts` — 7 fonctions : getPurchaseOrders (filtre status/supplierId/search), getPurchaseOrder, createPurchaseOrder, addOrderLine, removeOrderLine, sendPurchaseOrder, cancelPurchaseOrder (Claude).
- [x] `src/features/purchase-orders/receipt.service.ts` — `receiveStock` : `prisma.$transaction` complet — validation, receipt, applyStockMovement PURCHASE_RECEIPT, product.costPriceCents, receiptLine, status RECEIVED/PARTIALLY_RECEIVED. **CR-02 : `verifiedProductId = line.productId`** (Claude).
- [x] `src/features/inventory/stock.service.ts` modifié — `applyStockMovement` exporté, `PURCHASE_RECEIPT` dans le type union, retourne `Promise<{ id: string }>` (non-breaking) (Claude).
- [x] `src/features/inventory/product.service.ts` modifié — ajout `getProductSummaries` (Claude).
- [x] `src/features/inventory/components/stock-history-table.tsx` modifié — `TYPE_LABELS.PURCHASE_RECEIPT = "Réception commande"` (Claude).
- [x] `eslint.config.mjs` modifié — `argsIgnorePattern: "^_"` (Claude).
- [x] `src/app/(dashboard)/dashboard/page.tsx` modifié — 2 liens Fournisseurs + Commandes (Claude).
- [x] 3 composants fournisseurs (Codex) : supplier-list, supplier-form ("use client"), supplier-detail ("use client").
- [x] 7 composants bons de commande (Codex) : purchase-order-list, purchase-order-form, purchase-order-lines-form, purchase-order-detail, purchase-order-status-badge, purchase-order-receive-form, receipt-history-table.
- [x] 4 routes + actions fournisseurs : `/dashboard/suppliers`, `/suppliers/new`, `/suppliers/[id]`, `/suppliers/[id]/edit` (Claude).
- [x] 5 routes + actions bons de commande : `/dashboard/purchase-orders`, `/new`, `/[id]`, `/[id]/lines`, `/[id]/receive` (Claude).
- [x] **CR-03** : filtre statut `<select>` dans la page liste — transmission `searchParams.status` à `getPurchaseOrders` (Claude).
- [x] 3 corrections post-review : CR-01 (T05), CR-02 (sécurité multi-tenant), CR-03 (T22).
- [x] `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (51 routes) · 23/23 tests PASS · 0 régression Sprint 14/15/16.
- [x] Contributeurs : Claude Sonnet 4.6 (architecture, services, migration, permissions, pages, actions, corrections) + OpenAI Codex (types, schémas Zod, 10 composants UI).

## Décisions techniques Sprint 17

| Décision | Valeur |
|---|---|
| `PurchaseOrderStatus` | Machine à états stricte — transitions validées côté service ET page (double protection) |
| `applyStockMovement` | Exporté, `PURCHASE_RECEIPT` ajouté, retourne `{ id: string }` — non-breaking pour les 4 appelants existants |
| `verifiedProductId` | Toujours `line.productId` depuis le `lineMap` chargé server-side — jamais `incoming.productId` du client |
| `$transaction` réception | Validation complète avant toute écriture — rollback atomique si une ligne échoue |
| `referenceId / referenceType` | `purchaseOrderReceiptId` / `"PURCHASE_ORDER_RECEIPT"` dans `StockMovement` — sans migration `stock_movements` |
| Filtre statut UI | `VALID_STATUSES.includes(status as PurchaseOrderStatus)` — validation avant transmission au service |
| `deactivateSupplier` | `prisma.purchaseOrder.count({ status: { in: ["DRAFT","SENT"] } })` avant `isActive = false` |
| Migration | `ALTER TYPE ... ADD VALUE IF NOT EXISTS` — idempotente et additive |
| Montants | Toujours en centimes — conversion euros→centimes dans les Server Actions (`Math.round(parseFloat(x) * 100)`) |
| `bind` pattern | `removeOrderLineAction.bind(null, lineId, orderId, null) as unknown as (fd) => Promise<void>` — compatibilité TypeScript form action |

## Condition de sortie du sprint

> ✅ PR `feature/sprint17-suppliers-purchase-orders` (#35) validée par ChatGPT (après 3 corrections post-review CR-01/CR-02/CR-03), mergée dans `main` (merge commit `cfda0aa`), tag `v1.8.0-suppliers-purchase-orders`.
> **Sprint 17 TERMINÉ.**

---

## Objectifs Sprint 16 (TERMINÉ ✅)

- [x] Migration `20260624000004_inventory_stock` — enum `stock_movement_type` (ENTRY, SALE, USAGE, ADJUSTMENT), tables `product_categories` + `products` + `product_stocks` + `stock_movements`, 6 index, FK Restrict/SetNull/Cascade. Additive — zéro ALTER TABLE.
- [x] `src/lib/permissions/inventory.permissions.ts` — `canManageInventory()` (OWNER via `canAccessTenant`), `canAdjustStock()` (OWNER + MANAGER).
- [x] `src/features/inventory/types.ts` — 8 types : ProductCategoryView, ProductView, ProductSummary, StockMovementView, LowStockProduct, InventoryDashboard, ProductsPage, StockMovementsPage.
- [x] `src/features/inventory/product.schema.ts` — 6 schémas Zod : CreateProductCategorySchema, CreateProductSchema, UpdateProductSchema, RecordEntrySchema, RecordUsageSchema, AdjustStockSchema (notes `min(1)` obligatoires), SellProductSchema (CASH|CARD|TRANSFER|OTHER — sans CHECK).
- [x] `src/features/inventory/product.service.ts` — 7 fonctions : createProductCategory, getProductCategories, createProduct, getProduct, updateProduct, deactivateProduct (garde `quantity > 0` T05), getProducts.
- [x] `src/features/inventory/stock.service.ts` — `assertSufficientStock` (interne, dans `$transaction`), `applyStockMovement` (interne, `TransactionClient`), `recordEntry`, `deductStockForSale` (prend `TransactionClient`), `createProductSalePayment` (`$transaction` : getNextReceiptNumber → payment → paymentLine → deductStockForSale), `recordUsage`, `adjustStock`, `getLowStockProducts`, `getStockMovements`, `getInventoryDashboard`.
- [x] 10 composants UI : StockBadge (4 états), LowStockAlert, InventoryStatsCard, ProductList, ProductForm, StockMovementForm (notes `required` si mode=adjust T11), SellProductForm (sans CHECK T14), StockHistoryTable, DeactivateProductButton (`useActionState` T04), CategoryForm (T06).
- [x] 10 routes + actions : `/dashboard/inventory`, `/dashboard/inventory/products`, `/dashboard/inventory/products/new`, `/dashboard/inventory/products/[id]` (section désactivation T04), `/dashboard/inventory/products/[id]/edit`, `/dashboard/inventory/entry`, `/dashboard/inventory/sell`, `/dashboard/inventory/movements`, `/dashboard/inventory/categories` (T06), `/dashboard/inventory/categories/new` (P2002 T07).
- [x] `src/app/(dashboard)/dashboard/page.tsx` modifié — 13ème lien "Stocks & Produits".
- [x] `prisma/schema.prisma` modifié — 4 nouveaux modèles + 1 enum + back-relations sur Salon et ProUser.
- [x] 6 corrections post-review ChatGPT : T04 (DeactivateProductButton), T05 (garde stock > 0), T06 (flux catégories complet), T07 (P2002 → message utilisateur), T11 (notes obligatoires en ADJUSTMENT), T14 (suppression CHECK).
- [x] `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (42 routes) · 0 régression Sprint 14/15.
- [x] Contributeurs : Claude Sonnet 4.6 (architecture complète — permissions, services, migrations, pages, actions, composants, corrections).

## Décisions techniques Sprint 16

| Décision | Valeur |
|---|---|
| `ProductStock` | Source de vérité atomique — jamais dérivé depuis SUM(StockMovement) ; upsert dans `$transaction` |
| `StockMovement` | Audit trail immuable — `onDelete: Restrict` sur product + salon FKs |
| `assertSufficientStock` | Interne, appelé dans `$transaction` avant SALE et USAGE — throw si `current < quantity` |
| `applyStockMovement` | Interne, prend `TransactionClient` — upsert ProductStock + create StockMovement atomiques |
| `createProductSalePayment` | `$transaction` : getNextReceiptNumber → payment.create → paymentLine.create → deductStockForSale |
| `canManageInventory` | OWNER uniquement (via `canAccessTenant`) |
| `canAdjustStock` | OWNER + MANAGER (via `isSameTenant` + role check) |
| `AdjustStockSchema.notes` | `z.string().min(1, "...")` — obligatoire pour tout ajustement |
| `SellProductSchema.method` | `z.enum(["CASH", "CARD", "TRANSFER", "OTHER"])` — sans CHECK (cohérent Sprint 14) |
| Désactivation produit | Garde `quantity > 0` avant `isActive = false` — message explicite à l'utilisateur |
| P2002 catégorie | `Prisma.PrismaClientKnownRequestError + err.code === "P2002"` → message utilisateur |
| Multi-tenant | `salonId + organizationId` dans chaque clause `where` — injectés server-side depuis JWT |
| Migration | Strictement additive — zéro `ALTER TABLE` sur tables existantes |
| Dette Sprint 17 | Pas d'inversion automatique de stock lors de l'annulation d'un paiement (MVP documenté) |

## Condition de sortie du sprint

> ✅ PR `feature/sprint16-inventory` (#33) validée par ChatGPT (après 6 corrections post-review), mergée dans `main` (merge commit `600882e`), tag `v1.7.0-inventory`.
> **Sprint 16 TERMINÉ.**

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

_Dernière mise à jour : 2026-06-25 — Phase Stabilisation Production TERMINÉE, PR #46 mergée (SHA 46882a0), déploiement dpl_GYSE6t8MgFdJXzMX4NA64poViJi5. Prochaine phase : Go Live Readiness._
