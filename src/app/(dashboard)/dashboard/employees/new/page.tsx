import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { createEmployeeAction } from "./actions";

export default async function NewEmployeePage() {
  const session = await requireSession();

  const salon = await getSalon(session.organizationId);
  if (!salon) redirect("/dashboard/salon");

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">Nouvel employé</h1>
        <p className="text-sm text-gray-500">{salon.name}</p>
      </div>

      <EmployeeForm action={createEmployeeAction} />

      <Link
        href="/dashboard/employees"
        className="block text-sm text-gray-400 hover:underline"
      >
        ← Retour aux employés
      </Link>
    </main>
  );
}
