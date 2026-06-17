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

  console.log("✅  Seed terminé : owner@test.local / Test1234!");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
