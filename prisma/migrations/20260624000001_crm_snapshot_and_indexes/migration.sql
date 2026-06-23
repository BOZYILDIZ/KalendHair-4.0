-- Sprint 10 — CRM Clients
-- 1. Snapshot du prix au moment de la création du RDV (nullable, immuable)
ALTER TABLE "appointments" ADD COLUMN "priceCentsSnapshot" INTEGER;

-- 2. Index recherche client par téléphone
CREATE INDEX "clients_phone_idx" ON "clients"("phone");

-- 3. Index pagination liste clients par salon
CREATE INDEX "salon_clients_salonId_createdAt_idx" ON "salon_clients"("salonId", "createdAt");
