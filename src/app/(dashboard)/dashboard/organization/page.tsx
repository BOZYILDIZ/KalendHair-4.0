import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/permissions/organization.permissions";
import { getOrganization } from "@/features/organizations/organization.service";
import { OrganizationForm } from "@/features/organizations/components/organization-form";
import { updateOrganizationAction } from "./actions";

export default async function OrganizationPage() {
  const session = await requireSession();

  if (!canManageOrganization(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const organization = await getOrganization(session.organizationId);
  if (!organization) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">Mon Organisation</h1>
        <p className="text-sm text-gray-500">
          Informations générales de votre organisation.
        </p>
      </div>
      <OrganizationForm organization={organization} action={updateOrganizationAction} />
      <div className="pt-2">
        <a href="/dashboard" className="text-sm text-gray-500 hover:underline">
          ← Retour au tableau de bord
        </a>
      </div>
    </main>
  );
}
