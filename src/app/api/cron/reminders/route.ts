import { NextResponse } from "next/server";
import { processReminders } from "@/features/notifications/reminder.service";

// GET /api/cron/reminders
// Déclencheur Vercel Cron — toutes les heures (vercel.json : "0 * * * *").
// Sécurisé par CRON_SECRET : Vercel injecte "Authorization: Bearer <CRON_SECRET>"
// à chaque invocation. En dev local, appeler manuellement avec le bon header.
export async function GET(request: Request): Promise<NextResponse> {
  const auth   = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processReminders();
  return NextResponse.json(result);
}
