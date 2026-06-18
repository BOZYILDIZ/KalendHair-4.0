-- CreateIndex
CREATE INDEX "appointments_employeeId_startAt_endAt_idx" ON "appointments"("employeeId", "startAt", "endAt");
