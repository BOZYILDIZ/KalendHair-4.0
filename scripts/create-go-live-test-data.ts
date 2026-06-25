/**
 * Script de création des données de test Go Live Readiness.
 * Données réalistes identifiables par le slug "salon-beaute-test".
 * Suppression facile : DELETE FROM organizations WHERE slug = 'salon-beaute-test';
 *
 * Exécution :
 *   DATABASE_URL=$(neonctl cs --project-id round-dawn-81306391 --role-name neondb_owner --database-name neondb --pooled) \
 *   npx tsx scripts/create-go-live-test-data.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🏗️  Création des données de test Go Live Readiness…");

  // ─── Organisation ────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where:  { slug: "salon-beaute-test" },
    update: {},
    create: { name: "Salon Beauté Parisienne", slug: "salon-beaute-test" },
  });
  console.log(`  ✔ Organisation : ${org.id}`);

  // ─── Owner ProUser ───────────────────────────────────────────────────────
  const ownerHash = await bcrypt.hash("GoLive2026!Test", 12);
  const owner = await prisma.proUser.upsert({
    where:  { email: "marie.dupont@test.kalendhair.fr" },
    update: {},
    create: {
      organizationId: org.id,
      email:          "marie.dupont@test.kalendhair.fr",
      passwordHash:   ownerHash,
      firstName:      "Marie",
      lastName:       "Dupont",
      role:           "OWNER",
    },
  });
  console.log(`  ✔ Owner ProUser : ${owner.id}`);

  // ─── Salon ───────────────────────────────────────────────────────────────
  const existingSalon = await prisma.salon.findUnique({
    where: { organizationId: org.id },
  });
  const salon = existingSalon ?? await prisma.salon.create({
    data: {
      organizationId: org.id,
      name:           "Salon Beauté Parisienne",
      slug:           "salon-beaute-test",
      description:    "Salon de coiffure au cœur de Paris",
      address:        "12 Rue de la Paix",
      city:           "Paris",
      phone:          "01 42 60 30 00",
      timezone:       "Europe/Paris",
    },
  });
  console.log(`  ✔ Salon : ${salon.id} (slug: ${salon.slug})`);

  // ─── Horaires salon (lun-sam) ─────────────────────────────────────────────
  // SalonSchedule n'a pas de @@unique([salonId, dayOfWeek]) — on vérifie avant create
  const salonSchedules = [
    { dayOfWeek: "MONDAY",    isOpen: true,  startMinute: 540, endMinute: 1080 },
    { dayOfWeek: "TUESDAY",   isOpen: true,  startMinute: 540, endMinute: 1080 },
    { dayOfWeek: "WEDNESDAY", isOpen: true,  startMinute: 540, endMinute: 1080 },
    { dayOfWeek: "THURSDAY",  isOpen: true,  startMinute: 540, endMinute: 1080 },
    { dayOfWeek: "FRIDAY",    isOpen: true,  startMinute: 540, endMinute: 1080 },
    { dayOfWeek: "SATURDAY",  isOpen: true,  startMinute: 540, endMinute: 1020 },
    { dayOfWeek: "SUNDAY",    isOpen: false, startMinute: 540, endMinute: 1080 },
  ] as const;

  // Supprimer les anciens si ils existent (idempotence)
  await prisma.salonSchedule.deleteMany({ where: { salonId: salon.id } });
  await prisma.salonSchedule.createMany({
    data: salonSchedules.map((s) => ({
      salonId:     salon.id,
      dayOfWeek:   s.dayOfWeek,
      isOpen:      s.isOpen,
      startMinute: s.startMinute,
      endMinute:   s.endMinute,
    })),
  });
  console.log("  ✔ Horaires salon (lun-sam)");

  // ─── Services ─────────────────────────────────────────────────────────────
  const servicesDef = [
    { name: "Coupe femme",          durationMinutes: 60,  priceCents: 4500  },
    { name: "Coupe homme",          durationMinutes: 30,  priceCents: 2500  },
    { name: "Coloration complète",  durationMinutes: 120, priceCents: 8500  },
    { name: "Balayage",             durationMinutes: 90,  priceCents: 7000  },
    { name: "Brushing",             durationMinutes: 45,  priceCents: 3500  },
    { name: "Soin kératine",        durationMinutes: 90,  priceCents: 6000  },
  ];

  const services = [];
  for (const s of servicesDef) {
    const existing = await prisma.service.findFirst({
      where: { salonId: salon.id, organizationId: org.id, name: s.name },
    });
    const svc = existing ?? await prisma.service.create({
      data: {
        salonId:         salon.id,
        organizationId:  org.id,
        name:            s.name,
        durationMinutes: s.durationMinutes,
        priceCents:      s.priceCents,
      },
    });
    services.push(svc);
  }
  console.log(`  ✔ Services : ${services.length} créés`);

  // ─── Employés ─────────────────────────────────────────────────────────────
  const employeesDef = [
    { firstName: "Sophie", lastName: "Martin", email: "sophie.martin@test.kalendhair.fr", color: "#4F46E5" },
    { firstName: "Lucas",  lastName: "Bernard", email: "lucas.bernard@test.kalendhair.fr",  color: "#059669" },
  ];

  const employees = [];
  for (const e of employeesDef) {
    const existing = await prisma.employee.findFirst({
      where: { salonId: salon.id, organizationId: org.id, email: e.email },
    });
    const emp = existing ?? await prisma.employee.create({
      data: {
        salonId:        salon.id,
        organizationId: org.id,
        firstName:      e.firstName,
        lastName:       e.lastName,
        email:          e.email,
        color:          e.color,
      },
    });
    employees.push(emp);
  }
  console.log(`  ✔ Employés : ${employees.length} créés`);

  // ─── Horaires employés ─────────────────────────────────────────────────────
  // EmployeeSchedule n'a pas de @@unique([employeeId, dayOfWeek]) — on supprime avant create
  for (const emp of employees) {
    await prisma.employeeSchedule.deleteMany({ where: { employeeId: emp.id } });
    const allDays = [
      { dayOfWeek: "MONDAY",    isWorking: true,  startMinute: 540, endMinute: 1080 },
      { dayOfWeek: "TUESDAY",   isWorking: true,  startMinute: 540, endMinute: 1080 },
      { dayOfWeek: "WEDNESDAY", isWorking: true,  startMinute: 540, endMinute: 1080 },
      { dayOfWeek: "THURSDAY",  isWorking: true,  startMinute: 540, endMinute: 1080 },
      { dayOfWeek: "FRIDAY",    isWorking: true,  startMinute: 540, endMinute: 1080 },
      { dayOfWeek: "SATURDAY",  isWorking: true,  startMinute: 540, endMinute: 1020 },
      { dayOfWeek: "SUNDAY",    isWorking: false, startMinute: 540, endMinute: 1080 },
    ] as const;
    await prisma.employeeSchedule.createMany({
      data: allDays.map((d) => ({ employeeId: emp.id, ...d })),
    });
  }
  console.log("  ✔ Horaires employés");

  // ─── EmployeeService (tous les employés → tous les services) ─────────────
  for (const emp of employees) {
    for (const svc of services) {
      await prisma.employeeService.upsert({
        where:  { employeeId_serviceId: { employeeId: emp.id, serviceId: svc.id } },
        update: {},
        create: { employeeId: emp.id, serviceId: svc.id },
      });
    }
  }
  console.log("  ✔ Associations employé–service");

  // ─── Catégories de produits ───────────────────────────────────────────────
  const categoriesDef = [
    "Soins capillaires",
    "Colorations",
    "Styling",
    "Équipement",
  ];
  const categories = [];
  for (const name of categoriesDef) {
    const existing = await prisma.productCategory.findFirst({
      where: { salonId: salon.id, name },
    });
    const cat = existing ?? await prisma.productCategory.create({
      data: { salonId: salon.id, organizationId: org.id, name },
    });
    categories.push(cat);
  }
  console.log(`  ✔ Catégories : ${categories.length}`);

  // ─── Produits ─────────────────────────────────────────────────────────────
  // Product n'a pas de champ sku — on identifie par name + salonId
  const productsDef = [
    { name: "Shampoing Repair",      categoryIdx: 0, priceCents: 1500, lowStockThreshold: 5 },
    { name: "Masque Hydratant",      categoryIdx: 0, priceCents: 2200, lowStockThreshold: 3 },
    { name: "Coloration Châtain",    categoryIdx: 1, priceCents: 850,  lowStockThreshold: 10 },
    { name: "Laque Fixante",         categoryIdx: 2, priceCents: 1200, lowStockThreshold: 8 },
    { name: "Ciseaux Professionnel", categoryIdx: 3, priceCents: 8500, lowStockThreshold: 1 },
  ];
  const products = [];
  for (const p of productsDef) {
    const cat = categories[p.categoryIdx];
    if (!cat) continue;
    const existing = await prisma.product.findFirst({
      where: { salonId: salon.id, name: p.name },
    });
    const prod = existing ?? await prisma.product.create({
      data: {
        salonId:           salon.id,
        organizationId:    org.id,
        categoryId:        cat.id,
        name:              p.name,
        priceCents:        p.priceCents,
        lowStockThreshold: p.lowStockThreshold,
      },
    });
    products.push(prod);
    // Entrée stock initiale
    const stock = await prisma.productStock.findUnique({ where: { productId: prod.id } });
    if (!stock) {
      await prisma.productStock.create({
        data: { productId: prod.id, salonId: salon.id, quantity: 20 },
      });
      await prisma.stockMovement.create({
        data: {
          salonId:           salon.id,
          organizationId:    org.id,
          productId:         prod.id,
          type:              "ENTRY" as never,
          quantityDelta:     20,
          quantityBefore:    0,
          quantityAfter:     20,
          notes:             "Stock initial test Go Live",
        },
      });
    }
  }
  console.log(`  ✔ Produits : ${products.length}`);

  // ─── Fournisseurs ─────────────────────────────────────────────────────────
  const suppliersDef = [
    { name: "Wella Professional",   contactName: "Jean Moreau",   email: "contact@wella-test.fr",       phone: "01 44 00 12 34" },
    { name: "L'Oréal Professionnel",contactName: "Claire Leroy",  email: "pro@loreal-test.fr",          phone: "01 47 56 78 90" },
    { name: "Kerastase Paris",      contactName: "Paul Roux",     email: "orders@kerastase-test.fr",    phone: "01 58 00 20 40" },
  ];
  for (const s of suppliersDef) {
    const existing = await prisma.supplier.findFirst({
      where: { salonId: salon.id, name: s.name },
    });
    if (!existing) {
      await prisma.supplier.create({
        data: {
          salonId:        salon.id,
          organizationId: org.id,
          name:           s.name,
          contactName:    s.contactName,
          email:          s.email,
          phone:          s.phone,
        },
      });
    }
  }
  console.log("  ✔ Fournisseurs : 3");

  // ─── Règle de commission ─────────────────────────────────────────────────
  // CommissionRule n'a pas de champ name — on vérifie par type + value
  const existingRule = await prisma.commissionRule.findFirst({
    where: { salonId: salon.id, isActive: true },
  });
  if (!existingRule) {
    await prisma.commissionRule.create({
      data: {
        salonId:           salon.id,
        organizationId:    org.id,
        type:              "PERCENTAGE",
        value:             20,
        createdByProUserId: owner.id,
      },
    });
  }
  console.log("  ✔ Règle commission (20% services)");

  // ─── Abonnement PRO (sans Stripe) ─────────────────────────────────────────
  const plan = await prisma.billingPlan.findUnique({ where: { code: "PRO" } });
  if (plan) {
    const now = new Date();
    const end = new Date(now); end.setMonth(end.getMonth() + 1);
    await prisma.organizationSubscription.upsert({
      where:  { organizationId: org.id },
      update: {},
      create: {
        organizationId:     org.id,
        planId:             plan.id,
        billingCycle:       "MONTHLY",
        status:             "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd:   end,
      },
    });
    console.log("  ✔ Abonnement PRO actif");
  }

  console.log("\n✅ Données de test créées avec succès !");
  console.log("\n📋 Récapitulatif :");
  console.log(`   Organisation : Salon Beauté Parisienne (slug: salon-beaute-test)`);
  console.log(`   Owner login  : marie.dupont@test.kalendhair.fr`);
  console.log(`   Booking URL  : https://pro.kalendhair.fr/book/salon-beaute-test`);
  console.log(`   Dashboard    : https://pro.kalendhair.fr/login`);
  console.log(`\n   Suppression rapide :`);
  console.log(`   DELETE FROM organizations WHERE slug = 'salon-beaute-test';`);
}

main()
  .catch((e) => { console.error("❌ Erreur :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
