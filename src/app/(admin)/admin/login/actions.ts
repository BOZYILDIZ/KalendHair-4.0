"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { setAdminSessionCookie } from "@/features/admin/admin-auth.service";
import { AdminLoginSchema } from "@/features/admin/admin.schema";
import { checkRateLimit } from "@/lib/rate-limit/in-memory";
import { getClientIP } from "@/lib/rate-limit/get-ip";
import type { AdminActionState } from "@/features/admin/types";

export async function adminLoginAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ip = await getClientIP();
  const rl = checkRateLimit("admin-login", ip);
  if (rl.limited) {
    return {
      error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds} secondes.`,
    };
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = AdminLoginSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Données invalides." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: result.data.email },
    select: { id: true, passwordHash: true, isActive: true },
  });

  if (!admin || !admin.isActive) {
    return { error: "Identifiants invalides." };
  }

  const valid = await bcrypt.compare(result.data.password, admin.passwordHash);
  if (!valid) {
    return { error: "Identifiants invalides." };
  }

  await setAdminSessionCookie(admin.id);
  redirect("/admin");
}
