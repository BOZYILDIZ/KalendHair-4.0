-- Migration additive — champs configuration salon (PR #63 — Étape 2 onboarding)
-- Ajoute currency et language sur salons (valeurs par défaut EUR/fr pour les lignes existantes)
-- Ajoute lunchStartMinute et lunchEndMinute sur salon_schedules (nullable, pas de valeur par défaut)
-- Aucune donnée existante modifiée ou supprimée

ALTER TABLE "salons" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EUR';
ALTER TABLE "salons" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'fr';

ALTER TABLE "salon_schedules" ADD COLUMN "lunchStartMinute" INTEGER;
ALTER TABLE "salon_schedules" ADD COLUMN "lunchEndMinute" INTEGER;
