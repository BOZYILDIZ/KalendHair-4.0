-- Migration: 20260624000003_receipt_counter
-- Sprint 15 — Numérotation séquentielle des reçus
-- Additive : crée une nouvelle table uniquement.
-- Zéro ALTER TABLE sur les tables existantes.

CREATE TABLE "salon_receipt_counters" (
  "id"      TEXT    NOT NULL,
  "salonId" TEXT    NOT NULL,
  "year"    INTEGER NOT NULL,
  "lastSeq" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "salon_receipt_counters_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "salon_receipt_counters_salonId_year_key"
    UNIQUE ("salonId", "year"),

  CONSTRAINT "salon_receipt_counters_salonId_fkey"
    FOREIGN KEY ("salonId")
    REFERENCES "salons"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
