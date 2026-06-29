import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { FinalisationForm } from "./components/finalisation-form";

// ── Types exportés (utilisés par le form client) ──────────────────────────────

export type CheckStatus = "PASS" | "WARN" | "BLOCKING";

export type CheckItem = {
  id: string;
  label: string;
  status: CheckStatus;
  link?: string;
  detail?: string;
};

export type SalonSummary = {
  salonName: string;
  city: string | null;
  planCode: string;
  servicesCount: number;
  employeesCount: number;
  openDaysCount: number;
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function FinalisationPage() {
  const session = await requireSession();

  // ── Chargement en une passe ───────────────────────────────────────────────
  const salon = await prisma.salon.findUnique({
    where: { organizationId: session.organizationId },
    select: {
      id: true,
      name: true,
      city: true,
      phone: true,
      address: true,
      postalCode: true,
      services: {
        where: { isActive: true },
        select: { id: true },
      },
      employees: {
        select: {
          id: true,
          employeeServices: { select: { serviceId: true } },
        },
      },
      salonSchedules: {
        select: { id: true, isOpen: true },
      },
    },
  });

  if (!salon) redirect("/dashboard");

  const orgSubscription = await prisma.organizationSubscription.findUnique({
    where: { organizationId: session.organizationId },
    select: {
      status: true,
      plan: { select: { code: true } },
    },
  });

  // ── Métriques ─────────────────────────────────────────────────────────────
  const servicesCount = salon.services.length;
  const employeesCount = salon.employees.length;
  const openDaysCount = salon.salonSchedules.filter((s) => s.isOpen).length;
  const totalSchedules = salon.salonSchedules.length;
  const employeesWithoutService = salon.employees.filter(
    (e) => e.employeeServices.length === 0,
  );

  const salonInfoComplete = Boolean(
    salon.name && salon.city && salon.postalCode,
  );
  const salonInfoFull = Boolean(
    salon.name && salon.city && salon.postalCode && salon.phone && salon.address,
  );

  // ── Construction de la checklist ──────────────────────────────────────────
  const items: CheckItem[] = [
    {
      id: "org",
      label: "Organisation créée",
      status: "PASS",
    },
    {
      id: "salon",
      label: "Salon créé",
      status: "PASS",
    },
    {
      id: "salon-info",
      label: "Informations salon complétées",
      status: salonInfoFull ? "PASS" : salonInfoComplete ? "WARN" : "BLOCKING",
      link: "/onboarding/salon",
      detail: salonInfoFull
        ? undefined
        : salonInfoComplete
          ? "Téléphone ou adresse manquant — recommandé pour la prise de rendez-vous."
          : "Nom, ville et code postal requis.",
    },
    {
      id: "subscription",
      label: "Abonnement initial créé",
      status: orgSubscription ? "PASS" : "WARN",
      detail: orgSubscription
        ? undefined
        : "Abonnement non trouvé — contactez le support si le problème persiste.",
    },
    {
      id: "schedules",
      label: "Horaires d'ouverture configurés",
      status:
        openDaysCount > 0 ? "PASS" : totalSchedules > 0 ? "WARN" : "BLOCKING",
      link: "/onboarding/schedule",
      detail:
        openDaysCount > 0
          ? `${openDaysCount} jour${openDaysCount > 1 ? "s" : ""} ouvert${openDaysCount > 1 ? "s" : ""}`
          : totalSchedules > 0
            ? "Tous les jours sont marqués fermés."
            : "Aucun horaire configuré.",
    },
    {
      id: "services",
      label: "Au moins un service créé",
      status: servicesCount > 0 ? "PASS" : "BLOCKING",
      link: "/onboarding/services",
      detail:
        servicesCount > 0
          ? `${servicesCount} service${servicesCount > 1 ? "s" : ""} actif${servicesCount > 1 ? "s" : ""}`
          : "Ajoutez au moins un service pour activer la prise de rendez-vous.",
    },
    {
      id: "employees",
      label: "Au moins un employé créé",
      status: employeesCount > 0 ? "PASS" : "BLOCKING",
      link: "/onboarding/employees",
      detail:
        employeesCount > 0
          ? `${employeesCount} employé${employeesCount > 1 ? "s" : ""}`
          : "Ajoutez au moins un employé.",
    },
    {
      id: "employee-services",
      label: "Chaque employé a au moins un service",
      status: employeesWithoutService.length === 0 ? "PASS" : "BLOCKING",
      link: "/onboarding/employees",
      detail:
        employeesWithoutService.length === 0
          ? undefined
          : `${employeesWithoutService.length} employé${employeesWithoutService.length > 1 ? "s" : ""} sans service.`,
    },
  ];

  const hasBlocking = items.some((i) => i.status === "BLOCKING");

  const summary: SalonSummary = {
    salonName: salon.name,
    city: salon.city,
    planCode: orgSubscription?.plan?.code ?? "—",
    servicesCount,
    employeesCount,
    openDaysCount,
  };

  return (
    <div className="w-full max-w-2xl">
      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Étape 6 sur 6
        </p>
        <div className="mb-4 flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className="h-1 flex-1 rounded-full bg-indigo-500"
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Votre salon est presque prêt
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Vérifiez que tout est configuré correctement avant d&apos;accéder à
          votre tableau de bord.
        </p>
      </div>

      <FinalisationForm
        items={items}
        summary={summary}
        hasBlocking={hasBlocking}
      />
    </div>
  );
}
