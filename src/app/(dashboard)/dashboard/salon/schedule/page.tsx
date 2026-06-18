import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { canManageSchedule } from "@/lib/permissions/schedule.permissions";
import { getSalon } from "@/features/salons/salon.service";
import { getSalonSchedule } from "@/features/schedules/salon-schedule.service";
import { SalonScheduleForm } from "@/features/schedules/components/salon-schedule-form";
import { saveSalonScheduleAction } from "./actions";

export default async function SalonSchedulePage() {
  const session = await requireSession();

  if (!canManageSchedule(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const salon = await getSalon(session.organizationId);
  if (!salon) redirect("/dashboard");

  const schedule = await getSalonSchedule(salon.id, session.organizationId);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">Horaires du salon</h1>
        <p className="text-sm text-gray-500">
          Définissez les jours et heures d&apos;ouverture de votre salon.
        </p>
      </div>

      <SalonScheduleForm schedule={schedule} action={saveSalonScheduleAction} />

      <div className="pt-2">
        <Link href="/dashboard/salon" className="text-sm text-gray-500 hover:underline">
          ← Retour au salon
        </Link>
      </div>
    </main>
  );
}
