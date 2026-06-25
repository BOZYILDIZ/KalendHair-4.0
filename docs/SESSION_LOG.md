# SESSION_LOG — Journal des sessions (KalendHair 4.0)

> Une entrée par intervention. À compléter **après chaque session**.

---

## 2026-06-25 — Session 47 : Phase Pilote Fermé — Clôture officielle

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : Pilote Fermé — clôture officielle.
- **Actions** :
  - PR #49 (`pilot/closed-pilot-preparation`) mergée dans `main` (merge commit `0e3cd2a`).
  - Branche `pilot/closed-pilot-preparation` supprimée (locale + distante).
  - Déploiement production `dpl_EV43Eg9Tk65b2SQgrpXpursjxrqH` — statut READY.
  - Build : `prisma generate && next build` ✅ — 68 routes, TypeScript OK, warnings pré-existants inchangés.
- **Tests runtime** :
  - `https://kalendhair.fr` → 200 ✓
  - `https://pro.kalendhair.fr/login` → 200 ✓
  - `https://admin.kalendhair.fr/admin/login` → 200 ✓
  - `https://pro.kalendhair.fr/dashboard` → 307 → `/login` ✓
  - `https://admin.kalendhair.fr/admin` → 307 → `/admin/login` ✓
- **Logs** : 0 erreur, 0 warning nouveau — hits propres sur toutes les routes testées.
- **État de sortie** : `main` HEAD = `0e3cd2a`. `kalendhair-4-0` est le projet de production actif. KalendHair 4.0 est officiellement prêt à accueillir les premiers salons pilotes.

---

## 2026-06-25 — Session 46 : Phase Pilote Fermé — Préparation

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : Pilote Fermé — branche `pilot/closed-pilot-preparation`.
- **Actions** :
  - Création de `docs/PILOT_RUNBOOK.md` — runbook opérationnel complet pour la conduite du pilote fermé (18 sections).
  - `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ — 68 routes, 0 erreur, warnings pré-existants inchangés.
  - PR ouverte (`pilot/closed-pilot-preparation`) — en attente review ChatGPT.
- **Décisions** :
  - `salon-beaute-test` : conserver sans suppression (recommandation documentée dans le runbook — ne pas supprimer sans validation Hasan).
  - RESEND : section documentée dans le runbook (procédure complète SPF/DKIM/DMARC) — ne pas configurer sans validation Hasan.
  - Cron 08:00 UTC : limitation documentée (couverture 08:00–12:00 Paris CEST) — acceptable pour le pilote car RESEND non configuré.
- **État de sortie** : PR créée, branche poussée. En attente validation ChatGPT avant merge.

---

## 2026-06-25 — Session 45 : Bascule domaines → kalendhair-4-0

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : Production — bascule domaines custom.
- **Ordre exécuté** : `pro.kalendhair.fr` → `admin.kalendhair.fr` → `www.kalendhair.fr` → `kalendhair.fr`
- **Méthode** : API Vercel REST — DELETE `/v9/projects/{old}/domains/{domain}` puis POST `/v9/projects/{new}/domains` — atomique par domaine, aucune interruption service.
- **Résultats** :
  - Tous les 4 domaines : `verified=true` sur `kalendhair-4-0`, `0` domaine custom sur `kalend-hair-2-0`.
  - HTTP 200 sur les 4 URLs immédiatement après bascule.
  - Logs runtime : tous les hits sur `dpl_9ErGzhzRYvoRvnvHYAVZHYdrfm7C` (`kalendhair-4-0`).
- **DNS IONOS** : aucune modification — les enregistrements CNAME/A pointent toujours vers Vercel sans changement.
- **Certificats HTTPS** : hérités depuis la configuration précédente, `verified=true` sur chaque domaine.
- **`kalend-hair-2-0`** : projet toujours existant, non supprimé, 0 domaine custom.
- **État de sortie** : `kalendhair-4-0` est désormais le projet de production actif sur les 4 domaines custom.

---

## 2026-06-25 — Session 44 : Correctifs production — PR #43 / #44 / #45

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : Production — correctifs runtime Vercel.
- **PRs mergées** :
  - **PR #43** (`fix/vercel-production-runtime`) — restructuration route group `(admin)/admin/(protected)/` pour sortir `/admin/login` du layout protégé → suppression redirect loop 307.
  - **PR #44** (`fix/prisma-sprint19-schema-drift`) — ajout 22 `@map` manquants sur 6 modèles Sprint 19 (`AdminUser`, `AdminAuditLog`, `BillingDiscount`, `AdminImpersonationLog`, `OrganizationAdminNote`, `Organization`, `OrganizationSubscription`) → résolution erreur P2022 `admin_users.passwordHash`.
  - **PR #45** (`fix/vercel-prisma-generate-build`) — `package.json` build script : `"next build"` → `"prisma generate && next build"` → garantit que le client Prisma est régénéré à chaque build Vercel même avec cache pnpm "Already up to date". Merge SHA : `2cb6778`.
- **Autres actions** :
  - Neon DB `kalendhair-4-prod` provisionnée (Frankfurt, `aws-eu-central-1`) — 13 migrations appliquées, 44 tables, 24 enums.
  - BillingPlan ESSENTIAL/PRO/BUSINESS insérés (idempotent, 0 donnée DEV).
  - AdminUser production créé : `hasan@netzinformatique.fr` / `Hasan Biçer` (bcrypt x12, mot de passe temporaire généré).
  - Déploiement final `dpl_9ErGzhzRYvoRvnvHYAVZHYdrfm7C` — alias `https://kalendhair-4-0.vercel.app`.
- **Résultats** : `/` 200, `/login` 200, `/admin/login` 200 (formulaire), `/admin` 307, `/dashboard` 307. Aucune erreur P2022. Aucun domaine custom déplacé.
- **État de sortie** : PR #45 mergée, branche supprimée, déploiement production actif. En attente test manuel Super Admin par Hasan.

---

## 2026-06-24 — Session 43 : clôture Sprint 20 — docs/sprint20-closure

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 20 (clôture).
- **Actions** :
  - PR **#41** (`feature/sprint20-commissions`) **mergée** dans `main` (merge commit `b44e07f`).
  - Branche `feature/sprint20-commissions` **supprimée** (locale + distante, confirmé via `git fetch --prune`).
  - Tag **`v2.1.0-commissions`** créé et poussé sur `b44e07f`.
  - Branche `docs/sprint20-closure` créée.
  - Mise à jour : `docs/PROJECT_STATE.md`, `docs/CURRENT_SPRINT.md`, `docs/SESSION_LOG.md`, `README.md`.
  - Documenté : CommissionRule, CommissionEntry, CommissionAdjustment, CommissionType, CommissionEntryStatus, algorithme de priorité (spécificité 0–3), commissions prestations, commissions produits, ajustements manuels, intégration paiements, intégration inventaire, intégration KPI, permissions OWNER/MANAGER, exclusion CANCELLED, migration 20260624000009_commissions, score final 45/45 PASS, risques non bloquants R1–R5.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation ChatGPT.

---

## 2026-06-24 — Session 42 : Sprint 20 — Commissions Employés

- **Auteur** : Claude Sonnet 4.6 (architecture complète) + OpenAI Codex (contributeur encadré).
- **Phase** : 20 (implémentation complète).
- **Branche** : `feature/sprint20-commissions`.
- **PR** : #41 — score final **45/45 PASS**.
- **Actions** :
  - `prisma/schema.prisma` modifié — 2 nouveaux enums (`CommissionType`, `CommissionEntryStatus`), 3 nouveaux modèles (`CommissionRule`, `CommissionEntry`, `CommissionAdjustment`), back-relations sur 9 modèles existants (Claude).
  - `prisma/migrations/20260624000009_commissions/migration.sql` — migration additive : 2 `CREATE TYPE`, 3 `CREATE TABLE`, FK Cascade/Restrict/SetNull, zéro DROP/ALTER TABLE (Claude).
  - `src/lib/permissions/commission.permissions.ts` — `canManageCommissionRules`, `canViewCommissions`, `canAdjustCommissions` (Claude).
  - `src/features/commissions/types.ts` — 13 exports TypeScript (Codex).
  - `src/features/commissions/commission.schema.ts` — 4 schémas Zod (Codex).
  - `src/features/commissions/commission-calculator.service.ts` — `ruleSpecificity`, `resolveRule`, `calculateAndRecordCommissions(tx)` (Claude).
  - `src/features/commissions/commission-rule.service.ts` — 5 fonctions CRUD règles (Claude).
  - `src/features/commissions/commission-entry.service.ts` — 6 fonctions lecture + `adjustCommission` (Claude).
  - `src/features/payments/payment.service.ts` modifié — intégration `calculateAndRecordCommissions` dans `$transaction` + `cancelPayment` atomique (Claude).
  - `src/features/inventory/stock.service.ts` modifié — intégration `calculateAndRecordCommissions` produits via `employee.findFirst` (Claude).
  - `src/features/dashboard/types.ts` modifié — `TopCommissionEmployee`, `CommissionKpi`, `DashboardKpi` étendu (Claude).
  - `src/features/dashboard/dashboard.service.ts` modifié — 2 nouvelles fonctions privées + 9 agrégats `Promise.all` (Claude).
  - 7 composants UI (Codex) : `commission-status-badge`, `commission-summary-card`, `commission-entry-table`, `commission-rule-list`, `commission-rule-form`, `commission-adjust-form`, `kpi-commission-card`.
  - 2 fichiers actions Server Actions (Claude) : `commissions/actions.ts`, `commissions/rules/actions.ts`.
  - 5 nouvelles pages (Claude) : `/dashboard/commissions`, `/dashboard/commissions/rules`, `/rules/new`, `/rules/[id]/edit`, `/employees/[id]/commissions`.
  - 3 pages modifiées (Claude) : `/dashboard/payments/[id]`, `/dashboard/kpi`, `/dashboard/page`.
  - Corrections TypeScript/ESLint : `AdjustFormState.success boolean`, 6 entités françaises échappées, `boundAction` typé `RuleFormState`, `entries[0]?.id ?? ""`.
  - `prisma validate` ✅ · `prisma generate` ✅ · `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅.
- **Fichiers créés** : 21. **Fichiers modifiés** : 8.
- **Co-authors** : `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` + `Co-authored-by: Codex <codex@openai.com>`.

---

## 2026-06-24 — Session 41 : clôture Sprint 19 — docs/sprint19-closure

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 19 (clôture).
- **Actions** :
  - PR **#39** (`feature/sprint19-super-admin`) **mergée** dans `main` (merge commit `4b501a2`).
  - Branche `feature/sprint19-super-admin` **supprimée** (locale + distante, confirmé via `git fetch --prune`).
  - Tag **`v2.0.0-super-admin`** créé et poussé sur `4b501a2`.
  - Branche `docs/sprint19-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation ChatGPT.

---

## 2026-06-24 — Session 40 : Sprint 19 correctif T38/T40/T41 — PR #39 finalisée

- **Auteur** : Claude Sonnet 4.6 (architecture + correctif).
- **Phase** : 19 (correctif post-review + finalisation PR).
- **Branche** : `feature/sprint19-super-admin`.
- **Commit correctif** : 7 fichiers modifiés/créés.
- **PR** : #39 — score final **62/62 PASS**.
- **Actions** :
  - `prisma/schema.prisma` modifié — ADD_NOTE, UPDATE_NOTE, DELETE_NOTE ajoutés à l'enum `AdminAction`.
  - `prisma/migrations/20260624000008_admin_note_audit/migration.sql` créé — `ALTER TYPE "admin_action" ADD VALUE IF NOT EXISTS` (3 valeurs). Additive.
  - `src/features/admin/admin.service.ts` modifié — `addOrganizationNote` mis en transaction+audit, `updateOrganizationNote` implémenté (cross-org guard + `$transaction` + `logAdminAction` UPDATE_NOTE), `deleteOrganizationNote` implémenté (cross-org guard + `$transaction` + `logAdminAction` DELETE_NOTE, raison min 10 chars).
  - `src/features/admin/admin.schema.ts` modifié — `UpdateNoteSchema` + `DeleteNoteSchema` ajoutés.
  - `src/app/(admin)/admin/organizations/[id]/actions.ts` modifié — `updateNoteAction` + `deleteNoteAction` ajoutés, imports mis à jour.
  - `src/features/admin/components/note-item.tsx` créé — Client Component (useState mode view/edit/delete + useActionState edit + useActionState delete).
  - `src/app/(admin)/admin/organizations/[id]/page.tsx` modifié — intègre `NoteItem` + `updateNoteAction` + `deleteNoteAction`.
- **Corrections** : T38 WARN→PASS (`addOrganizationNote` transactionnel+audité), T40 FAIL→PASS (`updateOrganizationNote` implémenté), T41 FAIL→PASS (`deleteOrganizationNote` implémenté).
- **Vérifications** : `prisma validate` ✅ · `prisma generate` ✅ · `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅.
- **État de sortie** : commit + push + PR #39 prête. **Aucun merge.** Score 62/62 PASS.

---

## 2026-06-24 — Session 39 : clôture Sprint 18 — docs/sprint18-closure

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 18 (clôture).
- **Actions** :
  - PR **#37** (`feature/sprint18-billing-core`) **mergée** dans `main` (merge commit `1688938`).
  - Branche `feature/sprint18-billing-core` **supprimée** (distante via `gh pr merge --delete-branch`, ref locale via `git fetch --prune`).
  - Tag **`v1.9.0-billing-core`** créé et poussé sur `1688938`.
  - Branche `docs/sprint18-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte (#38). **Aucun merge.** En attente de validation.

---

## 2026-06-24 — Session 38 : Sprint 18 — Abonnements SaaS & Facturation (Core sans Stripe)

- **Auteur** : Claude Sonnet 4.6 (architecture complète) + OpenAI Codex (contributeur encadré).
- **Phase** : 18 (implémentation complète).
- **Branche** : `feature/sprint18-billing-core`.
- **Commit** : `f86746b` — 20 fichiers créés/modifiés, 981 insertions.
- **PR** : #37 ouverte — en attente review ChatGPT.
- **Actions** :
  - `prisma/schema.prisma` modifié — 3 nouveaux enums (`SubscriptionPlanCode`, `BillingCycle`, `OrgSubscriptionStatus`) + 2 nouveaux modèles (`BillingPlan`, `OrganizationSubscription`) + back-relation sur `Organization`.
  - `prisma/migrations/20260624000006_billing_core/migration.sql` — migration additive : 3 `CREATE TYPE`, 2 `CREATE TABLE`, FK Cascade/Restrict. Zéro DROP/ALTER TABLE existant.
  - `prisma/seed.ts` modifié — upsert 3 billing plans (ESSENTIAL 29€/290€, PRO 59€/590€, BUSINESS 99€/990€).
  - `src/features/billing/types.ts` — 8 types TS (Codex).
  - `src/features/billing/billing.schema.ts` — 2 schémas Zod : UpgradePlanSchema, ChangeBillingCycleSchema (Codex).
  - `src/features/billing/components/billing-status-badge.tsx` — badge TRIAL/ACTIVE/PAST_DUE/CANCELED (Codex).
  - `src/features/billing/components/plan-card.tsx` — carte plan avec features, prix, économies annuelles (Codex).
  - `src/features/billing/components/billing-quota-card.tsx` — quotas salons/employés avec barres de progression (Codex).
  - `src/features/billing/components/billing-current-plan.tsx` — Client Component : plan actuel + changement cycle + upgrade (Codex).
  - `src/features/billing/billing.service.ts` — 8 fonctions : getCurrentSubscription, getSubscriptionPlan, getActivePlans, canCreateSalon, canCreateEmployee, getRemainingQuota, isFeatureEnabled, getBillingDashboard, upsertSubscription (simulation ACTIVE) (Claude).
  - `src/lib/permissions/billing.permissions.ts` — 4 helpers : canUseInventory, canUsePayments, canUseSuppliers, canUseDashboard (Claude).
  - `src/app/(dashboard)/dashboard/billing/actions.ts` — upgradePlanAction, changeBillingCycleAction (Claude).
  - `src/app/(dashboard)/dashboard/billing/page.tsx` — dashboard abonnement : plan + statut + période + quotas (Claude).
  - `src/app/(dashboard)/dashboard/plans/page.tsx` — catalogue plans avec marquage plan actuel (Claude).
  - `src/app/(dashboard)/dashboard/page.tsx` modifié — 2 nouveaux liens : Mon abonnement + Plans (Claude).
  - 5 pages modifiées — guards billing : kpi (`canUseDashboard`), inventory (`canUseInventory`), payments (`canUsePayments`), suppliers (`canUseSuppliers`), purchase-orders (`canUseSuppliers`) → redirect `/dashboard/billing` si plan insuffisant (Claude).
- **Vérifications** : `prisma validate` ✅ · `prisma generate` ✅ · `tsc --noEmit` ✅ (0 erreur Sprint 18) · `eslint` ✅ · `build` ✅ (53 routes, `/dashboard/billing` + `/dashboard/plans` dans le manifeste).
- **Écarts documentés** : BillingPlan ≠ SubscriptionPlan (conflict nom Sprint 2), OrgSubscriptionStatus ≠ SubscriptionStatus (valeurs différentes Sprint 2).
- **État de sortie** : commit `f86746b` + push + PR #37 ouverte. **Aucun merge.** En attente review ChatGPT.

---

## 2026-06-24 — Session 37 : clôture Sprint 17 — docs/sprint17-closure + PR #36

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 17 (clôture).
- **Actions** :
  - 3 corrections post-review ChatGPT appliquées (CR-01/CR-02/CR-03) sur `feature/sprint17-suppliers-purchase-orders` — commit `93d05e5`.
  - PR **#35** (`feature/sprint17-suppliers-purchase-orders`) **mergée** dans `main` (merge commit `cfda0aa`).
  - Branche `feature/sprint17-suppliers-purchase-orders` **supprimée** (locale + distante via `gh pr merge --delete-branch`).
  - Tag **`v1.8.0-suppliers-purchase-orders`** créé et poussé sur `cfda0aa`.
  - Branche `docs/sprint17-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte (#36). **Aucun merge.** En attente de validation.

---

## 2026-06-24 — Session 36 : Sprint 17 — Fournisseurs & Bons de Commande

- **Auteur** : Claude Sonnet 4.6 (architecture complète) + OpenAI Codex (contributeur encadré).
- **Phase** : 17 (implémentation + corrections post-review).
- **Branche** : `feature/sprint17-suppliers-purchase-orders`.
- **Actions** :
  - `prisma/schema.prisma` modifié — 7 modifications : enum `PurchaseOrderStatus`, valeur `PURCHASE_RECEIPT` dans `StockMovementType`, 5 nouveaux modèles (Supplier, PurchaseOrder, PurchaseOrderLine, PurchaseOrderReceipt, PurchaseOrderReceiptLine), back-relations sur ProUser/Salon/Product/StockMovement.
  - `prisma/migrations/20260624000005_suppliers_purchase_orders/migration.sql` — migration additive complète : `ADD VALUE IF NOT EXISTS`, `CREATE TYPE`, 5 `CREATE TABLE`, FK Restrict/Cascade, zéro ALTER TABLE existant.
  - `src/lib/permissions/supplier.permissions.ts` — `canManageSuppliers()`.
  - `src/lib/permissions/purchase-order.permissions.ts` — `canManagePurchaseOrders()` (OWNER + MANAGER).
  - `src/features/suppliers/types.ts`, `supplier.schema.ts` (Codex) — 4 types + 2 schémas Zod.
  - `src/features/suppliers/supplier.service.ts` — 6 fonctions CRUD fournisseurs.
  - `src/features/purchase-orders/types.ts`, `purchase-order.schema.ts` (Codex) — 8 types + 3 schémas Zod.
  - `src/features/purchase-orders/purchase-order.service.ts` — 7 fonctions CRUD bons de commande.
  - `src/features/purchase-orders/receipt.service.ts` — `receiveStock` transaction atomique complète.
  - `src/features/inventory/stock.service.ts` modifié — export + PURCHASE_RECEIPT + `{ id: string }`.
  - `src/features/inventory/product.service.ts` modifié — `getProductSummaries`.
  - `src/features/inventory/components/stock-history-table.tsx` modifié — label PURCHASE_RECEIPT.
  - `eslint.config.mjs` modifié — `argsIgnorePattern: "^_"`.
  - `src/app/(dashboard)/dashboard/page.tsx` modifié — liens Fournisseurs + Commandes.
  - 10 composants UI (Codex) : 3 suppliers + 7 purchase-orders.
  - 15 routes + actions (Claude) : 4 suppliers + 11 purchase-orders (new, [id], lines, receive).
  - Rapport statique exhaustif T01–T23 + 6 sections transversales : 21/23 PASS + T05 FAIL + T22 PARTIAL.
  - **CR-01** : `deactivateSupplier` — garde commandes DRAFT/SENT (T05 → PASS).
  - **CR-02** : `verifiedProductId = line.productId` dans `receiveStock` (isolation multi-tenant renforcée).
  - **CR-03** : filtre statut dans page liste (T22 → PASS).
  - `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (51 routes) · 23/23 tests PASS · 0 régression.
  - Commit `48e4e07` (implémentation initiale) + commit `93d05e5` (corrections CR-01/CR-02/CR-03) + push + PR #35 créée.
- **Fichiers créés** : 38. **Fichiers modifiés** : 6.
- **Co-authors** : `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` + `Co-authored-by: Codex <codex@openai.com>`.

---

## 2026-06-24 — Session 35 : clôture Sprint 16 — docs/sprint16-closure + PR #34

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 16 (clôture).
- **Actions** :
  - Review finale ChatGPT reçue pour PR #33 (6 corrections appliquées, 0 FAIL résiduel).
  - PR **#33** (`feature/sprint16-inventory`) **mergée** dans `main` (merge commit `600882e`).
  - Branche `feature/sprint16-inventory` **supprimée** (locale + distante via `gh pr merge --delete-branch`).
  - Tag **`v1.7.0-inventory`** créé et poussé sur `600882e`.
  - Branche `docs/sprint16-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte (#34). **Aucun merge.** En attente de validation.

---

## 2026-06-24 — Session 34 : Sprint 16 — Gestion des Stocks & Produits

- **Auteur** : Claude Sonnet 4.6 (architecture complète).
- **Phase** : 16 (implémentation + corrections post-review).
- **Branche** : `feature/sprint16-inventory`.
- **Actions** :
  - `prisma/schema.prisma` modifié — enum `StockMovementType` (ENTRY, SALE, USAGE, ADJUSTMENT), 4 nouveaux modèles (ProductCategory, Product, ProductStock, StockMovement), back-relations sur Salon et ProUser.
  - `prisma/migrations/20260624000004_inventory_stock/migration.sql` — migration additive complète : 4 tables, 1 enum, 6 index, FK Restrict/SetNull/Cascade. Zéro ALTER TABLE.
  - `src/lib/permissions/inventory.permissions.ts` — canManageInventory (OWNER), canAdjustStock (OWNER + MANAGER).
  - `src/features/inventory/types.ts` — 8 types export.
  - `src/features/inventory/product.schema.ts` — 6 schémas Zod.
  - `src/features/inventory/product.service.ts` — 7 fonctions CRUD produits + catégories.
  - `src/features/inventory/stock.service.ts` — architecture transactionnelle : assertSufficientStock + applyStockMovement (internes), 7 fonctions publiques.
  - 10 composants UI : StockBadge, LowStockAlert, InventoryStatsCard, ProductList, ProductForm, StockMovementForm, SellProductForm, StockHistoryTable, DeactivateProductButton, CategoryForm.
  - 10 routes + actions dashboard inventory (hub, products, entry, sell, movements, categories).
  - `src/app/(dashboard)/dashboard/page.tsx` modifié — 13ème lien "Stocks & Produits".
  - Rapport statique exhaustif T01–T21 + 8 checks transversaux : 14 PASS / 1 PARTIAL / 6 FAIL.
  - 6 corrections post-review ChatGPT : T04 (DeactivateProductButton), T05 (garde stock > 0), T06 (flux catégories complet), T07 (P2002 → message utilisateur), T11 (notes obligatoires ADJUSTMENT), T14 (suppression CHECK).
  - `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (42 routes) · 0 régression Sprint 14/15.
  - Commit `1dab693` (corrections) + push + PR #33 créée.
- **Fichiers créés** : 31. **Fichiers modifiés** : 2 (`prisma/schema.prisma`, `dashboard/page.tsx`).
- **Co-authors** : `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`.

---

## 2026-06-24 — Session 33 : clôture Sprint 15 — docs/sprint15-closure + PR #32

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 15 (clôture).
- **Actions** :
  - Review finale ChatGPT reçue pour PR #31 (54/54 vérifications PASS, 0 FAIL, 0 correction demandée).
  - PR **#31** (`feature/sprint15-reminders-receipts`) **mergée** dans `main` (merge commit `bc96874`).
  - Branche `feature/sprint15-reminders-receipts` **supprimée** (locale + distante).
  - Tag **`v1.6.0-reminders-receipts`** créé et poussé sur `bc96874`.
  - Branche `docs/sprint15-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte (#32). **Aucun merge.** En attente de validation.

---

## 2026-06-24 — Session 32 : Sprint 15 — Professionnalisation (Rappels email + Numérotation reçus)

- **Auteur** : Claude Code + OpenAI Codex (contributeur encadré).
- **Phase** : 15 (implémentation).
- **Branche** : `feature/sprint15-reminders-receipts`.
- **Actions** :
  - `prisma/schema.prisma` modifié — modèle `SalonReceiptCounter` + back-relation `Salon.receiptCounters` (Claude).
  - `prisma/migrations/20260624000003_receipt_counter/migration.sql` — migration additive SQL (Claude).
  - `src/features/payments/receipt.service.ts` — upsert atomique compteur séquentiel DGFIP (Claude).
  - `src/features/payments/payment.service.ts` modifié — `receiptNumber` dans les deux `$transaction`, `year = paidAt.getUTCFullYear()` (Claude).
  - `src/features/notifications/notification.service.ts` modifié — dispatch exhaustif + throw final (Claude).
  - `src/features/notifications/reminder.service.ts` — fenêtre 22–26h, déduplication Notification.none (Claude).
  - `vercel.json` — CRON `"0 * * * *"` → `/api/cron/reminders` (Claude).
  - `src/app/api/cron/reminders/route.ts` — route GET sécurisée CRON_SECRET (Claude).
  - `.env.example` modifié — section CRON_SECRET (Claude).
  - `src/features/notifications/templates/appointment-reminder.template.ts` — email HTML ambre complet (Codex).
  - `src/features/payments/components/receipt-print-button.tsx` — Client Component print:hidden (Codex).
  - `src/app/(dashboard)/dashboard/payments/[id]/receipt/page.tsx` — reçu imprimable + bandeau ANNULÉ (Claude).
  - `src/app/(dashboard)/dashboard/payments/[id]/page.tsx` modifié — lien "Imprimer le reçu →" (Claude).
  - `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (32 routes).
  - Rapport 54/54 vérifications PASS produit (analyse statique exhaustive).
  - Commit `dea0f06` + push + PR #31 créée.
- **Fichiers créés** : 8. **Fichiers modifiés** : 5.
- **Co-authors** : `Co-authored-by: Codex <codex@openai.com>` + `Co-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>`.

---

## 2026-06-24 — Session 31 : clôture Sprint 14 — docs/sprint14-closure + PR #30

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 14 (clôture).
- **Actions** :
  - Validation ChatGPT reçue pour PR #29 (20/20 tests manuels OK, 4 ajustements confirmés).
  - PR **#29** (`feature/sprint14-payments-pos`) **mergée** dans `main` (merge commit `4b7bdfa`).
  - Branche `feature/sprint14-payments-pos` **supprimée** (distante via `--delete-branch` de `gh pr merge`, locale absente car déjà sur `main`).
  - Tag **`v1.5.0-payments-pos`** créé et poussé sur `4b7bdfa`.
  - Branche `docs/sprint14-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte (#30). **Aucun merge.** En attente de validation.

---

## 2026-06-24 — Session 30 : Sprint 14 — Module Caisse POS (Payments)

- **Auteur** : Claude Code + OpenAI Codex (contributeur encadré).
- **Phase** : 14 (implémentation).
- **Branche** : `feature/sprint14-payments-pos`.
- **Actions** :
  - `prisma/schema.prisma` modifié — enums PaymentMethod + PaymentStatus, modèles Payment + PaymentLine, back-relations sur Salon/ProUser/Appointment/Client/Service, 6 index (Claude).
  - `prisma/migrations/20260624000002_payments/migration.sql` — migration additive SQL complète (Claude).
  - `prisma generate` — client Prisma régénéré (Payment + PaymentLine).
  - `src/features/payments/types.ts` — 14 exports TypeScript (Codex).
  - `src/features/payments/payment.schema.ts` — 4 schémas Zod, totalCents absent, OTHER absent du formulaire (Codex).
  - `src/lib/permissions/payment.permissions.ts` — canManagePayment (Claude).
  - `src/features/payments/payment.service.ts` — 9 fonctions, $transaction, PAYABLE_STATUSES, computePaymentState 4 états, Promise.all 3 requêtes (Claude).
  - 6 composants UI (Codex) : payment-method-badge, payment-status-badge (AppointmentPaymentStateBadge + PaymentTransactionBadge), payment-summary-card, payment-history-table, payment-form (AppointmentPaymentForm + FreePaymentForm), cancel-payment-panel.
  - 4 pages + 4 actions (Claude) : /dashboard/payments, /dashboard/payments/new, /dashboard/payments/[id], /dashboard/appointments/[id]/pay.
  - `/dashboard/page.tsx` modifié — 12ème lien "Caisse" (Claude).
  - Correction ESLint : `Date.now()` → `new Date().getTime()` dans payments/page.tsx.
  - Correction TypeScript : spread `Record<string, never>` pour clause where aggregate.
  - 4 ajustements ChatGPT intégrés : totalCents côté service, overpaid complet, Zod min(1), filtre OTHER.
  - `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (30 routes).
  - Rapport 20/20 tests manuels produit (analyse statique exhaustive).
  - Commit `6ae00da` + push + PR #29 créée.
- **Fichiers créés** : 19. **Fichiers modifiés** : 1 (`dashboard/page.tsx`).
- **Co-authors** : `Co-authored-by: OpenAI Codex <noreply@openai.com>` + `Co-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>`.

---

## 2026-06-23 — Session 29 : clôture Sprint 13 — docs/sprint13-closure + PR #28

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 13 (clôture).
- **Actions** :
  - Validation ChatGPT reçue pour PR #27 (20/20 tests manuels OK).
  - PR **#27** (`feature/sprint13-dashboard-kpi`) **mergée** dans `main` (merge commit `91669cf`).
  - Branche `feature/sprint13-dashboard-kpi` **supprimée** (locale + distante via `--delete-branch`).
  - Tag **`v1.4.0-dashboard-kpi`** créé et poussé sur `91669cf`.
  - Branche `docs/sprint13-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation.

---

## 2026-06-23 — Session 28 : Sprint 13 — Dashboard & KPI

- **Auteur** : Claude Code + OpenAI Codex (contributeur encadré).
- **Phase** : 13 (implémentation).
- **Branche** : `feature/sprint13-dashboard-kpi`.
- **Actions** :
  - `src/features/dashboard/types.ts` — 7 types exports (Codex).
  - `src/features/dashboard/dashboard.service.ts` — getDashboardKpi() + 7 agrégats, helpers timezone (Claude).
  - 8 composants UI (Codex) : kpi-card, kpi-period-selector (seul "use client"), kpi-revenue-card, kpi-appointments-card, kpi-clients-card, kpi-fill-rate-card, kpi-top-services-card, kpi-top-employees-card.
  - `src/app/(dashboard)/dashboard/kpi/page.tsx` — Server Component, searchParams async, isValidPeriod() (Claude).
  - `src/app/(dashboard)/dashboard/page.tsx` modifié — 11ème lien "KPI & Tableau de bord" (Claude).
  - 4 ajustements ChatGPT intégrés : CA = COMPLETED, récurrents 12 mois ≥2, fill rate plafonné 100 %, top employés RDV+CA+%CA.
  - Correction `.next/types/` stale (artefacts " 2" dupliqués) : `rm -rf .next` → typecheck propre.
  - `typecheck` ✅ · `lint` ✅ · `build` ✅ (26 routes) · 20/20 tests manuels ✅.
  - PR #27 créée (en attente validation).
- **Fichiers créés** : 11. **Fichiers modifiés** : 1 (`dashboard/page.tsx`).
- **Co-authors** : `Co-authored-by: OpenAI Codex <noreply@openai.com>` + `Co-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>`.

---

## 2026-06-23 — Session 27 : clôture Sprint 12 — docs/sprint12-closure + PR #26

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 12 (clôture).
- **Actions** :
  - Branche `docs/sprint12-closure` créée.
  - Mise à jour `docs/PROJECT_STATE.md` : phase Sprint 12 ajoutée, section notifications email (10 points), stack `resend@6.14.0`, vérifications Sprint 12, Git/Release section (PR #25 + tag v1.3.0), Prochaine étape → Sprint 13, _Dernière mise à jour_.
  - Mise à jour `docs/CURRENT_SPRINT.md` : objectifs Sprint 12 (14 ✅), décisions techniques, condition de sortie.
  - Mise à jour `docs/SESSION_LOG.md` : sessions 26 et 27.
  - Mise à jour `README.md` : état actuel → Sprint 12, ligne Sprint 12 dans tableau.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation.

---

## 2026-06-23 — Session 26 : Sprint 12 — Notifications Email

- **Auteur** : Claude Code + OpenAI Codex (contributeur encadré).
- **Phase** : 12 (implémentation).
- **Branche** : `feature/sprint12-email-notifications`.
- **Actions** :
  - Installation `resend@6.14.0` via `pnpm` (résolution via corepack pnpm@11.9.0 — `npm install` avait échoué sur lockfile pnpm).
  - `src/lib/email/email.types.ts` — EmailPayload + SendEmailResult (Codex).
  - `src/lib/email/resend.client.ts` — singleton Resend, null si RESEND_API_KEY absent (Claude).
  - `src/lib/email/send-email.ts` — wrapper sendEmail(), from configurable, replyTo optionnel (Claude).
  - `src/features/notifications/types.ts` — NotificationContext (13 champs) (Codex).
  - `src/features/notifications/notification.service.ts` — sendAppointmentNotification(), buildNotificationContext(), logNotification(), isNotificationEnabled() (Claude).
  - 3 templates email (Codex) : confirmation (indigo #4F46E5), annulation (rouge #dc2626), reminder (squelette Sprint 13).
  - `appointment.service.ts` modifié : fire-and-forget CONFIRMATION dans createAppointment() + CANCELLED dans cancelAppointment() (Claude).
  - `.env.example` modifié : RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_FROM_NAME.
  - Aucune migration Prisma (tables présentes depuis Sprint 2 / migration init).
  - `typecheck` ✅ · `lint` ✅ · `build` ✅ (25 routes) · 20/20 tests manuels ✅.
  - PR #25 créée, validée par ChatGPT, mergée dans `main` (squash commit `b92611a`).
  - Branche `feature/sprint12-email-notifications` supprimée (locale + distante).
  - Tag annoté `v1.3.0-email-notifications` créé et poussé.
- **Fichiers créés** : 8. **Fichiers modifiés** : 3 (`appointment.service.ts`, `.env.example`, 1 doc).
- **Co-authors** : `Co-authored-by: OpenAI Codex <noreply@openai.com>` + `Co-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>`.

---

## 2026-06-23 — Session 25 : clôture Sprint 11 — merge PR #21 + tag v1.2.0-public-booking

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 11 (clôture).
- **Actions** :
  - Validation ChatGPT reçue pour PR #21 (23/23 tests manuels OK).
  - PR **#21** (`feature/sprint11-public-booking`) **mergée** dans `main` (squash commit `2146c45`).
  - Branche `feature/sprint11-public-booking` **supprimée** (distante + locale).
  - Tag annoté **`v1.2.0-public-booking`** créé et poussé.
  - Branche `docs/sprint11-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation.

---

## 2026-06-23 — Session 24 : Sprint 11 — Réservation Publique

- **Auteur** : Claude Code + OpenAI Codex (contributeur encadré).
- **Phase** : 11 (implémentation).
- **Branche** : `feature/sprint11-public-booking`.
- **Actions** :
  - `src/features/booking/types.ts` — 6 types + constante `BOOKING_LEAD_MINUTES = 30` (Codex).
  - `src/features/booking/booking.schema.ts` — PublicBookingSchema Zod v4, 8 champs (Codex).
  - `src/features/booking/booking.service.ts` — 4 fonctions : getPublicSalon, getPublicServices, getPublicEmployeesForService, getPublicSlots (filtrage dates/créneaux passés timezone-aware), createPublicAppointment (Claude).
  - `src/app/(public)/book/[slug]/page.tsx` — wizard URL 4 étapes, Server Component (Claude).
  - `src/app/(public)/book/[slug]/confirm/page.tsx` — récapitulatif + BookingForm, `.bind()` server-side (Claude).
  - `src/app/(public)/book/[slug]/confirm/actions.ts` — bookAppointmentAction (Zod + createPublicAppointment + redirect) (Claude).
  - `src/app/(public)/book/[slug]/success/page.tsx` — page confirmation (Claude).
  - 6 composants UI (Codex, corrigés export default→named par Claude) : booking-salon-header, booking-service-list, booking-employee-list, booking-date-picker (Client), booking-slot-picker, booking-form (Client).
  - `proxy.ts`, `slots.service.ts`, `availability.service.ts`, `appointment.service.ts` non modifiés.
  - Aucune migration Prisma.
  - `typecheck` ✅ · `lint` ✅ · `build` ✅ (25 routes) · 23/23 tests manuels ✅.
  - PR #21 créée, PR #22 (CODEX.md), PR #23 (règle Co-authored-by) créées et mergées.
- **Fichiers créés** : 13. **Fichiers modifiés** : 0.

---

## 2026-06-23 — Session 23 : clôture Sprint 10 — merge PR #19 + tag v1.1.0-crm-clients

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 10 (clôture).
- **Actions** :
  - Validation ChatGPT reçue pour PR #19 (22/22 tests manuels OK).
  - PR **#19** (`feature/sprint10-crm-clients`) **mergée** dans `main` (merge commit `361155b`).
  - Branche `feature/sprint10-crm-clients` **supprimée** (distante).
  - Tag annoté **`v1.1.0-crm-clients`** créé et poussé.
  - Branche `docs/sprint10-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **Note environnement** : migration `20260624000001_crm_snapshot_and_indexes` non appliquée (Docker + `.env` absents). SQL prêt dans `prisma/migrations/` — à appliquer via `pnpm db:migrate`.
- **État de sortie** : commit + push + PR documentaire ouverte (PR #20). **Aucun merge.** En attente de validation.

---

## 2026-06-23 — Session 22 : Sprint 10 — CRM Clients

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 10 (implémentation).
- **Branche** : `feature/sprint10-crm-clients`.
- **Actions** :
  - Migration `20260624000001_crm_snapshot_and_indexes` écrite (SQL manuel — Docker non disponible) : `priceCentsSnapshot INT?` sur `appointments`, index `clients(phone)`, index `salon_clients(salonId, createdAt)`.
  - `src/lib/permissions/client.permissions.ts` — `canManageClient()` via `canAccessTenant`.
  - `src/features/clients/types.ts` — 8 types : ClientListItem, ClientView, ClientStats, ClientAppointmentRow, ClientsPage, ClientAppointmentsPage, ClientNotesFormState, ConvertGuestFormState.
  - `src/features/clients/client.schema.ts` — UpdateNotesSchema (Zod v4, max 500 car).
  - `src/features/clients/client.service.ts` — 6 fonctions : getClients (pagination safePage, recherche insensible), getClient (isolation SalonClient), getClientStats (5 `Promise.all`, `priceCentsSnapshot ?? service.priceCents`), getClientAppointments (pagination safePage), updateClientNotes (vérif SalonClient), convertGuestToClient ($transaction, guest* préservés).
  - 5 composants : client-search (Client, debounce 300ms), client-list, client-stats-card, client-appointment-history, client-notes-form (Client, `useActionState`).
  - Routes : `/dashboard/clients` (liste + recherche + pagination), `/dashboard/clients/[id]` (fiche + stats + historique + notes).
  - Server Actions : `updateNotesAction` (Zod `.issues[0]?.message`), `convertGuestAndRedirectAction`.
  - `appointment.service.ts` modifié : `priceCentsSnapshot` capturé à la création + `service.priceCents` inclus dans le select.
  - `appointment-detail.tsx` modifié : bouton "Lier ce client au CRM →" pour RDV invité sans `clientId`.
  - `/dashboard/appointments/[id]/page.tsx` modifié : `convertGuestAndRedirectAction` passé en prop.
  - `/dashboard/page.tsx` modifié : 10ème lien "Clients".
  - Correction artefacts contexte compacté : 6 fichiers dupliqués (`* 2.tsx/ts`) supprimés.
  - `typecheck` ✅ · `lint` ✅ · `build` ✅ (22 routes) · 22/22 tests manuels ✅ (analyse statique).
  - Commit + push + PR #19 créée (en attente validation).
- **Fichiers créés** : 13 nouveaux fichiers. **Fichiers modifiés** : 5.

---

## 2026-06-23 — Session 21 : clôture Sprint 9 — merge PR #17 + tag v1.0.0-agenda

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 9 (clôture).
- **Actions** :
  - Correction bug test 7 : prop `showEmployee` ajoutée à `AgendaAppointmentBlock` ; vue semaine passe `showEmployee={true}` → affiche `employeeFirstName` au lieu de `clientName`.
  - `typecheck` ✅ · `lint` ✅ · `build` ✅ (20 routes, Turbopack) · 20/20 tests manuels ✅.
  - Commit fix : `e331c46` · Push `feature/sprint9-agenda`.
  - Validation ChatGPT reçue pour PR #17.
  - PR **#17** (`feature/sprint9-agenda`) **mergée** dans `main` (merge commit `36156b1`).
  - Branche `feature/sprint9-agenda` **supprimée** (locale + distante).
  - Tag annoté **`v1.0.0-agenda`** créé et poussé.
  - Branche `docs/sprint9-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : correction mineure uniquement (prop `showEmployee`). Clôture documentaire.
- **Note environnement** : `pnpm db:seed` non exécutable sur ce poste (`.env` absent, Docker non démarré). Prérequis documenté — pas un échec fonctionnel.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation.

---

## 2026-06-23 — Session 20 : Sprint 9 — Agenda visuel Jour & Semaine

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 9 (implémentation).
- **Branche** : `feature/sprint9-agenda`.
- **Actions** :
  - Installation `date-fns@4.4.0` (requis par `date-fns-tz@3.2.0`).
  - Implémentation complète Sprint 9 : types, service agenda (5 requêtes parallèles), 8 composants UI, 1 route + hub mis à jour.
  - `computeGridConfig` — enveloppe max (aucun employé tronqué).
  - Overlap detection — greedy interval grouping pour blocs actifs, pleine largeur pour inactifs.
  - `AgendaNowIndicator` — Client Component, `Intl.DateTimeFormat` + `setInterval(60_000)`.
  - `AgendaNav` — Server Component pur (`<Link>`, zéro `useSearchParams`).
  - `AgendaEmployeeFilter` — Client Component, `useRouter` (pas `useSearchParams`).
  - CANCELLED : `bg-gray-100` + `line-through opacity-70`. NO_SHOW : `bg-red-50` + `italic` + "Absent".
  - `typecheck` ✅ · `lint` ✅ · `build` ✅ (20 routes).
  - Commit + push + PR #17 créée (en attente validation).
- **Fichiers créés** : 15 fichiers (voir PR #17).

---

## 2026-06-23 — Session 19 : clôture Sprint 8 — merge PR #15 + tag v0.9.0-appointments

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 8 (clôture).
- **Actions** :
  - Validation ChatGPT reçue pour PR #15 (24/24 tests manuels OK).
  - PR **#15** (`feature/sprint8-appointments`) **mergée** dans `main` (merge commit `43f37eb`).
  - Branche `feature/sprint8-appointments` **supprimée** (locale + distante via `--delete-branch`).
  - Tag annoté **`v0.9.0-appointments`** créé et poussé.
  - Branche `docs/sprint8-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation.

---

## 2026-06-18 — Session 18 : Sprint 8 — Rendez-vous (Appointments)

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 8 (implémentation).
- **Branche** : `feature/sprint8-appointments`.
- **Actions** :
  - Reset base DEV (migration checksum drift) + ajout migration `appointment_conflict_index`.
  - Installation `date-fns-tz@3.2.0`.
  - Implémentation complète Sprint 8 : permissions, types, schema Zod, services (appointment + slots + modification), composants UI (4), routes (3 pages + 2 actions), hub mis à jour.
  - `isEmployeeAvailable` — Step 8 rempli + `options.startAtUTC` pour timezone correcte.
  - 3 ajustements ChatGPT intégrés : email normalisé, `modifiedById` confirmé, `SLOT_INTERVAL_MINUTES = 15`.
  - `typecheck` ✅ · `lint` ✅ · `build` ✅ · `db:seed` ✅.
  - 24/24 tests manuels ✅.
  - Commit + push + PR #15 créée (en attente validation).
- **Fichiers modifiés** : 22 fichiers créés/modifiés (voir PR #15).

---

## 2026-06-18 — Session 17 : clôture Sprint 7 — merge PR #13 + tag v0.8.0-schedules

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 7 (clôture).
- **Actions** :
  - Tests manuels Sprint 7 (22/22) validés via script tsx direct sur DB.
  - Validation ChatGPT reçue pour PR #13.
  - PR **#13** (`feature/sprint7-schedules`) **mergée** dans `main` (merge commit `ddda498`).
  - Branche `feature/sprint7-schedules` **supprimée** (locale + distante via `--delete-branch`).
  - Tag annoté **`v0.8.0-schedules`** créé et poussé.
  - Branche `docs/sprint7-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation.

---

## 2026-06-18 — Session 16 : Sprint 7 — Horaires & Disponibilités

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 7 / Sprint 7.
- **Branche** : `feature/sprint7-schedules`.
- **Actions** :
  - Plan Sprint 7 validé par ChatGPT (3 ajustements : pas de @@unique, pas de getAvailableSlots, employee.isActive check).
  - Implémentation complète Sprint 7 :
    - `src/lib/utils/time.ts` — minutesToTime / timeToMinutes.
    - `src/lib/permissions/schedule.permissions.ts` — canManageSchedule.
    - `src/features/schedules/types.ts` — types, constantes, defaults.
    - `src/features/schedules/schedule.schema.ts` — Zod schemas.
    - `src/features/schedules/salon-schedule.service.ts` — getSalonSchedule, saveSalonSchedule.
    - `src/features/schedules/employee-schedule.service.ts` — getEmployeeSchedule, saveEmployeeSchedule (cross-validation).
    - `src/features/schedules/closed-day.service.ts` — CRUD jours fermeture.
    - `src/features/schedules/availability.service.ts` — isEmployeeAvailable (isActive + salon + closedDay + horaires).
    - 3 composants Client : SalonScheduleForm, EmployeeScheduleForm, ClosedDayManager.
    - Routes : `/dashboard/salon/schedule`, `/dashboard/employees/[id]/schedule`, `/dashboard/closed-days`.
    - Hub `/dashboard` : +2 liens (Horaires du salon, Jours de fermeture).
    - `/dashboard/employees/[id]` : lien Horaires →.
  - Vérifications : `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm build` ✅ · `pnpm db:seed` ✅.
- **Build** : 15 routes Next.js ✅.
- **État de sortie** : commit + push + PR vers main. **Aucun merge.** En attente de validation ChatGPT + Hasan.

---

## 2026-06-18 — Session 15 : clôture Sprint 6 — merge PR #11 + tag v0.7.0-employees-services

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 6 (clôture).
- **Actions** :
  - Tests logique métier (45/45) validés via script tsx direct sur DB.
  - Validation ChatGPT reçue pour PR #11.
  - PR **#11** (`feature/sprint6-employees-services`) **mergée** dans `main` (merge commit `93c9127`).
  - Branche `feature/sprint6-employees-services` **supprimée** (locale + distante).
  - Tag annoté **`v0.7.0-employees-services`** créé et poussé.
  - Branche `docs/sprint6-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation.

---

## 2026-06-18 — Session 14 : Sprint 6 — Employees & Services

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 6 / Sprint 6.
- **Branche** : `feature/sprint6-employees-services`.
- **Actions** :
  - Plan Sprint 6 finalisé (3 ajustements : `reactivateEmployee/Service`, doublon soft-warning, `photoUrl`).
  - Migration `20260618000002_employee_photo_url` créée et appliquée.
  - Permissions `employee.permissions.ts` + `service.permissions.ts` créées.
  - Feature `employees` : types, schema, services métier, 4 composants Client.
  - Feature `services` : types, schema, service métier, 2 composants Client.
  - 6 nouvelles routes dashboard : `/dashboard/employees` (liste, new, [id]) + `/dashboard/services` (liste, new, [id]).
  - Hub `/dashboard` mis à jour : 4 liens homogènes (Organisation, Salon, Employés, Services).
  - Corrections : Zod v4 (`error` vs `invalid_type_error`), `<Link>` vs `<a>`, types bound actions.
  - `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ · `db:seed` ✅.
  - Documentation mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`, `README.md`.
- **État de sortie** : commit + push + PR vers `main`. **Aucun merge.** En attente de validation.

---

## 2026-06-18 — Session 13 : clôture Sprint 5 — merge PR #9 + tag v0.6.0-org-salon

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 5 (clôture).
- **Actions** :
  - Test manuel complet effectué par Hasan : login ✅ · /dashboard ✅ · /dashboard/organization ✅ · /dashboard/salon ✅ · persistance organisation ✅ · persistance salon ✅ · rechargement ✅.
  - Validation ChatGPT reçue pour PR #9.
  - PR **#9** (`feature/sprint5-org-salon`) **mergée** dans `main` (merge commit `fd15428`).
  - Branche `feature/sprint5-org-salon` **supprimée** (locale + distante, supprimée automatiquement par `gh pr merge --delete-branch`).
  - Tag annoté **`v0.6.0-org-salon`** créé et poussé.
  - Branche `docs/sprint5-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR documentaire ouverte. **Aucun merge.** En attente de validation.

---

## 2026-06-18 — Session 12 : Sprint 5 — Organization & Salon Management

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 5 / Sprint 5.
- **Branche** : `feature/sprint5-org-salon`.
- **Actions** :
  - Plan Sprint 5 conçu (session précédente) + corrections ChatGPT intégrées.
  - Dépendance `zod@4.4.3` installée.
  - Schéma Prisma : ajout `@@unique([organizationId])` sur `Salon` (1 salon/org MVP).
  - Migration `20260618000001_salon_org_unique` créée manuellement et appliquée via `prisma migrate deploy`.
  - Client Prisma régénéré (`prisma generate`).
  - `prisma/seed.ts` mis à jour : création d'un `Salon "Salon Test"` pour l'organisation de test.
  - Permissions créées : `lib/permissions/tenant.ts` (logique centralisée) + `organization.permissions.ts` + `salon.permissions.ts`.
  - Features organizations : `types.ts`, `organization.schema.ts`, `organization.service.ts`, `components/organization-form.tsx`.
  - Features salons : `types.ts`, `salon.schema.ts`, `salon.service.ts`, `components/salon-form.tsx`.
  - Correction structurelle : routes dashboard déplacées dans `(dashboard)/dashboard/` (fix routing Sprint 4 — les routes étaient à `/` et `/organization` au lieu de `/dashboard` et `/dashboard/organization`).
  - Pages : `/dashboard` (hub), `/dashboard/organization`, `/dashboard/salon`.
  - Server Actions : `updateOrganizationAction`, `updateSalonAction`.
  - `README.md` mis à jour : stack, scripts, compte DEV, état actuel, tableau des sprints.
  - Vérifications : `typecheck` ✅ · `lint` ✅ · `build` ✅ · `db:seed` ✅.
  - Build : routes `/dashboard`, `/dashboard/organization`, `/dashboard/salon` confirmées.
- **Code métier** : Organization + Salon (lecture + modification).
- **État de sortie** : commit + push + PR vers `main`. **Aucun merge.** En attente de review ChatGPT.

---

## 2026-06-17 — Session 11 : clôture Sprint 4 — merge PR #7 + tag v0.5.0-auth

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 4 (clôture).
- **Actions** :
  - Rapport de sécurité produit (15 points) sur le code Sprint 4 — aucune anomalie bloquante.
  - Validation ChatGPT reçue pour PR #7.
  - PR **#7** (`feature/sprint4-auth`) **mergée** dans `main` (merge commit `3b25821`).
  - Branche `feature/sprint4-auth` **supprimée** (locale + distante).
  - Vérification : `src/proxy.ts`, `src/features/auth/session.utils.ts`, `src/lib/auth/permissions.ts`, `prisma/seed.ts` présents sur `main`.
  - Tag annoté **`v0.5.0-auth`** créé et poussé.
  - Branche `docs/sprint4-closure` créée.
  - Mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`.
- **Code métier** : aucun. Clôture documentaire uniquement.
- **État de sortie** : commit + push + PR #8 ouverte. **Aucun merge.** En attente de validation.

---

## 2026-06-17 — Session 10 : Sprint 4 — Auth custom jose (ProUser OWNER)

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 4 / Sprint 4.
- **Branche** : `feature/sprint4-auth`.
- **Actions** :
  - Décision ChatGPT : auth custom `jose` (pas de next-auth — incompatibilité Next.js 16).
  - Dépendances installées : `jose@6.2.3`, `bcryptjs@3.0.3`, `tsx@4.22.4`. `esbuild` approuvé dans `pnpm-workspace.yaml`.
  - `JWT_SECRET` généré (Node.js crypto) → `.env` + `.env.example`.
  - 8 fichiers sources créés : `types.ts`, `password.utils.ts`, `session.utils.ts`, `auth.service.ts`, `session.ts`, `permissions.ts` (placeholder), route logout, proxy.
  - Pages : `(auth)/login/` (formulaire `useActionState` + Server Action) · `(dashboard)/` (placeholder protégé).
  - `src/proxy.ts` (convention Next.js 16 — remplace `middleware.ts`). Matcher : `/dashboard/:path*`.
  - `prisma/seed.ts` : Organisation "Salon Test" + ProUser `owner@test.local / Test1234!`.
  - `package.json` : script `db:seed` + `prisma.seed`.
  - Vérifications : `typecheck` ✅ · `lint` ✅ · `build` ✅ · `db:seed` ✅.
  - ProUser OWNER confirmé en base PostgreSQL.
- **Code métier** : aucun. Auth uniquement.
- **État de sortie** : commit + push + PR vers `main`. **Aucun merge.** En attente de review ChatGPT.

---

## 2026-06-17 — Session 9 : Sprint 3 — Migration PostgreSQL + Prisma

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 3 / Sprint 3.
- **Branche** : `feature/sprint3-db-migration`.
- **Actions** :
  - Docker Desktop disponible (v29.5.3 / Compose v5.1.4).
  - Container `kalendhair_postgres` démarré (`postgres:16-alpine`, port 5432, volume persistant).
  - Migration `prisma migrate dev --name init` appliquée → fichier `20260617014217_init/migration.sql`.
  - 21 tables métier + 13 enums créés en base `kalendhair_dev`.
  - `prisma generate` relancé automatiquement → Prisma Client v6.19.3 à jour.
  - Vérifications : `typecheck` ✅ · `lint` ✅ · `build` ✅.
  - Documentation mise à jour : `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`.
- **Code métier** : **aucun**. Pas d'auth, pas de pages, pas de services.
- **État de sortie** : commit + push sur `feature/sprint3-db-migration`, PR vers `main` ouverte via `gh`.
  **Aucun merge.** En attente de review ChatGPT.

---

## 2026-06-16 — Session 1 : création des fondations documentaires

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 0 — Fondation documentaire.
- **Actions** :
  - Création de `CLAUDE.md` (règles permanentes).
  - Création des documents `docs/` :
    `VISION.md`, `MVP.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `DATABASE.md`,
    `DECISIONS.md`, `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `SESSION_LOG.md`,
    `INTEGRATIONS.md`, `WORKFLOW.md`.
- **Code métier modifié** : **aucun**.
- **Initialisation technique** : **aucune** (non demandée).
- **État de sortie** : projet prêt pour **validation documentaire** par Hasan et ChatGPT.
- **Prochaine étape** : validation des documents avant tout code.

---

## 2026-06-16 — Session 2 : ajout de la règle Git officielle

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 0 — Fondation documentaire.
- **Actions** :
  - Ajout de la **règle Git officielle** (procédure de fin de tâche) dans `CLAUDE.md`.
  - Ajout du **workflow officiel** + règle Git dans `docs/WORKFLOW.md`.
  - Mise à jour de `docs/PROJECT_STATE.md`.
- **Code métier modifié** : **aucun**.
- **Git** : travail effectué sur la branche dédiée `docs/phase-0-foundations`, commit + push.
- **État de sortie** : en attente de **validation ChatGPT** avant merge vers `main`.

---

## 2026-06-17 — Session 3 : adoption de GitHub CLI + base `main`

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 0 — Fondation documentaire.
- **Actions** :
  - Validation ChatGPT reçue pour `docs/phase-0-foundations`.
  - Création de la branche `main` sur le remote (commit initial vide `36ab506`),
    rebase de `docs/phase-0-foundations` dessus (contenu identique, base commune).
  - Ajout de la règle **GitHub CLI (`gh`)** dans `CLAUDE.md` et `docs/WORKFLOW.md`
    (créer/consulter les PR via `gh`, jamais de merge auto).
- **Code métier modifié** : **aucun**.
- **Git** : commit + push sur `docs/phase-0-foundations`.
- **PR Phase 0** : en préparation (`gh` installé mais authentification à finaliser par Hasan).
- **État de sortie** : PR à ouvrir, **aucun merge**. Attente review finale.

---

## 2026-06-17 — Session 4 : merge Phase 0, tag, ouverture Sprint 1

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 0 → 1.
- **Actions** :
  - PR **#1** validée par ChatGPT et **mergée** dans `main` (merge commit `f0fe828`).
  - Branche par défaut du repo basculée sur **`main`**.
  - Branche `docs/phase-0-foundations` **supprimée** (locale + distante, validation explicite).
  - Vérification : `main` contient bien les 12 documents Phase 0.
  - Tag **`v0.1.0-foundations`** créé et poussé.
  - Création de la branche **`feature/bootstrap-nextjs`** (Sprint 1).
- **Code métier modifié** : **aucun**. **Aucune installation** lancée.
- **État de sortie** : plan détaillé du **Sprint 1** présenté, **en attente de validation**
  avant toute installation technique.

---

## 2026-06-17 — Session 5 : Sprint 1 — bootstrap technique

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 1 / Sprint 1.
- **Actions** :
  - Scaffold Next.js (stable **16.2.9**) via `create-next-app` (pnpm, TS, Tailwind v4,
    App Router, `src/`, alias `@/*`).
  - TypeScript durci (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`).
  - ESLint 9 + **Prettier** (+ `eslint-config-prettier`, `prettier-plugin-tailwindcss`).
  - **Prisma 6.19.3** + `@prisma/client` ; `schema.prisma` minimal (datasource + generator,
    **aucun modèle métier**) ; client Prisma singleton (`src/lib/db/prisma.ts`).
  - PostgreSQL local via **Docker Compose** ; `.env` / `.env.example`.
  - **Structure modulaire vide** : `src/features/*` (auth, organizations, salons, employees,
    services, appointments, clients, calendar, integrations) et `src/lib/*` (db, auth,
    permissions, validations).
  - `.nvmrc` = **22**, `README.md`, scripts pnpm (typecheck, format, db:*).
- **Ajustements appliqués** : Node 22 (pas 24) ; Next.js non forcé (version stable
  proposée) ; Prisma maintenu en **v6** (pnpm avait installé v7 par défaut → rétrogradé).
- **Note technique** : pnpm 11.5 bloque les build scripts par défaut → approbation via
  `allowBuilds` dans `pnpm-workspace.yaml` (Prisma/sharp/unrs-resolver).
- **Vérifications** : `typecheck` ✅ · `lint` ✅ · `format:check` ✅ · `build` ✅ · `prisma validate` ✅.
- **Code métier** : **aucun**.
- **État de sortie** : commit + push sur `feature/bootstrap-nextjs`, **PR vers `main`**
  ouverte via `gh`, **aucun merge**. En attente de review.

---

## 2026-06-17 — Session 8 : clôture Sprint 2 — merge PR #4 + tag v0.3.0-prisma-schema

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 2 / Sprint 2 (clôture).
- **Actions** :
  - Corrections pré-merge (review ChatGPT, commit `e7c8b67`) :
    Subscription 1:1, Client.email sans @unique, SalonSchedule/EmployeeSchedule sans @@unique,
    NotificationType réduit (3 valeurs), IntegrationProvider aligné KalendHair (5 valeurs),
    SubscriptionPlan réduit (FREE/STARTER/PRO), nettoyage index redondants.
  - Vérifications post-correction : `prisma validate` ✅ · `prisma format` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅.
  - PR **#4** validée par ChatGPT et **mergée** dans `main` (merge commit `3ae299c`).
  - Branche `feature/prisma-schema` **supprimée** (locale + distante).
  - Vérification : `main` = 21 modèles + 13 enums confirmés.
  - Tag annoté **`v0.3.0-prisma-schema`** créé et poussé.
  - Mise à jour : `PROJECT_STATE.md`, `SESSION_LOG.md`, `CURRENT_SPRINT.md`.
- **Code métier** : **aucun**. Pas d'auth, pas de pages, pas de services.
- **État de sortie** : Sprint 2 **TERMINÉ**. `main` propre. En attente de Sprint 3.

---

## 2026-06-17 — Session 7 : Sprint 2 — schéma Prisma complet

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 2 / Sprint 2.
- **Branche** : `feature/prisma-schema`.
- **Actions** :
  - Écriture de `prisma/schema.prisma` : **21 modèles**, **13 enums**, relations, index, `@@map` snake_case.
  - Arbitrages intégrés : cuid(), centimes Int, minutes Int, Client cross-tenant, guest* Appointment,
    1 service/RDV, organizationId dénormalisé, passwordHash nullable, Stripe nullable, isActive,
    onDelete cohérents, startAt/endAt UTC, index startAt.
  - `EmployeeSchedule` inclus (horaires par employé par jour).
  - `prisma validate` ✅ · `prisma format` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅
  - Migration **non lancée** (PostgreSQL local non disponible) — différée au prochain sprint.
  - Mise à jour : `PROJECT_STATE.md`, `SESSION_LOG.md`, `CURRENT_SPRINT.md`.
- **Code métier** : **aucun**. Pas d'auth, pas de pages, pas de services.
- **État de sortie** : commit + push sur `feature/prisma-schema`, PR vers `main` ouverte via `gh`.
  **Aucun merge.** En attente de review ChatGPT.

---

## 2026-06-17 — Session 6 : merge Sprint 1 + tag v0.2.0-bootstrap

- **Auteur** : Claude Code (exécutant technique).
- **Phase** : 1 (clôture du Sprint 1).
- **Actions** :
  - Correction pré-merge : suppression des SVG par défaut inutilisés de `public/`
    (commit `674fcd0`) ; vérifs `typecheck` / `lint` / `build` ✅.
  - PR **#2** validée par ChatGPT et **mergée** dans `main` (merge commit `cf7c936`).
  - Branche `feature/bootstrap-nextjs` **supprimée** (locale + distante).
  - Vérification : `main` contient bien le bootstrap technique.
  - Tag annoté **`v0.2.0-bootstrap`** créé et poussé.
  - Mise à jour de `PROJECT_STATE.md` / `SESSION_LOG.md` sur la branche de suivi
    `docs/post-bootstrap-state` (PR dédiée, **pas de commit direct sur `main`**).
- **Code métier** : **aucun**. **Sprint 2 non démarré.**
- **État de sortie** : `main` à jour (fondations + bootstrap), tags `v0.1.0-foundations`
  et `v0.2.0-bootstrap`. En attente de la suite (Sprint 2) après validation.
