import { redirect } from "next/navigation";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import { getAllOrganizations } from "@/features/admin/admin.service";
import { OrgTable } from "@/features/admin/components/org-table";

export default async function AdminOrganizationsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const orgs = await getAllOrganizations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
        <p className="text-sm text-gray-500">
          {orgs.length} organisation{orgs.length !== 1 ? "s" : ""} au total
        </p>
      </div>
      <OrgTable orgs={orgs} />
    </div>
  );
}
