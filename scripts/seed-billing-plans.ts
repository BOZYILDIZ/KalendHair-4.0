import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLANS = [
  {
    code: "ESSENTIAL",
    name: "Essential",
    description: "Pour les indépendants et petits salons",
    monthlyPriceCents: 2900,
    yearlyPriceCents: 29000,
    maxSalons: 1,
    maxEmployees: 2,
  },
  {
    code: "PRO",
    name: "Pro",
    description: "Pour les salons en croissance",
    monthlyPriceCents: 5900,
    yearlyPriceCents: 59000,
    maxSalons: 3,
    maxEmployees: 10,
  },
  {
    code: "BUSINESS",
    name: "Business",
    description: "Pour les groupes et franchises",
    monthlyPriceCents: 9900,
    yearlyPriceCents: 99000,
    maxSalons: null,
    maxEmployees: null,
  },
] as const;

async function main() {
  for (const plan of PLANS) {
    await prisma.billingPlan.upsert({
      where: { code: plan.code },
      update: {},
      create: plan,
    });
    console.log(`✅  BillingPlan ${plan.code} — OK`);
  }
  console.log("✅  seed-billing-plans terminé (3 plans, 0 donnée DEV)");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
