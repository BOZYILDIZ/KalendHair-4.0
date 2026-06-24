-- Sprint 18 — Abonnements SaaS (Billing Core)
-- Migration additive : zéro ALTER TABLE sur tables existantes, zéro DROP.

-- Enums -----------------------------------------------------------------------

CREATE TYPE "subscription_plan_code" AS ENUM ('ESSENTIAL', 'PRO', 'BUSINESS');

CREATE TYPE "billing_cycle" AS ENUM ('MONTHLY', 'YEARLY');

-- OrgSubscriptionStatus : distinct de l'enum legacy "subscription_status" (Sprint 2 Stripe placeholders)
CREATE TYPE "org_subscription_status" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- Tables ----------------------------------------------------------------------

-- Catalogue des plans commerciaux (1 ligne par plan)
CREATE TABLE "billing_plans" (
    "id"                TEXT        NOT NULL,
    "code"              "subscription_plan_code" NOT NULL,
    "name"              TEXT        NOT NULL,
    "description"       TEXT,
    "monthlyPriceCents" INTEGER     NOT NULL,
    "yearlyPriceCents"  INTEGER     NOT NULL,
    "maxSalons"         INTEGER,
    "maxEmployees"      INTEGER,
    "isActive"          BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_plans_pkey" PRIMARY KEY ("id")
);

-- Abonnement actif d'une organisation (1 ligne par org)
CREATE TABLE "organization_subscriptions" (
    "id"                 TEXT        NOT NULL,
    "organizationId"     TEXT        NOT NULL,
    "planId"             TEXT        NOT NULL,
    "billingCycle"       "billing_cycle"          NOT NULL DEFAULT 'MONTHLY',
    "status"             "org_subscription_status" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt"        TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd"   TIMESTAMP(3) NOT NULL,
    "canceledAt"         TIMESTAMP(3),
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_subscriptions_pkey" PRIMARY KEY ("id")
);

-- Contraintes d'unicité -------------------------------------------------------

CREATE UNIQUE INDEX "billing_plans_code_key"
    ON "billing_plans"("code");

CREATE UNIQUE INDEX "organization_subscriptions_organizationId_key"
    ON "organization_subscriptions"("organizationId");

-- Index -----------------------------------------------------------------------

CREATE INDEX "organization_subscriptions_planId_idx"
    ON "organization_subscriptions"("planId");

-- Clés étrangères -------------------------------------------------------------

ALTER TABLE "organization_subscriptions"
    ADD CONSTRAINT "organization_subscriptions_organizationId_fkey"
    FOREIGN KEY ("organizationId")
    REFERENCES "organizations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "organization_subscriptions"
    ADD CONSTRAINT "organization_subscriptions_planId_fkey"
    FOREIGN KEY ("planId")
    REFERENCES "billing_plans"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
