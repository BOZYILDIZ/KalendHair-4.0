import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canManageSalon } from "@/lib/permissions/salon.permissions";
import { getSalon } from "@/features/salons/salon.service";
import { SalonForm } from "@/features/salons/components/salon-form";
import { updateSalonAction } from "./actions";

export default async function SalonPage() {
  const session = await requireSession();

  if (!canManageSalon(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const salon = await getSalon(session.organizationId);

  if (!salon) {
    return (
      <main className="mx-auto max-w-lg space-y-6 px-4 py-10">
        <div>
          <h1 className="text-xl font-semibold">Mon Salon</h1>
        </div>
        <p className="rounded border px-4 py-3 text-sm text-gray-600">
          Aucun salon configuré pour cette organisation.
        </p>
        <a href="/dashboard" className="text-sm text-gray-500 hover:underline">
          ← Retour au tableau de bord
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">Mon Salon</h1>
        <p className="text-sm text-gray-500">
          Informations et coordonnées de votre salon.
        </p>
      </div>
      <SalonForm salon={salon} action={updateSalonAction} />
      <div className="pt-2">
        <a href="/dashboard" className="text-sm text-gray-500 hover:underline">
          ← Retour au tableau de bord
        </a>
      </div>
    </main>
  );
}
