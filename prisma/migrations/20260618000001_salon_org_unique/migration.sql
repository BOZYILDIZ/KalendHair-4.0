-- Sprint 5 : contrainte unique 1 salon par organisation (MVP).
-- CreateIndex
CREATE UNIQUE INDEX "salons_organizationId_key" ON "salons"("organizationId");
