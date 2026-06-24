import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

if (process.env.NODE_ENV === "production") {
  console.error("⛔  seed.ts ne doit pas être exécuté en production.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Test1234!", 12);

  const org = await prisma.organization.upsert({
    where: { slug: "salon-test" },
    update: {},
    create: { name: "Salon Test", slug: "salon-test" },
  });

  await prisma.proUser.upsert({
    where: { email: "owner@test.local" },
    update: {},
    create: {
      organizationId: org.id,
      email: "owner@test.local",
      passwordHash,
      firstName: "Test",
      lastName: "Owner",
      role: "OWNER",
    },
  });

  await prisma.salon.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      name: "Salon Test",
      slug: "salon-test",
      timezone: "Europe/Paris",
    },
  });

  // Plans de facturation — Sprint 18
  await prisma.billingPlan.upsert({
    where:  { code: "ESSENTIAL" },
    update: {},
    create: {
      code:              "ESSENTIAL",
      name:              "Essential",
      description:       "Pour les indépendants et petits salons",
      monthlyPriceCents: 2900,
      yearlyPriceCents:  29000,
      maxSalons:         1,
      maxEmployees:      2,
    },
  });

  await prisma.billingPlan.upsert({
    where:  { code: "PRO" },
    update: {},
    create: {
      code:              "PRO",
      name:              "Pro",
      description:       "Pour les salons en croissance",
      monthlyPriceCents: 5900,
      yearlyPriceCents:  59000,
      maxSalons:         3,
      maxEmployees:      10,
    },
  });

  await prisma.billingPlan.upsert({
    where:  { code: "BUSINESS" },
    update: {},
    create: {
      code:              "BUSINESS",
      name:              "Business",
      description:       "Pour les groupes et franchises",
      monthlyPriceCents: 9900,
      yearlyPriceCents:  99000,
      maxSalons:         null,
      maxEmployees:      null,
    },
  });

  // Super Admin DEV — Sprint 19
  const adminPasswordHash = await bcrypt.hash("AdminDev123!", 12);
  await prisma.adminUser.upsert({
    where:  { email: "admin@kalend.dev" },
    update: {},
    create: {
      email:        "admin@kalend.dev",
      passwordHash: adminPasswordHash,
      name:         "Super Admin Dev",
    },
  });

  console.log("✅  Seed terminé : owner@test.local / Test1234! | admin@kalend.dev / AdminDev123!");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
