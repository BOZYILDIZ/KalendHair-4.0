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

**Sprint 15 — Professionnalisation (Rappels email + Numérotation reçus) : TERMINÉ et mergé** ✅

**Sprint 16 — Gestion des Stocks & Produits : TERMINÉ et mergé** ✅

**Sprint 17 — Fournisseurs & Bons de Commande : TERMINÉ et mergé** ✅

**Sprint 18 — Abonnements SaaS & Facturation (Core sans Stripe) : TERMINÉ et mergé** ✅

**Sprint 19 — Super Admin SaaS : TERMINÉ et mergé** ✅

**Sprint 20 — Commissions Employés : TERMINÉ et mergé** ✅

## État du code

- **Auth custom tenant** : `jose` (JWT HS256, 24h) + `bcryptjs` + cookie `session` HttpOnly.
- **Auth admin** : `jose` (JWT HS256, 8h) + `bcryptjs` + cookie `admin_session` HttpOnly — secret `admin:${JWT_SECRET}`, totalement séparé du secret tenant.
- **Middleware Next.js 16** (`src/middleware.ts`) : protège `/admin/:path*` (role SUPER_ADMIN) et `/dashboard/:path*` (session tenant valide). Remplace l'ancien `src/proxy.ts` (supprimé).
- **Pages** :
  - `/login` — formulaire ProUser OWNER
  - `/dashboard` — hub (17 liens : Organisation, Salon, Employés, Services, Horaires du salon, Jours de fermeture, Rendez-vous, Agenda, Clients, KPI & Tableau de bord, Caisse, Stocks & Produits, Fournisseurs, Commandes, **Commissions**, Mon abonnement, Plans)
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
  - `/dashboard/payments/[id]` — détail paiement + lignes de prestation + annulation avec confirmation + lien "Imprimer le reçu" si receiptNumber (**Sprint 14 / 15**)
  - `/dashboard/payments/[id]/receipt` — reçu imprimable DGFIP : N° séquentiel, salon, lignes, total, mode, date, bandeau ANNULÉ si annulé (**Sprint 15**)
  - `/dashboard/appointments/[id]/pay` — encaissement lié à un RDV (CONFIRMED/COMPLETED uniquement) (**Sprint 14**)
  - `/dashboard/inventory` — hub stocks & produits : stats KPI, alertes rupture, mouvements récents, liens nav (**Sprint 16**)
  - `/dashboard/inventory/products` — liste paginée produits (actifs + toggle all) (**Sprint 16**)
  - `/dashboard/inventory/products/new` — création produit (**Sprint 16**)
  - `/dashboard/inventory/products/[id]` — détail produit + stock actuel + section désactivation (**Sprint 16**)
  - `/dashboard/inventory/products/[id]/edit` — édition produit (**Sprint 16**)
  - `/dashboard/inventory/entry` — enregistrement entrée stock (requiert `?productId=`) (**Sprint 16**)
  - `/dashboard/inventory/sell` — vente produit avec encaissement → Payment + StockMovement atomiques (**Sprint 16**)
  - `/dashboard/inventory/movements` — historique mouvements filtré (`?productId=`) + pagination (**Sprint 16**)
  - `/dashboard/inventory/categories` — liste catégories actives (**Sprint 16**)
  - `/dashboard/inventory/categories/new` — création catégorie (P2002 → message utilisateur) (**Sprint 16**)
  - `/dashboard/suppliers` — liste fournisseurs paginée + recherche + toggle actifs/inactifs (**Sprint 17**)
  - `/dashboard/suppliers/new` — création fournisseur (**Sprint 17**)
  - `/dashboard/suppliers/[id]` — fiche fournisseur + désactivation (garde commandes DRAFT/SENT) (**Sprint 17**)
  - `/dashboard/suppliers/[id]/edit` — édition fournisseur (**Sprint 17**)
  - `/dashboard/purchase-orders` — liste bons de commande + filtre statut + recherche (**Sprint 17**)
  - `/dashboard/purchase-orders/new` — création bon de commande DRAFT + redirect /lines (**Sprint 17**)
  - `/dashboard/purchase-orders/[id]` — détail avec machine à états + historique réceptions (**Sprint 17**)
  - `/dashboard/purchase-orders/[id]/lines` — gestion lignes (DRAFT uniquement), ajouter/retirer (**Sprint 17**)
  - `/dashboard/purchase-orders/[id]/receive` — réception partielle ou complète (SENT/PARTIALLY_RECEIVED) (**Sprint 17**)
  - `/dashboard/commissions` — vue d'ensemble commissions par employé (OWNER + MANAGER), filtres date from/to (**Sprint 20**)
  - `/dashboard/commissions/rules` — liste règles actives/inactives (OWNER uniquement) (**Sprint 20**)
  - `/dashboard/commissions/rules/new` — création règle PERCENTAGE ou FIXED_AMOUNT avec cible employé/service/produit (**Sprint 20**)
  - `/dashboard/commissions/rules/[id]/edit` — modification type + valeur d'une règle existante (**Sprint 20**)
  - `/dashboard/employees/[id]/commissions` — commissions d'un employé : résumé net + entrées paginées + formulaire ajustement (**Sprint 20**)
  - `/dashboard/billing` — dashboard abonnement : plan actuel, statut, période, quotas salons/employés, changement de plan/cycle (**Sprint 18**)
  - `/dashboard/plans` — catalogue plans ESSENTIAL/PRO/BUSINESS avec prix, features, marquage plan actuel (**Sprint 18**)
  - `/dashboard/suspended` — page organisation suspendue (accessible sans vérification, affiche raison) (**Sprint 19**)
  - `/admin/login` — connexion Super Admin (AdminUser, cookie admin_session séparé) (**Sprint 19**)
  - `/admin` — tableau de bord admin : stats MRR/ARR, abonnements, orgs suspendues, remises actives (**Sprint 19**)
  - `/admin/organizations` — liste toutes les organisations + recherche nom/email + filtre statut (**Sprint 19**)
  - `/admin/organizations/[id]` — détail org : infos, abonnement, suspension/réactivation, impersonation, notes internes CRUD, audit (**Sprint 19**)
  - `/admin/organizations/[id]/billing` — gestion abonnement : changement plan, plan gratuit, remises, extension essai (**Sprint 19**)
  - `/admin/subscriptions` — liste tous les abonnements avec statuts (**Sprint 19**)
  - `/admin/metrics` — métriques MRR/ARR par plan, stats abonnements (**Sprint 19**)
  - `/api/admin/logout` — déconnexion admin (supprime admin_session) (**Sprint 19**)
  - `/book/[slug]` — wizard public réservation : étape 1 (services) (**Sprint 11**)
  - `/book/[slug]/confirm` — récapitulatif + formulaire coordonnées (**Sprint 11**)
  - `/book/[slug]/success` — confirmation réservation (**Sprint 11**)
- **Permissions** : `src/lib/permissions/` — `tenant.ts` + `organization.permissions.ts` + `salon.permissions.ts` + `employee.permissions.ts` + `service.permissions.ts` + `schedule.permissions.ts` + `appointment.permissions.ts` + `client.permissions.ts` + `payment.permissions.ts` + `inventory.permissions.ts` + `supplier.permissions.ts` + `purchase-order.permissions.ts` + `billing.permissions.ts` + `commission.permissions.ts`
- **Super Admin SaaS Sprint 19** :
  - `src/features/admin/admin-jwt.utils.ts` — sign/verify JWT admin (secret `admin:${JWT_SECRET}`, safe middleware)
  - `src/features/admin/admin-auth.service.ts` — getAdminSession / set / clear cookie admin_session
  - `src/features/admin/admin-audit.service.ts` — logAdminAction(tx, adminId, action, orgId, reason, details)
  - `src/features/admin/admin.service.ts` — CRUD orgs, plans, remises, suspension, impersonation, notes (toutes mutations dans `$transaction`)
  - `src/features/admin/admin-metrics.service.ts` — getMrrBreakdown (isFree=false, ACTIVE) + getSubscriptionStats
  - `src/features/admin/admin.schema.ts` — 9 schemas Zod (reason min 10 chars sur toutes les actions sensibles)
  - `src/features/admin/types.ts` — AdminPayload, OrgAdminView, OrgListItem, MrrBreakdown, SubscriptionStats, AdminAuditLogEntry, AdminActionState
  - `src/features/admin/components/` — 17 composants UI admin
  - `prisma/seed.ts` — upsert AdminUser DEV : `admin@kalend.dev / AdminDev123!`
- **Services métier** : `src/features/organizations/` + `src/features/salons/` + `src/features/employees/` + `src/features/services/` + `src/features/schedules/` + `src/features/appointments/` + `src/features/clients/` + `src/features/dashboard/` + `src/features/payments/` + `src/features/notifications/` + `src/features/inventory/` + `src/features/suppliers/` + `src/features/purchase-orders/` + `src/features/billing/` + `src/features/admin/` + `src/features/commissions/`
- **Validation** : `zod@4.4.3` — Server Actions
- **Seed DEV** : `owner@test.local / Test1234!` (Organisation "Salon Test") + `admin@kalend.dev / AdminDev123!` (SuperAdmin).
- **Schéma Prisma** : 43 modèles + 24 enums + 13 migrations (4 appliquées + 9 en attente Docker).
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
- **Gestion des Stocks & Produits Sprint 16** :
  - `src/lib/permissions/inventory.permissions.ts` — `canManageInventory()` (OWNER via `canAccessTenant`), `canAdjustStock()` (OWNER + MANAGER)
  - `src/features/inventory/types.ts` — 8 types : ProductCategoryView, ProductView, ProductSummary, StockMovementView, LowStockProduct, InventoryDashboard, ProductsPage, StockMovementsPage
  - `src/features/inventory/product.schema.ts` — 6 schémas Zod : CreateProductCategorySchema, CreateProductSchema, UpdateProductSchema, RecordEntrySchema, RecordUsageSchema, AdjustStockSchema (notes obligatoires), SellProductSchema (CASH|CARD|TRANSFER|OTHER — sans CHECK)
  - `src/features/inventory/product.service.ts` — 7 fonctions : createProductCategory, getProductCategories, createProduct, getProduct, updateProduct, deactivateProduct (garde `quantity > 0`), getProducts
  - `src/features/inventory/stock.service.ts` — architecture transactionnelle : `assertSufficientStock` (interne, dans `$transaction`), `applyStockMovement` (interne, upsert ProductStock + StockMovement atomiques), `recordEntry`, `deductStockForSale` (prend `TransactionClient`), `createProductSalePayment` (`$transaction` : getNextReceiptNumber → payment → paymentLine → deductStockForSale), `recordUsage`, `adjustStock`, `getLowStockProducts`, `getStockMovements`, `getInventoryDashboard`
  - 10 composants UI : StockBadge, LowStockAlert, InventoryStatsCard, ProductList, ProductForm, StockMovementForm (notes requis si mode=adjust), SellProductForm (sans CHECK), StockHistoryTable, DeactivateProductButton (useActionState), CategoryForm
  - 10 routes + actions : inventory hub, products list, products/new, products/[id], products/[id]/edit, entry, sell, movements, categories, categories/new
  - `ProductStock` = source de vérité atomique (jamais dérivé depuis SUM) · `StockMovement` = audit trail immuable (`onDelete: Restrict`) · Multi-tenant strict `salonId + organizationId` · Migration additive zéro ALTER TABLE
  - **Dette Sprint 17** : pas d'inversion automatique de stock lors de l'annulation d'un paiement (MVP documenté)
  - 33 fichiers créés/modifiés · `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (42 routes) · 21/21 tests (14 PASS / 1 PARTIAL / 6 FAILs corrigés post-review)
- **Commissions Employés Sprint 20** :
  - `src/lib/permissions/commission.permissions.ts` — `canManageCommissionRules()` (OWNER via `canAccessTenant`), `canViewCommissions()` (OWNER + MANAGER), `canAdjustCommissions()` (OWNER via `canAccessTenant`)
  - `src/features/commissions/types.ts` — CommissionType, CommissionEntryStatus, CommissionRuleView, CommissionEntryView, CommissionAdjustmentView, CommissionSummary, CommissionEntriesPage, CommissionRulesPage, TopCommissionEmployee, CommissionKpi, CommissionOverview, RuleFormState, AdjustFormState (Codex)
  - `src/features/commissions/commission.schema.ts` — CreateCommissionRuleSchema (refine : pas serviceId + productId simultanés, PERCENTAGE → 1–100), UpdateCommissionRuleSchema, DeactivateCommissionRuleSchema, AdjustCommissionSchema (deltaCents ≠ 0, reason min 10 chars) (Codex)
  - `src/features/commissions/commission-calculator.service.ts` — `ruleSpecificity()` (0–3 : +2 si employeeId, +1 si serviceId ou productId), `resolveRule()` (tri DESC spécificité puis DESC createdAt, premier match gagne), `calculateAndRecordCommissions(tx, opts)` (dans `$transaction`, PERCENTAGE = `Math.round(baseAmountCents × value / 100)`, FIXED_AMOUNT = `value × quantity`) (Claude)
  - `src/features/commissions/commission-rule.service.ts` — `getCommissionRules`, `getCommissionRule`, `createCommissionRule`, `updateCommissionRule` (type+valeur uniquement), `deactivateCommissionRule` (garde : non trouvée ou déjà inactive → throw) (Claude)
  - `src/features/commissions/commission-entry.service.ts` — `getCommissionEntries` (paginé), `getCommissionEntriesForPayment`, `getEmployeeCommissions`, `getEmployeeCommissionSummary` (CANCELLED exclus), `getCommissionOverview` (byEmployee, CANCELLED exclus), `adjustCommission` (dans `$transaction`, garde CANCELLED) (Claude)
  - `src/features/payments/payment.service.ts` modifié — `createPaymentForAppointment` : `calculateAndRecordCommissions(tx, {...})` dans `$transaction` existant · `cancelPayment` : wrappé dans `$transaction` + `commissionEntry.updateMany({status: CANCELLED})` atomique (Claude)
  - `src/features/inventory/stock.service.ts` modifié — `createProductSalePayment` : `employee.findFirst({proUserId, salonId, isActive})` → `calculateAndRecordCommissions(tx, {...})` si `sellerEmployee` trouvé (pas d'erreur si introuvable) (Claude)
  - `src/features/dashboard/types.ts` modifié — `TopCommissionEmployee`, `CommissionKpi { totalCents, topEmployees }`, `DashboardKpi` étendu avec `commissions: CommissionKpi` (Claude)
  - `src/features/dashboard/dashboard.service.ts` modifié — `fetchCommissionTotals` (aggregate SUM, CANCELLED exclus) + `fetchTopCommissionEmployees` (groupBy employeeId, top 5) + `getDashboardKpi` étendu (9 agrégats Promise.all) (Claude)
  - 7 composants UI (Codex) : `commission-status-badge` (PENDING=gris, CONFIRMED=vert, CANCELLED=rouge, ADJUSTED=orange), `commission-summary-card` (base + ajustements + net), `commission-entry-table` (`showEmployee?`), `commission-rule-list` (Client, useActionState par ligne), `commission-rule-form` (Client, useActionState, defaultValues mode édition), `commission-adjust-form` (Client, useActionState, hidden entryId), `kpi-commission-card` (total + top 3 employés)
  - **Algorithme de priorité** : spécificité = (employeeId ? 2 : 0) + (serviceId || productId ? 1 : 0) ; tri DESC spécificité puis DESC createdAt ; premier match → commission calculée ; aucun match → pas de commission (pas d'erreur)
  - **Atomicité absolue** : `calculateAndRecordCommissions` uniquement appelé dans `$transaction` existant — jamais hors transaction
  - **Immutabilité CommissionEntry** : `commissionCents` jamais modifié ; tout ajustement via `CommissionAdjustment.deltaCents` ; `netCommissionCents = commissionCents + SUM(deltaCents)`
  - **Isolation multi-tenant** : `organizationId` toujours depuis `session.organizationId` (JWT) · `salonId` toujours depuis `getSalon(session.organizationId)` · aucune donnée commission depuis client
  - **Migration `20260624000009_commissions`** : strictement additive — 2 `CREATE TYPE` (`commission_type`, `commission_entry_status`) + 3 `CREATE TABLE` (`commission_rules`, `commission_entries`, `commission_adjustments`) + FK Cascade/Restrict/SetNull. Zéro DROP/ALTER TABLE existant
  - `prisma validate` ✅ · `prisma generate` ✅ · `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ · **45/45 tests PASS** · 0 régression Sprint 14/13/16
  - Contributeurs : Claude Sonnet 4.6 (architecture, services, migration, permissions, pages, actions, intégrations) + OpenAI Codex (types, schémas Zod, 7 composants UI)
- **Abonnements SaaS & Facturation Sprint 18** :
  - `src/features/billing/types.ts` — 9 types : `PlanCode` (ESSENTIAL/PRO/BUSINESS), `BillingCycleType` (MONTHLY/YEARLY), `OrgSubStatus` (TRIAL/ACTIVE/PAST_DUE/CANCELED), `BillingPlanView`, `OrgSubscriptionView`, `QuotaStatus`, `BillingQuota`, `BillingDashboard`, `UpgradePlanFormState`
  - `src/features/billing/billing.schema.ts` — 2 schémas Zod : `UpgradePlanSchema` (organizationId + planCode + billingCycle), `ChangeBillingCycleSchema` (organizationId + billingCycle)
  - `src/features/billing/billing.service.ts` — 9 fonctions : `getCurrentSubscription`, `getSubscriptionPlan`, `getActivePlans`, `canCreateSalon`, `canCreateEmployee`, `getRemainingQuota`, `isFeatureEnabled` (**backward compat : true si subscription=null**), `getBillingDashboard`, `upsertSubscription` (simulation ACTIVE, sans Stripe)
  - `src/lib/permissions/billing.permissions.ts` — 4 helpers serveur : `canUseInventory`, `canUsePayments`, `canUseSuppliers`, `canUseDashboard`
  - `src/features/billing/components/` — 4 composants : `BillingStatusBadge` (TRIAL/ACTIVE/PAST_DUE/CANCELED), `PlanCard` (features hardcodées par plan), `BillingQuotaCard` (barres de progression salons/employés), `BillingCurrentPlan` ("use client", deux `useActionState` — upgrade + changement cycle)
  - `src/app/(dashboard)/dashboard/billing/actions.ts` — `upgradePlanAction`, `changeBillingCycleAction` (organizationId exclusivement depuis JWT, jamais FormData)
  - `src/app/(dashboard)/dashboard/billing/page.tsx` — dashboard abonnement : plan actuel, badge statut, période, quotas, changement plan/cycle
  - `src/app/(dashboard)/dashboard/plans/page.tsx` — catalogue ESSENTIAL/PRO/BUSINESS avec marquage plan actuel
  - **Feature gates** : `ESSENTIAL_BLOCKED = new Set(["kpi","inventory","suppliers","payments"])` — ESSENTIAL bloque 4 modules ; PRO/BUSINESS tout ouvert ; sans abonnement tout ouvert
  - **Guards premium** : 5 pages modifiées avec `if (!billingOk) redirect("/dashboard/billing")` — kpi, inventory, payments, suppliers, purchase-orders
  - **Quotas** : ESSENTIAL (1 salon, 2 employés) · PRO (3 salons, 10 employés) · BUSINESS (illimités, null)
  - **Plans (centimes)** : ESSENTIAL 2900/29000 · PRO 5900/59000 · BUSINESS 9900/99000
  - **Migration `20260624000006_billing_core`** : 3 `CREATE TYPE` + 2 `CREATE TABLE` + FK Cascade/Restrict — additive, zéro DROP, zéro ALTER TABLE existant
  - **Seed** : 3 upserts idempotents par `code` (ESSENTIAL/PRO/BUSINESS)
  - **Absence Stripe** : aucun SDK, aucune clé, aucun webhook — `upsertSubscription` force `status=ACTIVE` et calcule `currentPeriodEnd` (simulation pure)
  - **Backward compat** : `isFeatureEnabled` retourne `true` si `getCurrentSubscription` retourne `null` — zéro régression installations existantes
  - `prisma validate` ✅ · `prisma generate` ✅ · `tsc --noEmit` ✅ (0 erreur) · `eslint` ✅ · `build` ✅ (53 routes) · 27/27 tests PASS · 0 régression Sprint 17
  - Contributeurs : Claude Sonnet 4.6 (architecture, service, permissions, migration, pages, actions) + OpenAI Codex (types, schémas Zod, 4 composants UI)
- **Fournisseurs & Bons de Commande Sprint 17** :
  - `src/lib/permissions/supplier.permissions.ts` — `canManageSuppliers()` (→ `canAccessTenant`)
  - `src/lib/permissions/purchase-order.permissions.ts` — `canManagePurchaseOrders()` (OWNER + MANAGER)
  - `src/features/suppliers/types.ts` — SupplierView, SupplierSummary, SuppliersPage, SupplierFormState (Codex)
  - `src/features/suppliers/supplier.schema.ts` — CreateSupplierSchema, UpdateSupplierSchema (Zod) (Codex)
  - `src/features/suppliers/supplier.service.ts` — getSuppliers, getSupplierSummaries, getSupplier, createSupplier (unicité nom), updateSupplier, deactivateSupplier (**garde DRAFT/SENT ouverts**)
  - `src/features/purchase-orders/types.ts` — PurchaseOrderLineView, PurchaseOrderReceiptLineView, PurchaseOrderReceiptView, PurchaseOrderView, PurchaseOrderSummary, PurchaseOrdersPage, PurchaseOrderFormState, ReceiveStockFormState (Codex)
  - `src/features/purchase-orders/purchase-order.schema.ts` — CreatePurchaseOrderSchema, AddPurchaseOrderLineSchema, ReceiveStockSchema (Zod) (Codex)
  - `src/features/purchase-orders/purchase-order.service.ts` — getPurchaseOrders (filtres status/supplierId/search), getPurchaseOrder, createPurchaseOrder, addOrderLine (DRAFT uniquement), removeOrderLine (DRAFT, soft-delete isActive=false), sendPurchaseOrder (DRAFT + ≥1 ligne), cancelPurchaseOrder (DRAFT/SENT uniquement)
  - `src/features/purchase-orders/receipt.service.ts` — `receiveStock` : transaction atomique complète (validation → receipt → applyStockMovement PURCHASE_RECEIPT → product.costPriceCents → receiptLine → status RECEIVED/PARTIALLY_RECEIVED). **`productId` issu du serveur uniquement** (`line.productId` depuis lineMap)
  - `src/features/inventory/stock.service.ts` modifié — `applyStockMovement` exporté, `PURCHASE_RECEIPT` ajouté au type union, retourne `Promise<{ id: string }>` (non-breaking)
  - `src/features/inventory/product.service.ts` modifié — ajout `getProductSummaries` (non-paginé, produits actifs)
  - `src/features/inventory/components/stock-history-table.tsx` modifié — `TYPE_LABELS.PURCHASE_RECEIPT = "Réception commande"`
  - `src/app/(dashboard)/dashboard/page.tsx` modifié — 2 nouveaux liens : Fournisseurs + Commandes
  - 10 composants UI (Codex) : supplier-list, supplier-form, supplier-detail, purchase-order-list, purchase-order-form, purchase-order-lines-form, purchase-order-detail, purchase-order-status-badge, purchase-order-receive-form, receipt-history-table
  - 15 routes + actions : 4 suppliers + 5 purchase-orders + 2 lines + 2 receive + 2 new
  - **Machine à états PurchaseOrderStatus** : DRAFT → SENT → PARTIALLY_RECEIVED → RECEIVED (terminal) · DRAFT|SENT → CANCELLED (terminal) · PARTIALLY_RECEIVED → CANCELLED interdit
  - **Réception atomique** : `prisma.$transaction` — validation complète avant toute écriture, `applyStockMovement` + `product.update` + `purchaseOrderReceiptLine.create` atomiques
  - **StockMovement PURCHASE_RECEIPT** : `referenceId = receiptId`, `referenceType = "PURCHASE_ORDER_RECEIPT"`, visible dans l'historique stock
  - **Migration `20260624000005_suppliers_purchase_orders`** : additive uniquement — `ALTER TYPE ... ADD VALUE IF NOT EXISTS`, `CREATE TYPE purchase_order_status`, 5 nouvelles tables, zéro DROP/ALTER TABLE existant
  - **Correction CR-01** : `deactivateSupplier` refuse si `count({ status: { in: ["DRAFT","SENT"] } }) > 0`
  - **Correction CR-02** : `verifiedProductId = line.productId` dans `receiveStock` — jamais `incoming.productId` (isolation multi-tenant renforcée)
  - **Correction CR-03** : filtre statut UI via `searchParams.status` + `<select>` dans la page liste
  - 3 corrections post-review appliquées · `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (51 routes) · 21/23 tests PASS + 2 corrections (T05, T22) → 23/23 PASS
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
- **Professionnalisation Sprint 15** :
  - `src/features/notifications/reminder.service.ts` — `processReminders()` : fenêtre 22–26h, filtre CONFIRMED + isActive, déduplication via `Notification.none({ type: APPOINTMENT_REMINDER, status: SENT })`, rapport `{processed, sent, skipped, failed}`
  - `src/features/notifications/notification.service.ts` — dispatch exhaustif APPOINTMENT_CONFIRMATION | APPOINTMENT_REMINDER | APPOINTMENT_CANCELLED + `throw` final (zéro branche implicite)
  - `src/features/notifications/templates/appointment-reminder.template.ts` — email HTML ambre `#D97706`, colonnes Prestation/Coiffeur/Date & Heure/Durée (sans prix), `renderReminderEmail` nommé
  - `src/app/api/cron/reminders/route.ts` — `GET`, sécurisé `Authorization: Bearer CRON_SECRET`, appel `processReminders()`
  - `vercel.json` — CRON `"0 * * * *"` → `/api/cron/reminders`
  - `src/features/payments/receipt.service.ts` — `getNextReceiptNumber(tx, salonId, year)` : upsert atomique `SalonReceiptCounter` dans `$transaction`, `formatReceiptNumber(year, seq)` → `{YEAR}-{00001}`
  - `src/features/payments/payment.service.ts` — `receiptNumber` injecté dans `createPaymentForAppointment()` et `createFreePayment()` ; `year = paidAt.getUTCFullYear()` (paiements backdatés corrects)
  - `src/features/payments/components/receipt-print-button.tsx` — Client Component `"use client"`, `print:hidden`, `window.print()`
  - `src/app/(dashboard)/dashboard/payments/[id]/receipt/page.tsx` — reçu imprimable Server Component, bandeau "CE PAIEMENT A ÉTÉ ANNULÉ" visible écran + impression, `@page { margin: 1.5cm }`
  - `SalonReceiptCounter` — nouveau modèle Prisma, migration `20260624000003_receipt_counter` (zéro ALTER TABLE)
  - `CRON_SECRET` documenté dans `.env.example`
  - Aucune nouvelle dépendance npm · 54/54 vérifications PASS
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
Sprint 15 : `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (32 routes) · 54/54 vérifications PASS
Sprint 16 : `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (42 routes) · 6 corrections post-review appliquées · 0 régression
Sprint 17 : `prisma validate` ✅ · `typecheck` ✅ · `lint` ✅ · `build` ✅ (51 routes) · 3 corrections post-review (CR-01/CR-02/CR-03) · 23/23 tests PASS · 0 régression
Sprint 18 : `prisma validate` ✅ · `prisma generate` ✅ · `tsc --noEmit` ✅ (0 erreur) · `eslint` ✅ · `build` ✅ (53 routes) · 27/27 tests PASS · 0 régression Sprint 17
Sprint 19 : `prisma validate` ✅ · `prisma generate` ✅ · `tsc --noEmit` ✅ (0 erreur) · `eslint` ✅ · `build` ✅ (64 routes) · **62/62 tests PASS** · 0 régression Sprint 18
Sprint 20 : `prisma validate` ✅ · `prisma generate` ✅ · `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ · **45/45 tests PASS** · 0 régression Sprint 14/13/16

## Migrations appliquées

| Nom | Description |
|---|---|
| `20260617014217_init` | Schéma initial (21 tables + 13 enums) |
| `20260618000001_salon_org_unique` | Contrainte unique `Salon.organizationId` (1 salon/org MVP) |
| `20260618000002_employee_photo_url` | `photoUrl TEXT` nullable sur `employees` (préparation Sprint 7+) |
| `20260618120356_appointment_conflict_index` | Index composite `@@index([employeeId, startAt, endAt])` sur `appointments` (**Sprint 8**) |
| `20260624000001_crm_snapshot_and_indexes` | ⚠️ **EN ATTENTE** — `priceCentsSnapshot INT?` sur `appointments` + `@@index([phone])` sur `clients` + `@@index([salonId, createdAt])` sur `salon_clients` (**Sprint 10**) |
| `20260624000002_payments` | ⚠️ **EN ATTENTE** — enums `payment_method` + `payment_status`, tables `payments` + `payment_lines`, 6 index, FK Restrict (salon), SetNull (appointment/client/createdBy), Cascade (paymentLine→payment) (**Sprint 14**) |
| `20260624000003_receipt_counter` | ⚠️ **EN ATTENTE** — table `salon_receipt_counters` (id, salonId, year, lastSeq), unique `(salonId, year)`, FK CASCADE → salons (**Sprint 15**) |
| `20260624000004_inventory_stock` | ⚠️ **EN ATTENTE** — enum `stock_movement_type`, tables `product_categories` + `products` + `product_stocks` + `stock_movements`, 6 index, FK Restrict/SetNull/Cascade. Additive — zéro ALTER TABLE (**Sprint 16**) |
| `20260624000005_suppliers_purchase_orders` | ⚠️ **EN ATTENTE** — `ALTER TYPE stock_movement_type ADD VALUE IF NOT EXISTS 'PURCHASE_RECEIPT'` + enum `purchase_order_status`, tables `suppliers` + `purchase_orders` + `purchase_order_lines` + `purchase_order_receipts` + `purchase_order_receipt_lines`, FK Restrict/Cascade. Additive — zéro ALTER TABLE (**Sprint 17**) |
| `20260624000006_billing_core` | ⚠️ **EN ATTENTE** — enums `subscription_plan_code` (ESSENTIAL/PRO/BUSINESS) + `billing_cycle` (MONTHLY/YEARLY) + `org_subscription_status` (TRIAL/ACTIVE/PAST_DUE/CANCELED) + tables `billing_plans` + `organization_subscriptions`, FK Cascade(org)/Restrict(plan). Additive — zéro DROP/ALTER TABLE (**Sprint 18**) |
| `20260624000007_super_admin_saas` | ⚠️ **EN ATTENTE** — 2 enums (`admin_action` × 11 valeurs, `discount_type` × 2) + 5 tables (`admin_users`, `admin_audit_logs`, `billing_discounts`, `admin_impersonation_logs`, `organization_admin_notes`) + 5 colonnes additives (`organizations` : suspension_reason/suspended_at/suspended_by_admin_id ; `organization_subscriptions` : is_free/free_reason) + 9 FK + 7 index. Additive — zéro DROP/ALTER TABLE (**Sprint 19**) |
| `20260624000008_admin_note_audit` | ⚠️ **EN ATTENTE** — `ALTER TYPE admin_action ADD VALUE IF NOT EXISTS` × 3 : ADD_NOTE, UPDATE_NOTE, DELETE_NOTE. Additive (**Sprint 19 correctif**) |
| `20260624000009_commissions` | ⚠️ **EN ATTENTE** — 2 enums (`commission_type` : PERCENTAGE/FIXED_AMOUNT ; `commission_entry_status` : PENDING/CONFIRMED/CANCELLED/ADJUSTED) + 3 tables (`commission_rules`, `commission_entries`, `commission_adjustments`) + FK Cascade/Restrict/SetNull. Additive — zéro DROP/ALTER TABLE (**Sprint 20**) |

## Git / Release

- `main` = seule branche stable active.
- Tags : `v0.1.0-foundations` · `v0.2.0-bootstrap` · `v0.3.0-prisma-schema` · `v0.4.0-db-migration` · `v0.5.0-auth` · `v0.6.0-org-salon` · `v0.7.0-employees-services` · `v0.8.0-schedules` · `v0.9.0-appointments` · `v1.0.0-agenda` · `v1.1.0-crm-clients` · `v1.2.0-public-booking` · `v1.3.0-email-notifications` · `v1.4.0-dashboard-kpi` · `v1.5.0-payments-pos` · `v1.6.0-reminders-receipts` · `v1.7.0-inventory` · `v1.8.0-suppliers-purchase-orders` · `v1.9.0-billing-core` · `v2.0.0-super-admin` · **`v2.1.0-commissions`**.
- PR **#41** (`feature/sprint20-commissions`) **mergée** dans `main` (merge commit `b44e07f`).
- Branche `feature/sprint20-commissions` **supprimée** (locale + distante, via `gh pr merge --delete-branch` + `git fetch --prune`).
- Tag annoté **`v2.1.0-commissions`** créé et poussé.
- PR **#39** (`feature/sprint19-super-admin`) **mergée** dans `main` (merge commit `4b501a2`).
- Branche `feature/sprint19-super-admin` **supprimée** (locale + distante, via `gh pr merge --delete-branch` + `git fetch --prune`).
- Tag annoté **`v2.0.0-super-admin`** créé et poussé.
- PR **#37** (`feature/sprint18-billing-core`) **mergée** dans `main` (merge commit `1688938`).
- Branche `feature/sprint18-billing-core` **supprimée** (locale + distante via `gh pr merge --delete-branch` + `git fetch --prune`).
- PR **#35** (`feature/sprint17-suppliers-purchase-orders`) **mergée** dans `main` (merge commit `cfda0aa`).
- Branche `feature/sprint17-suppliers-purchase-orders` **supprimée** (locale + distante via `gh pr merge --delete-branch`).
- PR **#17** (`feature/sprint9-agenda`) **mergée** dans `main` (merge commit `36156b1`).
- PR **#18** (`docs/sprint9-closure`) **mergée** dans `main` (commit `7976531`).
- PR **#19** (`feature/sprint10-crm-clients`) **mergée** dans `main` (merge commit `361155b`).
- PR **#21** (`feature/sprint11-public-booking`) **mergée** dans `main` (squash commit `2146c45`).
- PR **#22** (`docs/codex-guidelines`) **mergée** dans `main` (squash commit `2dbf910`).
- PR **#23** (`docs/codex-coauthor-rule`) **mergée** dans `main` (squash commit `86716e8`).
- PR **#25** (`feature/sprint12-email-notifications`) **mergée** dans `main` (squash commit `b92611a`).
- PR **#27** (`feature/sprint13-dashboard-kpi`) **mergée** dans `main` (merge commit `91669cf`).
- PR **#29** (`feature/sprint14-payments-pos`) **mergée** dans `main` (merge commit `4b7bdfa`).
- PR **#31** (`feature/sprint15-reminders-receipts`) **mergée** dans `main` (merge commit `bc96874`).
- PR **#33** (`feature/sprint16-inventory`) **mergée** dans `main` (merge commit `600882e`).
- Branches feature/sprint9-agenda, docs/sprint9-closure, feature/sprint10-crm-clients, feature/sprint11-public-booking, docs/codex-guidelines, docs/codex-coauthor-rule, feature/sprint12-email-notifications, feature/sprint13-dashboard-kpi, feature/sprint14-payments-pos, feature/sprint15-reminders-receipts, feature/sprint16-inventory, feature/sprint17-suppliers-purchase-orders **supprimées** (locale + distante).

## Base de données

- PostgreSQL local via Docker Compose — base DEV isolée.
- Migrations appliquées : voir tableau ci-dessus.
- Seed DEV : `owner@test.local / Test1234!` + Salon "Salon Test" (commande : `pnpm db:seed`).

## Production Vercel (`kalendhair-4-0`)

- **Déploiement actif** : `dpl_9ErGzhzRYvoRvnvHYAVZHYdrfm7C` — alias `https://kalendhair-4-0.vercel.app`
- **Script build Vercel** : `prisma generate && next build` (package.json, PR #45, SHA `2cb6778`)
- **Neon DB** : `kalendhair-4-prod` (Frankfurt, `aws-eu-central-1`) — 44 tables + 24 enums, 13 migrations appliquées
- **BillingPlan** : ESSENTIAL / PRO / BUSINESS (upsert idempotent, 0 donnée DEV)
- **AdminUser production** : `hasan@netzinformatique.fr` / `Hasan Biçer` (bcrypt x12, jamais connecté)
- **Domaines custom** : attachés à `kalend-hair-2-0` uniquement — aucune bascule effectuée
- **Routes testées** :
  - `/` → 200 ✓ · `/login` → 200 ✓ · `/admin/login` → 200 ✓ (formulaire visible)
  - `/admin` → 307 → `/admin/login` ✓ · `/dashboard` → 307 → `/login` ✓
- **Erreurs résolues** :
  - P2022 `admin_users.passwordHash` — corrigé PR #44 (@map) + PR #45 (prisma generate dans build)
  - Redirect loop `/admin/login` — corrigé PR #43 (route group `(protected)`)

## Prochaine étape

Sprint 21 : à définir avec ChatGPT.

⚠️ **Prérequis persistant** : appliquer les migrations en attente via `pnpm db:migrate` dès que Docker + `.env` disponibles :
- `20260624000001_crm_snapshot_and_indexes` (Sprint 10 — non destructive)
- `20260624000002_payments` (Sprint 14 — non destructive)
- `20260624000003_receipt_counter` (Sprint 15 — non destructive)
- `20260624000004_inventory_stock` (Sprint 16 — non destructive)
- `20260624000005_suppliers_purchase_orders` (Sprint 17 — non destructive)
- `20260624000006_billing_core` (Sprint 18 — non destructive)
- `20260624000007_super_admin_saas` (Sprint 19 — non destructive)
- `20260624000008_admin_note_audit` (Sprint 19 correctif — non destructive)
- `20260624000009_commissions` (Sprint 20 — non destructive)

### Risques restants acceptés (Sprint 20)

| Risque | Sévérité | Décision |
|---|---|---|
| R1 — UX ajustement : formulaire ajustement fixé sur le premier entry du paginator (pas de sélecteur d'entrée) | LOW | UX simplifiée acceptable pour MVP — à améliorer Sprint suivant |
| R2 — `cancelPayment` wrappé dans `$transaction` mais sans `tx: TransactionClient` explicit en signature | LOW | Fonctionnel, refactoring cosmétique acceptable |
| R3 — `calculateAndRecordCommissions` filtre par `salonId` uniquement (pas `organizationId`) dans `commission_rules` | LOW | Sécurisé par FK (salonId → salons → organizationId) — cosmétiquement inconsistant |
| R4 — Bouton "Règles" visible en MANAGER (mais la page redirige) | LOW | Confusion UX mineure, pas de risque sécurité — guard server-side actif |
| R5 — Paiements libres (`createFreePayment`) sans commission (pas d'employeeId sur le paiement libre) | LOW | Comportement documenté — commissions liées aux prestations et aux produits vendeurs uniquement |

### Risques restants acceptés (Sprint 19)

| Risque | Sévérité | Décision |
|---|---|---|
| Pas de rate limiting sur `/admin/login` | MEDIUM | À ajouter avant mise en production |
| FK manquante `organizations.suspended_by_admin_id → admin_users.id` | LOW | Migration additive à planifier en Sprint suivant |
| TTL impersonation non enforced côté serveur (cookie-side only) | LOW | Acceptable pour MVP |

---

_Dernière mise à jour : 2026-06-25 — Correctifs production PR #43/#44/#45 mergés, déploiement `dpl_9ErGzhzRYvoRvnvHYAVZHYdrfm7C` actif, 0 erreur P2022, `/admin/login` HTTP 200._
