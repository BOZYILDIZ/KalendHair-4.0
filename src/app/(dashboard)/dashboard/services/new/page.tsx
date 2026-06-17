import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { ServiceForm } from "@/features/services/components/service-form";
import { createServiceAction } from "./actions";

export default async function NewServicePage() {
  const session = await requireSession();

  const salon = await getSalon(session.organizationId);
  if (!salon) redirect("/dashboard/salon");

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">Nouveau service</h1>
        <p className="text-sm text-gray-500">{salon.name}</p>
      </div>

      <ServiceForm action={createServiceAction} />

      <Link
        href="/dashboard/services"
        className="block text-sm text-gray-400 hover:underline"
      >
        ← Retour aux services
      </Link>
    </main>
  );
}
