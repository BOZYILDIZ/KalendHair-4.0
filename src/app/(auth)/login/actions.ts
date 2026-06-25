"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateCredentials } from "@/features/auth/auth.service";
import { signToken } from "@/features/auth/session.utils";
import { checkRateLimit } from "@/lib/rate-limit/in-memory";
import { getClientIP } from "@/lib/rate-limit/get-ip";

export type LoginState = { error: string } | null;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await getClientIP();
  const rl = checkRateLimit("tenant-login", ip);
  if (rl.limited) {
    return {
      error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds} secondes.`,
    };
  }

  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const user = await validateCredentials(email, password);

  if (!user) {
    return { error: "Email ou mot de passe incorrect." };
  }

  const token = await signToken({
    id: user.id,
    organizationId: user.organizationId,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  redirect("/dashboard");
}
