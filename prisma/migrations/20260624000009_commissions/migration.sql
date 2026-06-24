-- Migration Sprint 20 — Commissions Employés
-- Strictement additive : 2 nouveaux enums, 3 nouvelles tables.
-- Zéro DROP, zéro ALTER TABLE sur tables existantes.

-- Enums
CREATE TYPE "commission_type" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
CREATE TYPE "commission_entry_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'ADJUSTED');

-- Table commission_rules
CREATE TABLE "commission_rules" (
    "id"                  TEXT         NOT NULL,
    "organizationId"      TEXT         NOT NULL,
    "salonId"             TEXT         NOT NULL,
    "employeeId"          TEXT,
    "serviceId"           TEXT,
    "productId"           TEXT,
    "type"                "commission_type" NOT NULL,
    "value"               INTEGER      NOT NULL,
    "isActive"            BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL,
    "createdByProUserId"  TEXT         NOT NULL,
    CONSTRAINT "commission_rules_pkey" PRIMARY KEY ("id")
);

-- Table commission_entries
CREATE TABLE "commission_entries" (
    "id"              TEXT                       NOT NULL,
    "organizationId"  TEXT                       NOT NULL,
    "salonId"         TEXT                       NOT NULL,
    "employeeId"      TEXT                       NOT NULL,
    "paymentId"       TEXT                       NOT NULL,
    "paymentLineId"   TEXT,
    "appointmentId"   TEXT,
    "ruleId"          TEXT,
    "type"            "commission_type"          NOT NULL,
    "baseAmountCents" INTEGER                    NOT NULL,
    "commissionCents" INTEGER                    NOT NULL,
    "status"          "commission_entry_status"  NOT NULL DEFAULT 'PENDING',
    "description"     TEXT                       NOT NULL,
    "createdAt"       TIMESTAMP(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)               NOT NULL,
    CONSTRAINT "commission_entries_pkey" PRIMARY KEY ("id")
);

-- Table commission_adjustments
CREATE TABLE "commission_adjustments" (
    "id"                  TEXT         NOT NULL,
    "entryId"             TEXT         NOT NULL,
    "adjustedByProUserId" TEXT         NOT NULL,
    "deltaCents"          INTEGER      NOT NULL,
    "reason"              TEXT         NOT NULL,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "commission_adjustments_pkey" PRIMARY KEY ("id")
);

-- Contrainte unicité paymentLineId (1 entry max par ligne de paiement)
CREATE UNIQUE INDEX "commission_entries_paymentLineId_key" ON "commission_entries"("paymentLineId");

-- Index commission_rules
CREATE INDEX "commission_rules_organizationId_salonId_isActive_idx" ON "commission_rules"("organizationId", "salonId", "isActive");
CREATE INDEX "commission_rules_employeeId_idx" ON "commission_rules"("employeeId");

-- Index commission_entries
CREATE INDEX "commission_entries_paymentId_idx" ON "commission_entries"("paymentId");
CREATE INDEX "commission_entries_employeeId_createdAt_idx" ON "commission_entries"("employeeId", "createdAt");
CREATE INDEX "commission_entries_organizationId_salonId_createdAt_idx" ON "commission_entries"("organizationId", "salonId", "createdAt");

-- Index commission_adjustments
CREATE INDEX "commission_adjustments_entryId_idx" ON "commission_adjustments"("entryId");

-- FK commission_rules
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_organizationId_fkey"    FOREIGN KEY ("organizationId")    REFERENCES "organizations"("id") ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_salonId_fkey"            FOREIGN KEY ("salonId")           REFERENCES "salons"("id")        ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_employeeId_fkey"         FOREIGN KEY ("employeeId")        REFERENCES "employees"("id")     ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_serviceId_fkey"          FOREIGN KEY ("serviceId")         REFERENCES "services"("id")      ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_productId_fkey"          FOREIGN KEY ("productId")         REFERENCES "products"("id")      ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_createdByProUserId_fkey" FOREIGN KEY ("createdByProUserId") REFERENCES "pro_users"("id")    ON DELETE RESTRICT ON UPDATE CASCADE;

-- FK commission_entries
ALTER TABLE "commission_entries" ADD CONSTRAINT "commission_entries_organizationId_fkey" FOREIGN KEY ("organizationId")  REFERENCES "organizations"("id")    ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "commission_entries" ADD CONSTRAINT "commission_entries_salonId_fkey"        FOREIGN KEY ("salonId")         REFERENCES "salons"("id")           ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "commission_entries" ADD CONSTRAINT "commission_entries_employeeId_fkey"     FOREIGN KEY ("employeeId")      REFERENCES "employees"("id")        ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "commission_entries" ADD CONSTRAINT "commission_entries_paymentId_fkey"      FOREIGN KEY ("paymentId")       REFERENCES "payments"("id")         ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "commission_entries" ADD CONSTRAINT "commission_entries_paymentLineId_fkey"  FOREIGN KEY ("paymentLineId")   REFERENCES "payment_lines"("id")    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commission_entries" ADD CONSTRAINT "commission_entries_appointmentId_fkey"  FOREIGN KEY ("appointmentId")   REFERENCES "appointments"("id")     ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commission_entries" ADD CONSTRAINT "commission_entries_ruleId_fkey"         FOREIGN KEY ("ruleId")          REFERENCES "commission_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- FK commission_adjustments
ALTER TABLE "commission_adjustments" ADD CONSTRAINT "commission_adjustments_entryId_fkey"             FOREIGN KEY ("entryId")             REFERENCES "commission_entries"("id") ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "commission_adjustments" ADD CONSTRAINT "commission_adjustments_adjustedByProUserId_fkey" FOREIGN KEY ("adjustedByProUserId") REFERENCES "pro_users"("id")          ON DELETE RESTRICT ON UPDATE CASCADE;
