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

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
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

export function renderConfirmationEmail(ctx: NotificationContext): {
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
  const effectivePrice = ctx.priceCentsSnapshot ?? ctx.servicePriceCents;
  const formattedPrice = formatEuros(effectivePrice);
  const salonPhone = ctx.salonPhone ? escapeHtml(ctx.salonPhone) : null;

  const subject = `Confirmation de votre rendez-vous — ${escapedSalonName}`;

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
            <td style="background-color:#4F46E5;padding:28px 32px;">
              <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;">
                ${escapedSalonName}
              </p>
              <p style="margin:8px 0 0;font-size:14px;color:#c7d2fe;">
                Confirmation de rendez-vous
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
                Votre rendez-vous est confirmé. Voici le récapitulatif&nbsp;:
              </p>

              <!-- Récapitulatif -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="border:1px solid #e5e7eb;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 16px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">
                    Prestation
                  </td>
                  <td style="padding:14px 16px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;font-weight:600;">
                    ${serviceName}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">
                    Coiffeur
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;">
                    ${employeeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">
                    Date &amp; Heure
                  </td>
                  <td style="padding:14px 16px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;">
                    ${formattedDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">
                    Durée
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;">
                    ${ctx.serviceDurationMinutes} min
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#f9fafb;font-size:13px;color:#6b7280;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">
                    Prix
                  </td>
                  <td style="padding:14px 16px;background-color:#f9fafb;font-size:15px;color:#111827;font-weight:600;">
                    ${formattedPrice}
                  </td>
                </tr>
              </table>

              <!-- Coordonnées salon -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background-color:#eef2ff;border-left:4px solid #4F46E5;border-radius:4px;padding:0;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#3730a3;">
                      ${escapedSalonName}
                    </p>
                    ${
                      salonPhone
                        ? `<p style="margin:0;font-size:14px;color:#4338ca;">
                        Tel : ${salonPhone}
                      </p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>

              <!-- Footer message -->
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                Pour toute modification, contactez le salon directement.
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
