-- Sprint 14 : Module Caisse (POS)
-- Migration additive — aucune modification des tables existantes.

-- Enums
CREATE TYPE "payment_method" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'OTHER');
CREATE TYPE "payment_status" AS ENUM ('COMPLETED', 'CANCELLED');

-- Table payments
CREATE TABLE "payments" (
  "id"                 TEXT         NOT NULL,
  "organizationId"     TEXT         NOT NULL,
  "salonId"            TEXT         NOT NULL,
  "appointmentId"      TEXT,
  "clientId"           TEXT,
  "guestName"          TEXT,
  "method"             "payment_method" NOT NULL,
  "status"             "payment_status" NOT NULL DEFAULT 'COMPLETED',
  "amountCents"        INTEGER      NOT NULL,
  "paidAt"             TIMESTAMP(3) NOT NULL,
  "receiptNumber"      TEXT,
  "notes"              TEXT,
  "createdByProUserId" TEXT,
  "isActive"           BOOLEAN      NOT NULL DEFAULT true,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Table payment_lines
CREATE TABLE "payment_lines" (
  "id"             TEXT         NOT NULL,
  "paymentId"      TEXT         NOT NULL,
  "label"          TEXT         NOT NULL,
  "unitPriceCents" INTEGER      NOT NULL,
  "quantity"       INTEGER      NOT NULL DEFAULT 1,
  "totalCents"     INTEGER      NOT NULL,
  "serviceId"      TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_lines_pkey" PRIMARY KEY ("id")
);

-- Foreign keys payments
ALTER TABLE "payments"
  ADD CONSTRAINT "payments_salonId_fkey"
    FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_createdByProUserId_fkey"
    FOREIGN KEY ("createdByProUserId") REFERENCES "pro_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys payment_lines
ALTER TABLE "payment_lines"
  ADD CONSTRAINT "payment_lines_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_lines"
  ADD CONSTRAINT "payment_lines_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes payments
CREATE INDEX "payments_salonId_paidAt_idx"        ON "payments"("salonId", "paidAt");
CREATE INDEX "payments_appointmentId_idx"          ON "payments"("appointmentId");
CREATE INDEX "payments_clientId_idx"              ON "payments"("clientId");
CREATE INDEX "payments_organizationId_paidAt_idx" ON "payments"("organizationId", "paidAt");
CREATE INDEX "payments_createdByProUserId_idx"    ON "payments"("createdByProUserId");

-- Indexes payment_lines
CREATE INDEX "payment_lines_paymentId_idx"        ON "payment_lines"("paymentId");
