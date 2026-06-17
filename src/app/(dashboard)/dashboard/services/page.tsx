import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { getServices } from "@/features/services/service.service";
import { ServiceList } from "@/features/services/components/service-list";

export default async function ServicesPage() {
  const session = await requireSession();

  const salon = await getSalon(session.organizationId);
  if (!salon) redirect("/dashboard/salon");

  const services = await getServices(salon.id, session.organizationId);

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Services</h1>
          <p className="text-sm text-gray-500">{salon.name}</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="rounded bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Ajouter
        </Link>
      </div>

      <ServiceList services={services} />

      <a href="/dashboard" className="block text-sm text-gray-400 hover:underline">
        ← Retour au tableau de bord
      </a>
    </main>
  );
}
