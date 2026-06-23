import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManageClient } from "@/lib/permissions/client.permissions";
import { getClients } from "@/features/clients/client.service";
import { ClientList } from "@/features/clients/components/client-list";
import { ClientSearch } from "@/features/clients/components/client-search";

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function ClientsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManageClient(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const search = sp.q?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = await getClients(salon.id, session.organizationId, { search, page });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">{data.total} client{data.total > 1 ? "s" : ""} enregistrés</p>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Tableau de bord
        </Link>
      </div>

      <div className="mb-4">
        <ClientSearch initialValue={search} />
      </div>

      <ClientList data={data} search={search || undefined} />
    </div>
  );
}
