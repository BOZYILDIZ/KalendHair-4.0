import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { canManageSchedule } from "@/lib/permissions/schedule.permissions";
import { getSalon } from "@/features/salons/salon.service";
import { getClosedDays } from "@/features/schedules/closed-day.service";
import { ClosedDayManager } from "@/features/schedules/components/closed-day-manager";
import { addClosedDayAction, removeClosedDayAction } from "./actions";

export default async function ClosedDaysPage() {
  const session = await requireSession();

  if (!canManageSchedule(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const salon = await getSalon(session.organizationId);
  if (!salon) redirect("/dashboard/salon");

  const closedDays = await getClosedDays(salon.id, session.organizationId);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">Jours de fermeture exceptionnels</h1>
        <p className="text-sm text-gray-500">
          Ajoutez les jours fériés ou fermetures ponctuelles de votre salon.
        </p>
      </div>

      <ClosedDayManager
        closedDays={closedDays}
        addAction={addClosedDayAction}
        removeAction={removeClosedDayAction}
      />

      <div className="pt-2">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
          ← Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
