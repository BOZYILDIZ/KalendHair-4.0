-- Migration: 20260624000004_inventory_stock
-- Sprint 16 — Gestion des Stocks & Produits
-- Additive : crée 4 nouvelles tables + 1 enum.
-- Zéro ALTER TABLE sur les tables existantes.

-- Enum
CREATE TYPE "stock_movement_type" AS ENUM (
  'ENTRY',
  'SALE',
  'USAGE',
  'ADJUSTMENT'
);

-- ProductCategory
CREATE TABLE "product_categories" (
  "id"             TEXT        NOT NULL,
  "salonId"        TEXT        NOT NULL,
  "organizationId" TEXT        NOT NULL,
  "name"           TEXT        NOT NULL,
  "isActive"       BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_categories_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "product_categories_salonId_name_key"
    UNIQUE ("salonId", "name"),

  CONSTRAINT "product_categories_salonId_fkey"
    FOREIGN KEY ("salonId")
    REFERENCES "salons"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX "product_categories_salonId_idx"
  ON "product_categories"("salonId");

-- Product
CREATE TABLE "products" (
  "id"                TEXT        NOT NULL,
  "salonId"           TEXT        NOT NULL,
  "organizationId"    TEXT        NOT NULL,
  "categoryId"        TEXT,
  "name"              TEXT        NOT NULL,
  "description"       TEXT,
  "unit"              TEXT        NOT NULL DEFAULT 'unité',
  "priceCents"        INTEGER     NOT NULL,
  "costPriceCents"    INTEGER,
  "lowStockThreshold" INTEGER     NOT NULL DEFAULT 5,
  "isActive"          BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,

  CONSTRAINT "products_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "products_salonId_fkey"
    FOREIGN KEY ("salonId")
    REFERENCES "salons"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT "products_categoryId_fkey"
    FOREIGN KEY ("categoryId")
    REFERENCES "product_categories"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE INDEX "products_salonId_idx"
  ON "products"("salonId");

CREATE INDEX "products_organizationId_idx"
  ON "products"("organizationId");

-- ProductStock
CREATE TABLE "product_stocks" (
  "id"        TEXT        NOT NULL,
  "salonId"   TEXT        NOT NULL,
  "productId" TEXT        NOT NULL,
  "quantity"  INTEGER     NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_stocks_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "product_stocks_productId_key"
    UNIQUE ("productId"),

  CONSTRAINT "product_stocks_productId_fkey"
    FOREIGN KEY ("productId")
    REFERENCES "products"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT "product_stocks_salonId_fkey"
    FOREIGN KEY ("salonId")
    REFERENCES "salons"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX "product_stocks_salonId_idx"
  ON "product_stocks"("salonId");

-- StockMovement
CREATE TABLE "stock_movements" (
  "id"                 TEXT                  NOT NULL,
  "salonId"            TEXT                  NOT NULL,
  "organizationId"     TEXT                  NOT NULL,
  "productId"          TEXT                  NOT NULL,
  "type"               "stock_movement_type" NOT NULL,
  "quantityDelta"      INTEGER               NOT NULL,
  "quantityBefore"     INTEGER               NOT NULL,
  "quantityAfter"      INTEGER               NOT NULL,
  "costPriceCents"     INTEGER,
  "notes"              TEXT,
  "referenceId"        TEXT,
  "referenceType"      TEXT,
  "createdByProUserId" TEXT,
  "createdAt"          TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "stock_movements_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "stock_movements_productId_fkey"
    FOREIGN KEY ("productId")
    REFERENCES "products"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT "stock_movements_salonId_fkey"
    FOREIGN KEY ("salonId")
    REFERENCES "salons"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT "stock_movements_createdByProUserId_fkey"
    FOREIGN KEY ("createdByProUserId")
    REFERENCES "pro_users"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE INDEX "stock_movements_salonId_createdAt_idx"
  ON "stock_movements"("salonId", "createdAt");

CREATE INDEX "stock_movements_productId_createdAt_idx"
  ON "stock_movements"("productId", "createdAt");

CREATE INDEX "stock_movements_organizationId_createdAt_idx"
  ON "stock_movements"("organizationId", "createdAt");
