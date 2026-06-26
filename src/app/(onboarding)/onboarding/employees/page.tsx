import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { EmployeesSetupForm } from "./components/employees-setup-form";

export type ServiceOption = {
  id: string;
  name: string;
  categoryName: string | null;
};

export type EmployeeInit = {
  key: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  color: string;
  isActive: boolean;
  serviceIds: string[];
};

export default async function EmployeesSetupPage() {
  const session = await requireSession();

  const salon = await prisma.salon.findUnique({
    where: { organizationId: session.organizationId },
    select: { id: true },
  });
  if (!salon) redirect("/dashboard");

  const [existingEmployees, availableServices] = await Promise.all([
    prisma.employee.findMany({
      where: { salonId: salon.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        color: true,
        isActive: true,
        employeeServices: { select: { serviceId: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.service.findMany({
      where: { salonId: salon.id, isActive: true },
      select: {
        id: true,
        name: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const serviceOptions: ServiceOption[] = availableServices.map((s) => ({
    id: s.id,
    name: s.name,
    categoryName: s.category?.name ?? null,
  }));

  const employeeInits: EmployeeInit[] = existingEmployees.map((e) => ({
    key: e.id,
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email ?? "",
    phone: e.phone ?? "",
    color: e.color ?? "",
    isActive: e.isActive,
    serviceIds: e.employeeServices.map((es) => es.serviceId),
  }));

  return (
    <div className="w-full max-w-2xl">
      {/* En-tête */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Étape 4 sur 6
        </p>
        <div className="mb-4 flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= 4 ? "bg-indigo-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Votre équipe
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Ajoutez les membres de votre équipe et les services qu&apos;ils réalisent.
          Vous pourrez les modifier à tout moment depuis le tableau de bord.
        </p>
      </div>

      {serviceOptions.length === 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Aucun service trouvé.{" "}
            <a
              href="/onboarding/services"
              className="font-medium underline underline-offset-2"
            >
              Créez d&apos;abord vos services
            </a>{" "}
            avant d&apos;ajouter des employés.
          </p>
        </div>
      )}

      <EmployeesSetupForm
        existingEmployees={employeeInits}
        serviceOptions={serviceOptions}
      />
    </div>
  );
}
