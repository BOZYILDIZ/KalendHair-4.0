-- Sprint 17 : Fournisseurs & Bons de Commande
-- Migration additive uniquement — aucune destruction de données existantes.
-- Requiert PostgreSQL 12+.

-- 1. Ajout de la valeur PURCHASE_RECEIPT dans l'enum existant
ALTER TYPE "stock_movement_type" ADD VALUE IF NOT EXISTS 'PURCHASE_RECEIPT';

-- 2. Nouvel enum pour le statut des bons de commande
CREATE TYPE "purchase_order_status" AS ENUM (
  'DRAFT',
  'SENT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED'
);

-- 3. Table fournisseurs
CREATE TABLE "suppliers" (
  "id"             TEXT NOT NULL,
  "salonId"        TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name"           TEXT NOT NULL,
  "contactName"    TEXT,
  "email"          TEXT,
  "phone"          TEXT,
  "address"        TEXT,
  "notes"          TEXT,
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "suppliers_salonId_name_key" ON "suppliers"("salonId", "name");
CREATE INDEX "suppliers_salonId_idx" ON "suppliers"("salonId");
CREATE INDEX "suppliers_organizationId_idx" ON "suppliers"("organizationId");

ALTER TABLE "suppliers"
  ADD CONSTRAINT "suppliers_salonId_fkey"
  FOREIGN KEY ("salonId") REFERENCES "salons"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Table bons de commande
CREATE TABLE "purchase_orders" (
  "id"                 TEXT NOT NULL,
  "salonId"            TEXT NOT NULL,
  "organizationId"     TEXT NOT NULL,
  "supplierId"         TEXT NOT NULL,
  "status"             "purchase_order_status" NOT NULL DEFAULT 'DRAFT',
  "reference"          TEXT,
  "expectedAt"         TIMESTAMP(3),
  "notes"              TEXT,
  "createdByProUserId" TEXT,
  "isActive"           BOOLEAN NOT NULL DEFAULT true,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL,

  CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "purchase_orders_salonId_idx" ON "purchase_orders"("salonId");
CREATE INDEX "purchase_orders_organizationId_idx" ON "purchase_orders"("organizationId");
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");

ALTER TABLE "purchase_orders"
  ADD CONSTRAINT "purchase_orders_salonId_fkey"
  FOREIGN KEY ("salonId") REFERENCES "salons"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_orders"
  ADD CONSTRAINT "purchase_orders_supplierId_fkey"
  FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_orders"
  ADD CONSTRAINT "purchase_orders_createdByProUserId_fkey"
  FOREIGN KEY ("createdByProUserId") REFERENCES "pro_users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Table lignes de bon de commande
CREATE TABLE "purchase_order_lines" (
  "id"              TEXT NOT NULL,
  "salonId"         TEXT NOT NULL,
  "organizationId"  TEXT NOT NULL,
  "purchaseOrderId" TEXT NOT NULL,
  "productId"       TEXT NOT NULL,
  "quantityOrdered" INTEGER NOT NULL,
  "unitCostCents"   INTEGER NOT NULL,
  "notes"           TEXT,
  "isActive"        BOOLEAN NOT NULL DEFAULT true,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "purchase_order_lines_purchaseOrderId_idx" ON "purchase_order_lines"("purchaseOrderId");
CREATE INDEX "purchase_order_lines_productId_idx" ON "purchase_order_lines"("productId");

ALTER TABLE "purchase_order_lines"
  ADD CONSTRAINT "purchase_order_lines_purchaseOrderId_fkey"
  FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchase_order_lines"
  ADD CONSTRAINT "purchase_order_lines_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Table réceptions
CREATE TABLE "purchase_order_receipts" (
  "id"                 TEXT NOT NULL,
  "salonId"            TEXT NOT NULL,
  "organizationId"     TEXT NOT NULL,
  "purchaseOrderId"    TEXT NOT NULL,
  "receivedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes"              TEXT,
  "createdByProUserId" TEXT,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "purchase_order_receipts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "purchase_order_receipts_salonId_idx" ON "purchase_order_receipts"("salonId");
CREATE INDEX "purchase_order_receipts_purchaseOrderId_idx" ON "purchase_order_receipts"("purchaseOrderId");

ALTER TABLE "purchase_order_receipts"
  ADD CONSTRAINT "purchase_order_receipts_salonId_fkey"
  FOREIGN KEY ("salonId") REFERENCES "salons"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_order_receipts"
  ADD CONSTRAINT "purchase_order_receipts_purchaseOrderId_fkey"
  FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_order_receipts"
  ADD CONSTRAINT "purchase_order_receipts_createdByProUserId_fkey"
  FOREIGN KEY ("createdByProUserId") REFERENCES "pro_users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Table lignes de réception
CREATE TABLE "purchase_order_receipt_lines" (
  "id"                  TEXT NOT NULL,
  "receiptId"           TEXT NOT NULL,
  "purchaseOrderLineId" TEXT NOT NULL,
  "productId"           TEXT NOT NULL,
  "quantityReceived"    INTEGER NOT NULL,
  "unitCostCents"       INTEGER NOT NULL,
  "totalCostCents"      INTEGER NOT NULL,
  "stockMovementId"     TEXT NOT NULL,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "purchase_order_receipt_lines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "purchase_order_receipt_lines_stockMovementId_key"
  ON "purchase_order_receipt_lines"("stockMovementId");

CREATE INDEX "purchase_order_receipt_lines_receiptId_idx"
  ON "purchase_order_receipt_lines"("receiptId");

CREATE INDEX "purchase_order_receipt_lines_purchaseOrderLineId_idx"
  ON "purchase_order_receipt_lines"("purchaseOrderLineId");

ALTER TABLE "purchase_order_receipt_lines"
  ADD CONSTRAINT "purchase_order_receipt_lines_receiptId_fkey"
  FOREIGN KEY ("receiptId") REFERENCES "purchase_order_receipts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchase_order_receipt_lines"
  ADD CONSTRAINT "purchase_order_receipt_lines_purchaseOrderLineId_fkey"
  FOREIGN KEY ("purchaseOrderLineId") REFERENCES "purchase_order_lines"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_order_receipt_lines"
  ADD CONSTRAINT "purchase_order_receipt_lines_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_order_receipt_lines"
  ADD CONSTRAINT "purchase_order_receipt_lines_stockMovementId_fkey"
  FOREIGN KEY ("stockMovementId") REFERENCES "stock_movements"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
