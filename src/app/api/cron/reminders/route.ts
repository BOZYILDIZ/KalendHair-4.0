import { NextResponse } from "next/server";
import { processReminders } from "@/features/notifications/reminder.service";

// GET /api/cron/reminders
// Déclencheur Vercel Cron — 08:00 UTC chaque jour (vercel.json : "0 8 * * *").
// Plan Hobby Vercel : un seul cron quotidien autorisé.
// NOTE PILOTE : fenêtre active = RDV entre 06:00 et 10:00 UTC le lendemain
//   (08:00–12:00 Paris CEST). RDV hors plage non couverts → acceptable
//   car RESEND non configuré pendant le pilote fermé.
//   À corriger avant bêta publique : passer en Pro Vercel ou adapter la fenêtre.
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
