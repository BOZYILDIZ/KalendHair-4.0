import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { ServicesSetupForm } from "./components/services-setup-form";

export type CategoryInit = { key: string; name: string };
export type ServiceInit = {
  key: string;
  name: string;
  categoryKey: string;
  durationMinutes: number;
  priceEuros: number;
  color: string;
  description: string;
  isActive: boolean;
};

export default async function ServicesSetupPage() {
  const session = await requireSession();

  const salon = await prisma.salon.findUnique({
    where: { organizationId: session.organizationId },
    select: { id: true },
  });
  if (!salon) redirect("/dashboard");

  const [existingCategories, existingServices] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: { salonId: salon.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.service.findMany({
      where: { salonId: salon.id },
      select: {
        id: true,
        name: true,
        categoryId: true,
        durationMinutes: true,
        priceCents: true,
        color: true,
        description: true,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const categoryInits: CategoryInit[] = existingCategories.map((c) => ({
    key: c.id,
    name: c.name,
  }));

  const serviceInits: ServiceInit[] = existingServices.map((s) => ({
    key: s.id,
    name: s.name,
    categoryKey: s.categoryId ?? "",
    durationMinutes: s.durationMinutes,
    priceEuros: s.priceCents / 100,
    color: s.color ?? "",
    description: s.description ?? "",
    isActive: s.isActive,
  }));

  return (
    <div className="w-full max-w-2xl">
      {/* En-tête */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Étape 3 sur 6
        </p>
        <div className="mb-4 flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= 3 ? "bg-indigo-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Services de votre salon
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Ajoutez les services que vous proposez. Vous pourrez les modifier à
          tout moment depuis votre tableau de bord.
        </p>
      </div>

      <ServicesSetupForm
        existingCategories={categoryInits}
        existingServices={serviceInits}
      />
    </div>
  );
}
