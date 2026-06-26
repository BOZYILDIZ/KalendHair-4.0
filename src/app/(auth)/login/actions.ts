"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateCredentials } from "@/features/auth/auth.service";
import { signToken } from "@/features/auth/session.utils";
import { signPendingToken, PENDING_SESSION_COOKIE } from "@/lib/auth/pending-session";
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

  const cookieStore = await cookies();

  // Compte sans organisation : l'onboarding n'est pas terminé
  if (!user.organizationId) {
    const token = await signPendingToken(user.id);
    cookieStore.set(PENDING_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });
    redirect("/onboarding");
  }

  const token = await signToken({
    id: user.id,
    organizationId: user.organizationId,
    role: user.role,
  });

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  redirect("/dashboard");
}
