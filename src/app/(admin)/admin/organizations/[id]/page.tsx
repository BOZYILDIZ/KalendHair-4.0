import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import { getOrganizationById, getAdminAuditLogs } from "@/features/admin/admin.service";
import { OrgStatusBadge } from "@/features/admin/components/org-status-badge";
import { SubscriptionAdminBadge } from "@/features/admin/components/subscription-admin-badge";
import { AdminAuditTable } from "@/features/admin/components/admin-audit-table";
import { SuspendForm } from "@/features/admin/components/suspend-form";
import { ReactivateForm } from "@/features/admin/components/reactivate-form";
import { AddNoteForm } from "@/features/admin/components/add-note-form";
import { NoteItem } from "@/features/admin/components/note-item";
import {
  suspendOrganizationAction,
  reactivateOrganizationAction,
  addNoteAction,
  updateNoteAction,
  deleteNoteAction,
  startImpersonationAction,
} from "./actions";

export default async function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [org, auditLogs] = await Promise.all([
    getOrganizationById(id),
    getAdminAuditLogs(id, 20),
  ]);

  if (!org) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            <OrgStatusBadge isActive={org.isActive} />
          </div>
          <p className="text-sm text-gray-500">slug: {org.slug}</p>
        </div>
        <Link
          href="/admin/organizations"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour
        </Link>
      </div>

      {/* Informations générales */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Informations générales</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Owner</dt>
            <dd className="font-medium">{org.ownerEmail ?? "–"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Créé le</dt>
            <dd className="font-medium">
              {org.createdAt.toLocaleDateString("fr-FR")}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Salons</dt>
            <dd className="font-medium">{org.salonCount}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Employés</dt>
            <dd className="font-medium">{org.employeeCount}</dd>
          </div>
        </dl>
      </section>

      {/* Abonnement */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Abonnement</h2>
          <Link
            href={`/admin/organizations/${id}/billing`}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            Gérer
          </Link>
        </div>
        {org.subscription ? (
          <div className="space-y-2 text-sm">
            <SubscriptionAdminBadge
              planCode={org.subscription.planCode}
              status={org.subscription.status}
              isFree={org.subscription.isFree}
            />
            <p className="text-gray-500">
              Cycle :{" "}
              <span className="font-medium">
                {org.subscription.billingCycle === "MONTHLY" ? "Mensuel" : "Annuel"}
              </span>
            </p>
            <p className="text-gray-500">
              Fin de période :{" "}
              <span className="font-medium">
                {org.subscription.currentPeriodEnd.toLocaleDateString("fr-FR")}
              </span>
            </p>
            {org.subscription.isFree && (
              <p className="text-green-700">
                Plan gratuit — {org.subscription.freeReason}
              </p>
            )}
            {org.subscription.activeDiscount && (
              <p className="text-orange-700">
                Remise active :{" "}
                {org.subscription.activeDiscount.type === "PERCENT"
                  ? `${org.subscription.activeDiscount.value}%`
                  : `${(org.subscription.activeDiscount.value / 100).toFixed(2)} €`}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Aucun abonnement.</p>
        )}
      </section>

      {/* Suspension / Réactivation */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Statut organisation</h2>
        {org.isActive ? (
          <SuspendForm orgId={id} action={suspendOrganizationAction} />
        ) : (
          <div className="space-y-4">
            <div className="rounded bg-red-50 p-3 text-sm text-red-700">
              <p>
                <strong>Suspendue le :</strong>{" "}
                {org.suspendedAt?.toLocaleDateString("fr-FR") ?? "–"}
              </p>
              <p>
                <strong>Raison :</strong> {org.suspensionReason}
              </p>
            </div>
            <ReactivateForm orgId={id} action={reactivateOrganizationAction} />
          </div>
        )}
      </section>

      {/* Impersonation */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Impersonation</h2>
        <p className="mb-3 text-sm text-gray-500">
          Ouvrir une session temporaire en tant que ce salon (auditée).
        </p>
        <form action={startImpersonationAction}>
          <input type="hidden" name="orgId" value={id} />
          <button
            type="submit"
            className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            Se connecter comme ce salon
          </button>
        </form>
      </section>

      {/* Notes internes */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Notes internes</h2>
        <div className="mb-4 space-y-3">
          {org.notes.length === 0 && (
            <p className="text-sm text-gray-400">Aucune note.</p>
          )}
          {org.notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              orgId={id}
              updateAction={updateNoteAction}
              deleteAction={deleteNoteAction}
            />
          ))}
        </div>
        <AddNoteForm orgId={id} action={addNoteAction} />
      </section>

      {/* Piste d'audit */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Piste d&#39;audit</h2>
        <AdminAuditTable logs={auditLogs} />
      </section>
    </div>
  );
}
