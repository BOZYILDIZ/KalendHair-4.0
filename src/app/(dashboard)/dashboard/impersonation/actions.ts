"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import { endImpersonation } from "@/features/admin/admin.service";

export async function endImpersonationAction(
  formData: FormData,
): Promise<void> {
  const adminSession = await getAdminSession();
  const orgId = formData.get("orgId") as string;
  const impersonationLogId = formData.get("impersonationLogId") as string;

  if (adminSession && orgId && impersonationLogId) {
    await endImpersonation(adminSession.sub, orgId, impersonationLogId);
  }

  // Supprimer la session tenant et les cookies d'impersonation
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("impersonation_log_id");
  cookieStore.delete("impersonation_org_id");

  redirect("/admin/organizations");
}
