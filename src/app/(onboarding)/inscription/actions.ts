"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/features/auth/password.utils";
import { signPendingToken, PENDING_SESSION_COOKIE } from "@/lib/auth/pending-session";
import { checkRateLimit } from "@/lib/rate-limit/in-memory";
import { getClientIP } from "@/lib/rate-limit/get-ip";
import { SignupFormSchema } from "@/lib/schemas/signup.schema";

export type SignupState = null | {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function signupAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  // Rate limit : 5 tentatives / 15 min par IP
  const ip = await getClientIP();
  const rl = checkRateLimit("signup", ip, 5);
  if (rl.limited) {
    return {
      error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds} secondes.`,
    };
  }

  // Validation Zod
  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptCGU: formData.get("acceptCGU"),
    acceptPrivacy: formData.get("acceptPrivacy"),
  };

  const parsed = SignupFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "_";
      fieldErrors[key] ??= [];
      fieldErrors[key].push(issue.message);
    }
    return { fieldErrors };
  }

  const { firstName, lastName, email, password } = parsed.data;

  // Vérifier unicité email (protection énumération : message identique)
  const existing = await prisma.proUser.findUnique({ where: { email } });
  if (existing) {
    return {
      error:
        "Un problème est survenu lors de la création du compte. Vérifiez vos informations ou connectez-vous.",
    };
  }

  // Hachage mot de passe
  const passwordHash = await hashPassword(password);

  // Création ProUser sans organization (onboarding en cours)
  const proUser = await prisma.proUser.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      role: "OWNER",
      isActive: true,
    },
  });

  // Session onboarding temporaire (pending_session)
  const token = await signPendingToken(proUser.id);
  const cookieStore = await cookies();
  cookieStore.set(PENDING_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  redirect("/onboarding");
}
