"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { getAdminSession } from "@/features/admin/admin-auth.service";
import { ChangeAdminPasswordSchema } from "@/features/admin/admin.schema";
import type { AdminActionState } from "@/features/admin/types";

const SALT_ROUNDS = 12;

export async function changeAdminPasswordAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Session expirée. Reconnectez-vous." };

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = ChangeAdminPasswordSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    select: { passwordHash: true },
  });

  if (!admin) return { error: "Compte introuvable." };

  const valid = await bcrypt.compare(
    result.data.currentPassword,
    admin.passwordHash,
  );
  if (!valid) return { error: "Mot de passe actuel incorrect." };

  if (result.data.newPassword === result.data.currentPassword) {
    return {
      error: "Le nouveau mot de passe doit être différent de l'actuel.",
    };
  }

  const newHash = await bcrypt.hash(result.data.newPassword, SALT_ROUNDS);

  await prisma.adminUser.update({
    where: { id: session.sub },
    data: { passwordHash: newHash },
  });

  return { success: "Mot de passe mis à jour avec succès." };
}
