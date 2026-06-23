import type { NotificationContext } from "../types";

// ---------------------------------------------------------------------------
// Helpers internes — non exportés
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(startAt: Date, timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(startAt);
}

// ---------------------------------------------------------------------------
// Export nommé
// ---------------------------------------------------------------------------

export function renderCancellationEmail(ctx: NotificationContext): {
  subject: string;
  html: string;
} {
  const escapedSalonName = escapeHtml(ctx.salonName);
  const firstName = escapeHtml(ctx.recipientFirstName);
  const lastName = escapeHtml(ctx.recipientLastName);
  const employeeName = escapeHtml(
    `${ctx.employeeFirstName} ${ctx.employeeLastName}`
  );
  const serviceName = escapeHtml(ctx.serviceName);
  const formattedDate = escapeHtml(formatDate(ctx.startAt, ctx.salonTimezone));
  const salonPhone = ctx.salonPhone ? escapeHtml(ctx.salonPhone) : null;
  const bookingUrl = `/book/${escapeHtml(ctx.salonSlug)}`;

  const subject = `Annulation de votre rendez-vous — ${escapedSalonName}`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- En-tête -->
          <tr>
            <td style="background-color:#dc2626;padding:28px 32px;">
              <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;">
                ${escapedSalonName}
              </p>
              <p style="margin:8px 0 0;font-size:14px;color:#fca5a5;">
                Annulation de rendez-vous
              </p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;font-size:16px;color:#111827;">
                Bonjour <strong>${firstName} ${lastName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                Nous vous informons que votre rendez-vous suivant a été <strong style="color:#dc2626;">annulé</strong>&nbsp;:
              </p>

              <!-- Détails du RDV annulé -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="border:1px solid #fecaca;border-radius:6px;margin-bottom:28px;background-color:#fff7f7;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #fecaca;font-size:13px;color:#9ca3af;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">
                    Date &amp; Heure
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #fecaca;font-size:15px;color:#111827;">
                    ${formattedDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #fecaca;font-size:13px;color:#9ca3af;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">
                    Prestation
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #fecaca;font-size:15px;color:#111827;">
                    ${serviceName}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;font-size:13px;color:#9ca3af;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">
                    Coiffeur
                  </td>
                  <td style="padding:14px 16px;font-size:15px;color:#111827;">
                    ${employeeName}
                  </td>
                </tr>
              </table>

              <!-- Invitation à reprendre RDV -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="margin-bottom:28px;">
                <tr>
                  <td align="center" style="padding:8px 0;">
                    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                      Souhaitez-vous reprendre un rendez-vous&nbsp;?
                    </p>
                    <a href="${bookingUrl}"
                       style="display:inline-block;background-color:#4F46E5;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:6px;">
                      Prendre un nouveau rendez-vous
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Coordonnées salon -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background-color:#f3f4f6;border-left:4px solid #9ca3af;border-radius:4px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#374151;">
                      ${escapedSalonName}
                    </p>
                    ${
                      salonPhone
                        ? `<p style="margin:0;font-size:14px;color:#6b7280;">
                        Tel : ${salonPhone}
                      </p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>

              <!-- Footer message -->
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                Nous esp&#233;rons vous revoir bient&#244;t.
              </p>
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                Cet email a été envoyé automatiquement — merci de ne pas y répondre.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
