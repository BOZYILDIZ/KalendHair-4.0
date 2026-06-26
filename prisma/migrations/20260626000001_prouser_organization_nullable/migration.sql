-- Migration additive — rend organizationId nullable sur pro_users
-- Nécessaire pour le self-service onboarding : ProUser créé avant l'Organization
-- Impact sur données existantes : aucun (tous les ProUsers existants conservent leur organizationId)
-- Impact onDelete : CASCADE → SET NULL (si une org est supprimée, les ProUsers gardent leur ligne)

-- Rendre la colonne nullable
ALTER TABLE "pro_users" ALTER COLUMN "organizationId" DROP NOT NULL;

-- Mettre à jour la contrainte FK : ON DELETE CASCADE → ON DELETE SET NULL
ALTER TABLE "pro_users" DROP CONSTRAINT "pro_users_organizationId_fkey";
ALTER TABLE "pro_users" ADD CONSTRAINT "pro_users_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
