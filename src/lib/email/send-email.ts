import { getResendClient } from "./resend.client";
import type { EmailPayload, SendEmailResult } from "./email.types";

export async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  const client = getResendClient();

  if (!client) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@kalendhair.fr";
  const fromName  = process.env.RESEND_FROM_NAME  ?? "KalendHair";
  const from      = `${fromName} <${fromEmail}>`;

  try {
    const { data, error } = await client.emails.send({
      from,
      to:      payload.to,
      subject: payload.subject,
      html:    payload.html,
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
    });

    if (error || !data) {
      return { ok: false, error: error?.message ?? "Resend returned no data" };
    }

    return { ok: true, messageId: data.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
