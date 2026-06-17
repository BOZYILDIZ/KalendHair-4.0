import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { getService } from "@/features/services/service.service";
import { ServiceForm } from "@/features/services/components/service-form";
import {
  updateServiceAction,
  deactivateServiceAction,
  reactivateServiceAction,
} from "./actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ServicePage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  const salon = await getSalon(session.organizationId);
  if (!salon) redirect("/dashboard/salon");

  const service = await getService(id, session.organizationId);
  if (!service) redirect("/dashboard/services");

  const boundUpdateAction = async (
    prevState: Awaited<ReturnType<typeof updateServiceAction>>,
    formData: FormData,
  ) => {
    "use server";
    formData.append("serviceId", id);
    return updateServiceAction(prevState, formData);
  };

  const boundDeactivateAction = async (formData: FormData) => {
    "use server";
    formData.append("serviceId", id);
    await deactivateServiceAction(null, formData);
  };

  const boundReactivateAction = async (formData: FormData) => {
    "use server";
    formData.append("serviceId", id);
    await reactivateServiceAction(null, formData);
  };

  return (
    <main className="mx-auto max-w-lg space-y-8 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">{service.name}</h1>
        <p className="text-sm text-gray-500">
          {service.isActive ? (
            <span className="text-green-600">Actif</span>
          ) : (
            <span className="text-gray-400">Inactif</span>
          )}
        </p>
      </div>

      {/* Section 1 : Informations */}
      <section className="space-y-4">
        <h2 className="border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Informations
        </h2>
        <ServiceForm service={service} action={boundUpdateAction} />
      </section>

      {/* Section 2 : Statut */}
      <section className="space-y-4">
        <h2 className="border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Statut
        </h2>
        {service.isActive ? (
          <form action={boundDeactivateAction}>
            <button
              type="submit"
              className="rounded border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Désactiver ce service
            </button>
          </form>
        ) : (
          <form action={boundReactivateAction}>
            <button
              type="submit"
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Réactiver ce service
            </button>
          </form>
        )}
      </section>

      <Link
        href="/dashboard/services"
        className="block text-sm text-gray-400 hover:underline"
      >
        ← Retour aux services
      </Link>
    </main>
  );
}
