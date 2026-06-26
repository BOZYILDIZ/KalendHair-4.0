"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { signToken } from "@/features/auth/session.utils";
import {
  PENDING_SESSION_COOKIE,
  verifyPendingToken,
} from "@/lib/auth/pending-session";
import { OnboardingFormSchema } from "@/lib/schemas/onboarding.schema";
import type { SubscriptionPlanCode, BillingCycle } from "@prisma/client";

export type OnboardingState =
  | null
  | { error?: string; fieldErrors?: Record<string, string[]> };

function toSlug(text: string, suffix: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) +
    "-" +
    suffix
  );
}

export async function createOrganizationAction(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  // ── 1. Vérifier pending_session ──────────────────────────────────────────────
  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(PENDING_SESSION_COOKIE)?.value;
  if (!pendingToken) {
    return { error: "Session expirée. Veuillez vous inscrire à nouveau." };
  }

  const pending = await verifyPendingToken(pendingToken);
  if (!pending) {
    return { error: "Session expirée. Veuillez vous inscrire à nouveau." };
  }

  const proUserId = pending.id;

  // ── 2. Vérifier que le ProUser n'a pas déjà une organisation (double-submit) ─
  const proUser = await prisma.proUser.findUnique({
    where: { id: proUserId },
    select: { id: true, role: true, organizationId: true },
  });

  if (!proUser) {
    return { error: "Compte introuvable. Veuillez vous inscrire à nouveau." };
  }

  if (proUser.organizationId !== null) {
    // Organisation déjà créée (double-submit ou session fantôme)
    // On crée quand même la session pour ne pas bloquer l'utilisateur
    const token = await signToken({
      id: proUser.id,
      organizationId: proUser.organizationId,
      role: proUser.role,
    });
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });
    cookieStore.delete(PENDING_SESSION_COOKIE);
    redirect("/dashboard");
  }

  // ── 3. Validation Zod ────────────────────────────────────────────────────────
  const raw = {
    organizationName: formData.get("organizationName"),
    salonName: formData.get("salonName"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    planCode: formData.get("planCode"),
  };

  const parsed = OnboardingFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "_";
      fieldErrors[key] ??= [];
      fieldErrors[key].push(issue.message);
    }
    return { fieldErrors };
  }

  const {
    organizationName,
    salonName,
    city,
    postalCode,
    address,
    phone,
    planCode,
  } = parsed.data;

  // ── 4. Génération des slugs ───────────────────────────────────────────────────
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const orgSlug = toSlug(organizationName, suffix);
  const salonSlug = toSlug(salonName, suffix);

  // ── 5. Transaction Prisma ────────────────────────────────────────────────────
  let createdOrgId: string;
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 5a. Récupérer le BillingPlan
      const plan = await tx.billingPlan.findUnique({
        where: { code: planCode as SubscriptionPlanCode },
        select: { id: true },
      });
      if (!plan) throw new Error(`Plan introuvable : ${planCode}`);

      // 5b. Créer l'Organisation
      const org = await tx.organization.create({
        data: { name: organizationName, slug: orgSlug },
        select: { id: true },
      });

      // 5c. Créer le Salon principal
      await tx.salon.create({
        data: {
          organizationId: org.id,
          name: salonName,
          slug: salonSlug,
          city,
          postalCode,
          address: address ?? null,
          phone: phone ?? null,
          timezone: "Europe/Paris",
        },
      });

      // 5d. Créer l'abonnement initial (MONTHLY, status ACTIVE — sans Stripe)
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await tx.organizationSubscription.create({
        data: {
          organizationId: org.id,
          planId: plan.id,
          billingCycle: "MONTHLY" as BillingCycle,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      // 5e. Rattacher le ProUser à l'organisation
      await tx.proUser.update({
        where: { id: proUserId },
        data: { organizationId: org.id },
      });

      return org.id;
    });

    createdOrgId = result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Plan introuvable")) {
      return { error: "Plan sélectionné invalide. Veuillez réessayer." };
    }
    // P2002 : slug déjà existant (collision extrêmement rare avec UUID suffix)
    return {
      error:
        "Une erreur est survenue lors de la création. Veuillez réessayer.",
    };
  }

  // ── 6. Supprimer pending_session, créer session tenant ───────────────────────
  cookieStore.delete(PENDING_SESSION_COOKIE);

  const sessionToken = await signToken({
    id: proUserId,
    organizationId: createdOrgId,
    role: "OWNER",
  });

  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  redirect("/onboarding/salon");
}
