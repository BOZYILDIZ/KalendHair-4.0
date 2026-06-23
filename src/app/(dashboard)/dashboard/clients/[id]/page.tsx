import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageClient } from "@/lib/permissions/client.permissions";
import {
  getClient,
  getClientStats,
  getClientAppointments,
} from "@/features/clients/client.service";
import { ClientStatsCard } from "@/features/clients/components/client-stats-card";
import { ClientAppointmentHistory } from "@/features/clients/components/client-appointment-history";
import { ClientNotesForm } from "@/features/clients/components/client-notes-form";
import { updateNotesAction } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function ClientDetailPage({ params, searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageClient(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const { id: clientId } = await params;
  const sp = await searchParams;
  const historyPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const timezone = salon.timezone ?? "Europe/Paris";

  const [client, stats, history] = await Promise.all([
    getClient(clientId, salon.id, session.organizationId),
    getClientStats(clientId, salon.id, timezone),
    getClientAppointments(clientId, salon.id, timezone, { page: historyPage }),
  ]);

  if (!client) notFound();

  const memberDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(client.memberSince));

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {client.firstName} {client.lastName}
          </h1>
          <p className="text-sm text-gray-500">
            Client depuis le {memberDate}
            {!client.isActive && (
              <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                Inactif
              </span>
            )}
          </p>
        </div>
        <Link href="/dashboard/clients" className="text-sm text-gray-500 hover:text-gray-700">
          ← Liste des clients
        </Link>
      </div>

      {/* Identité */}
      <section className="rounded-lg border border-gray-200 bg-white px-5 py-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Coordonnées</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-400">Email</dt>
            <dd className="text-gray-900">{client.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Téléphone</dt>
            <dd className="text-gray-900">{client.phone ?? "—"}</dd>
          </div>
        </dl>
      </section>

      {/* Stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Statistiques</h2>
        <ClientStatsCard stats={stats} />
      </section>

      {/* Historique RDV */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <h2 className="border-b border-gray-100 px-5 py-3 text-sm font-semibold text-gray-700">
          Historique rendez-vous
        </h2>
        <ClientAppointmentHistory data={history} clientId={clientId} />
      </section>

      {/* Notes internes */}
      <section className="rounded-lg border border-gray-200 bg-white px-5 py-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Notes internes</h2>
        <ClientNotesForm
          clientId={clientId}
          initialNotes={client.notes}
          action={updateNotesAction}
        />
      </section>
    </div>
  );
}
