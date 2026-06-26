-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_categories_salonId_idx" ON "service_categories"("salonId");

-- AddForeignKey
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_salonId_fkey"
    FOREIGN KEY ("salonId") REFERENCES "salons"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "services" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "services" ADD COLUMN "color" TEXT;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
