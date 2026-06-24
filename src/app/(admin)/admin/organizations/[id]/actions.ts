"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import {
  suspendOrganization,
  reactivateOrganization,
  addOrganizationNote,
  startImpersonation,
} from "@/features/admin/admin.service";
import {
  SuspendSchema,
  ReactivateSchema,
  AddNoteSchema,
} from "@/features/admin/admin.schema";
import { signToken } from "@/features/auth/session.utils";
import { prisma } from "@/lib/db/prisma";
import type { AdminActionState } from "@/features/admin/types";

export async function suspendOrganizationAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Non authentifié." };

  const orgId = formData.get("orgId") as string;
  if (!orgId) return { error: "ID organisation manquant." };

  const result = SuspendSchema.safeParse({ reason: formData.get("reason") });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await suspendOrganization(session.sub, orgId, result.data.reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/admin/organizations/${orgId}`);
}

export async function reactivateOrganizationAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Non authentifié." };

  const orgId = formData.get("orgId") as string;
  if (!orgId) return { error: "ID organisation manquant." };

  const result = ReactivateSchema.safeParse({ reason: formData.get("reason") });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await reactivateOrganization(session.sub, orgId, result.data.reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/admin/organizations/${orgId}`);
}

export async function addNoteAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Non authentifié." };

  const orgId = formData.get("orgId") as string;
  if (!orgId) return { error: "ID organisation manquant." };

  const result = AddNoteSchema.safeParse({ content: formData.get("content") });
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Données invalides." };

  try {
    await addOrganizationNote(session.sub, orgId, result.data.content);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue." };
  }

  redirect(`/admin/organizations/${orgId}`);
}

export async function startImpersonationAction(
  formData: FormData,
): Promise<void> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const orgId = formData.get("orgId") as string;
  if (!orgId) redirect("/admin/organizations");

  const impersonationLogId = await startImpersonation(session.sub, orgId);

  // Créer une session tenant temporaire pour l'OWNER de l'organisation
  const owner = await prisma.proUser.findFirst({
    where: { organizationId: orgId, role: "OWNER" },
    select: { id: true, organizationId: true, role: true },
  });

  if (!owner) redirect(`/admin/organizations/${orgId}`);

  const impersonateToken = await signToken({
    id: owner.id,
    organizationId: owner.organizationId,
    role: owner.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", impersonateToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  // Stocker l'ID du log d'impersonation pour l'afficher dans la bannière
  cookieStore.set("impersonation_log_id", impersonationLogId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  cookieStore.set("impersonation_org_id", orgId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  redirect("/dashboard");
}
