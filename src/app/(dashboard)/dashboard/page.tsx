import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { getOrganization } from "@/features/organizations/organization.service";
import { getSalon } from "@/features/salons/salon.service";

export default async function DashboardPage() {
  const session = await requireSession();
  const [organization, salon] = await Promise.all([
    getOrganization(session.organizationId),
    getSalon(session.organizationId),
  ]);

  return (
    <main className="mx-auto max-w-lg space-y-8 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-gray-500">
          {organization?.name ?? "—"}
          {salon ? ` · ${salon.name}` : ""}
        </p>
      </div>

      <nav className="space-y-2">
        <Link
          href="/dashboard/organization"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Mon Organisation</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/salon"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Mon Salon</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/employees"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Employés</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/services"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Services</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/salon/schedule"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Horaires du salon</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/closed-days"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Jours de fermeture</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/appointments"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Rendez-vous</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/agenda"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Agenda</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/clients"
          className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span className="font-medium">Clients</span>
          <span className="text-gray-400">→</span>
        </Link>
      </nav>

      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Se déconnecter
        </button>
      </form>
    </main>
  );
}
