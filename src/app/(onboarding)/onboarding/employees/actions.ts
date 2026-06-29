"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import {
  EmployeesSetupPayloadSchema,
  type EmployeesSetupState,
} from "@/lib/schemas/employees-setup.schema";

function formatZodErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>,
): string {
  return issues
    .map((issue) => {
      const root = issue.path[0];
      const idx = issue.path[1];
      const field = issue.path[2];
      if (root === "employees" && typeof idx === "number") {
        return `Employé ${idx + 1} — ${typeof field === "string" ? field : ""}: ${issue.message}`;
      }
      return issue.message;
    })
    .join("\n");
}

export async function updateEmployeesSetupAction(
  _prevState: EmployeesSetupState,
  formData: FormData,
): Promise<EmployeesSetupState> {
  // ── 1. Authentification ───────────────────────────────────────────────────
  const session = await requireSession();

  // ── 2. Lire et parser le payload JSON ────────────────────────────────────
  const payloadStr = formData.get("payload")?.toString();
  if (!payloadStr) {
    return { error: "Données manquantes. Veuillez réessayer." };
  }

  let rawData: unknown;
  try {
    rawData = JSON.parse(payloadStr);
  } catch {
    return { error: "Format de données invalide. Veuillez réessayer." };
  }

  // ── 3. Validation Zod ─────────────────────────────────────────────────────
  const parsed = EmployeesSetupPayloadSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: formatZodErrors(parsed.error.issues) };
  }

  const { employees } = parsed.data;

  // ── 4. Transaction Prisma ─────────────────────────────────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      // 4a. Charger le salon via organizationId (@@unique — sécurité multi-tenant)
      const salon = await tx.salon.findUnique({
        where: { organizationId: session.organizationId },
        select: { id: true },
      });
      if (!salon) throw new Error("SALON_NOT_FOUND");

      // 4b. Vérifier que tous les serviceIds appartiennent à ce salon (anti cross-tenant)
      const allServiceIds = [
        ...new Set(employees.flatMap((e) => e.serviceIds)),
      ];
      if (allServiceIds.length > 0) {
        const validServices = await tx.service.findMany({
          where: { id: { in: allServiceIds }, salonId: salon.id },
          select: { id: true },
        });
        const validIds = new Set(validServices.map((s) => s.id));
        const hasInvalid = employees.some((emp) =>
          emp.serviceIds.some((sid) => !validIds.has(sid)),
        );
        if (hasInvalid) throw new Error("INVALID_SERVICE");
      }

      // 4c. Guard : pas de rendez-vous existants (Employee.onDelete: Restrict depuis Appointment)
      const hasAppointments = await tx.appointment.findFirst({
        where: { salonId: salon.id },
        select: { id: true },
      });
      if (hasAppointments) throw new Error("APPOINTMENTS_EXIST");

      // 4d. Supprimer les employés existants
      // EmployeeService cascade-supprimé automatiquement (onDelete: Cascade FK DB)
      // EmployeeSchedule cascade-supprimé automatiquement (onDelete: Cascade FK DB)
      await tx.employee.deleteMany({ where: { salonId: salon.id } });

      // 4e. Créer les nouveaux employés et leurs associations de services
      for (const emp of employees) {
        const created = await tx.employee.create({
          data: {
            organizationId: session.organizationId,
            salonId: salon.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email || null,
            phone: emp.phone || null,
            color: emp.color || null,
            isActive: emp.isActive,
          },
          select: { id: true },
        });

        await tx.employeeService.createMany({
          data: emp.serviceIds.map((serviceId) => ({
            employeeId: created.id,
            serviceId,
          })),
        });
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "SALON_NOT_FOUND") {
      return { error: "Salon introuvable. Veuillez contacter le support." };
    }
    if (msg === "APPOINTMENTS_EXIST") {
      return {
        error:
          "Des rendez-vous existent déjà pour ce salon. Modifiez votre équipe depuis le tableau de bord.",
      };
    }
    if (msg === "INVALID_SERVICE") {
      return {
        error:
          "Un service sélectionné est invalide ou n'appartient pas à ce salon.",
      };
    }
    return {
      error: "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.",
    };
  }

  // ── 5. Étape 4 terminée → étape 5 horaires ───────────────────────────────
  redirect("/onboarding/schedule");
}
