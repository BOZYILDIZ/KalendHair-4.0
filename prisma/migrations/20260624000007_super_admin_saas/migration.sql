-- Migration Sprint 19 — Super Admin SaaS
-- Additive uniquement : aucun DROP, aucun ALTER destructif sur les tables existantes.

-- Nouvelles énumérations
CREATE TYPE "admin_action" AS ENUM (
  'CHANGE_PLAN',
  'GRANT_FREE_PLAN',
  'REVOKE_FREE_PLAN',
  'CHANGE_BILLING_CYCLE',
  'CREATE_DISCOUNT',
  'DEACTIVATE_DISCOUNT',
  'SUSPEND_ORGANIZATION',
  'REACTIVATE_ORGANIZATION',
  'EXTEND_TRIAL',
  'ADMIN_IMPERSONATION_START',
  'ADMIN_IMPERSONATION_END'
);

CREATE TYPE "discount_type" AS ENUM ('PERCENT', 'FIXED_AMOUNT');

-- Table admin_users : credentials SuperAdmin indépendants des tenants
CREATE TABLE "admin_users" (
  "id"           TEXT NOT NULL,
  "email"        TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "is_active"    BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- Table admin_audit_logs : piste d'audit cross-tenant des actions SuperAdmin
CREATE TABLE "admin_audit_logs" (
  "id"            TEXT NOT NULL,
  "admin_id"      TEXT NOT NULL,
  "action"        "admin_action" NOT NULL,
  "target_org_id" TEXT,
  "reason"        TEXT NOT NULL,
  "details"       JSONB NOT NULL,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_audit_logs_admin_id_idx" ON "admin_audit_logs"("admin_id");
CREATE INDEX "admin_audit_logs_target_org_id_idx" ON "admin_audit_logs"("target_org_id");

-- Table billing_discounts : remises exceptionnelles sur abonnements
CREATE TABLE "billing_discounts" (
  "id"                     TEXT NOT NULL,
  "subscription_id"        TEXT NOT NULL,
  "type"                   "discount_type" NOT NULL,
  "value"                  INTEGER NOT NULL,
  "reason"                 TEXT NOT NULL,
  "start_date"             TIMESTAMP(3) NOT NULL,
  "end_date"               TIMESTAMP(3),
  "is_active"              BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by_admin_id"    TEXT NOT NULL,
  "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deactivated_at"         TIMESTAMP(3),
  "deactivated_by_admin_id" TEXT,
  CONSTRAINT "billing_discounts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "billing_discounts_subscription_id_idx" ON "billing_discounts"("subscription_id");

-- Table admin_impersonation_logs : journal d'impersonation SuperAdmin
CREATE TABLE "admin_impersonation_logs" (
  "id"              TEXT NOT NULL,
  "admin_id"        TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "started_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ended_at"        TIMESTAMP(3),
  CONSTRAINT "admin_impersonation_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_impersonation_logs_admin_id_idx" ON "admin_impersonation_logs"("admin_id");
CREATE INDEX "admin_impersonation_logs_organization_id_idx" ON "admin_impersonation_logs"("organization_id");

-- Table organization_admin_notes : notes internes SuperAdmin sur les organisations
CREATE TABLE "organization_admin_notes" (
  "id"              TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "admin_id"        TEXT NOT NULL,
  "content"         TEXT NOT NULL,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "organization_admin_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "organization_admin_notes_organization_id_idx" ON "organization_admin_notes"("organization_id");

-- Colonnes additives sur organization_subscriptions
ALTER TABLE "organization_subscriptions" ADD COLUMN "is_free"      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "organization_subscriptions" ADD COLUMN "free_reason"  TEXT;

-- Colonnes additives sur organizations
ALTER TABLE "organizations" ADD COLUMN "suspension_reason"     TEXT;
ALTER TABLE "organizations" ADD COLUMN "suspended_at"          TIMESTAMP(3);
ALTER TABLE "organizations" ADD COLUMN "suspended_by_admin_id" TEXT;

-- Contraintes de clés étrangères
ALTER TABLE "admin_audit_logs"
  ADD CONSTRAINT "admin_audit_logs_admin_id_fkey"
  FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "admin_audit_logs"
  ADD CONSTRAINT "admin_audit_logs_target_org_id_fkey"
  FOREIGN KEY ("target_org_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "billing_discounts"
  ADD CONSTRAINT "billing_discounts_subscription_id_fkey"
  FOREIGN KEY ("subscription_id") REFERENCES "organization_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "billing_discounts"
  ADD CONSTRAINT "billing_discounts_created_by_admin_id_fkey"
  FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "billing_discounts"
  ADD CONSTRAINT "billing_discounts_deactivated_by_admin_id_fkey"
  FOREIGN KEY ("deactivated_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "admin_impersonation_logs"
  ADD CONSTRAINT "admin_impersonation_logs_admin_id_fkey"
  FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "admin_impersonation_logs"
  ADD CONSTRAINT "admin_impersonation_logs_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "organization_admin_notes"
  ADD CONSTRAINT "organization_admin_notes_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "organization_admin_notes"
  ADD CONSTRAINT "organization_admin_notes_admin_id_fkey"
  FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
