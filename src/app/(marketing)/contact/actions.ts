"use server";

import { redirect } from "next/navigation";
import { contactSchema } from "@/lib/schemas/contact.schema";
import { sendEmail } from "@/lib/email/send-email";
import type { ContactInput } from "@/lib/schemas/contact.schema";

/* ─── State type ─────────────────────────────────────────────────────────────── */

export type ContactState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
} | null;

/* ─── Email builder ──────────────────────────────────────────────────────────── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MODULE_LABELS: Record<string, string> = {
  agenda: "Agenda & Planning",
  reservation: "Réservation en ligne",
  crm: "CRM Clients",
  caisse: "Paiements & Caisse",
  stocks: "Stocks",
  fournisseurs: "Fournisseurs",
  commissions: "Commissions",
  kpi: "KPI Dashboard",
};

function buildEmailHtml(data: ContactInput): string {
  const esc = escapeHtml;
  const modulesLabel = data.modules
    .map((m) => MODULE_LABELS[m] ?? esc(m))
    .join(", ");

  const rows: [string, string][] = [
    ["Salon", esc(data.salonName)],
    ["Contact", `${esc(data.firstName)} ${esc(data.lastName)}`],
    ["E-mail", esc(data.email)],
    ...(data.phone ? ([["Téléphone", esc(data.phone)]] as [string, string][]) : []),
    ["Ville", esc(data.city)],
    ["Employés", esc(data.employeeCount)],
    ["Modules souhaités", modulesLabel],
    ...(data.message
      ? ([["Message", `<pre style="white-space:pre-wrap;margin:0">${esc(data.message)}</pre>`]] as [string, string][])
      : []),
  ];

  const tableRows = rows
    .map(
      ([key, val]) =>
        `<tr>
          <td style="padding:6px 16px 6px 0;font-weight:600;color:#334155;vertical-align:top;white-space:nowrap">${key}</td>
          <td style="padding:6px 0;color:#475569">${val}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#4f46e5;border-radius:8px 8px 0 0;padding:16px 24px">
        <h2 style="color:#fff;margin:0;font-size:20px">Nouvelle candidature pilote</h2>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:24px">
        <h3 style="color:#4f46e5;margin:0 0 20px">${esc(data.salonName)}</h3>
        <table style="border-collapse:collapse;width:100%">${tableRows}</table>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0">
        <p style="color:#94a3b8;font-size:12px;margin:0">Reçu via kalendhair.fr/contact</p>
      </div>
    </div>`;
}

/* ─── Action ─────────────────────────────────────────────────────────────────── */

export async function submitContactAction(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const rawPhone = formData.get("phone")?.toString().trim();

  const raw = {
    salonName: formData.get("salonName")?.toString().trim() ?? "",
    firstName: formData.get("firstName")?.toString().trim() ?? "",
    lastName: formData.get("lastName")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() ?? "",
    phone: rawPhone || undefined,
    city: formData.get("city")?.toString().trim() ?? "",
    employeeCount: formData.get("employeeCount")?.toString() ?? "",
    modules: formData.getAll("modules").map(String),
    message: formData.get("message")?.toString().trim() || undefined,
    gdprConsent: formData.get("gdprConsent") === "on",
  };

  const result = contactSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      message: "Veuillez corriger les erreurs dans le formulaire.",
      errors: result.error.flatten().fieldErrors as Record<
        string,
        string[] | undefined
      >,
    };
  }

  const data = result.data;
  const toEmail =
    process.env.CONTACT_TO_EMAIL ?? "contact@kalendhair.fr";

  const emailResult = await sendEmail({
    to: toEmail,
    subject: `Candidature pilote — ${data.salonName}`,
    html: buildEmailHtml(data),
    replyTo: data.email,
  });

  if (!emailResult.ok) {
    if (emailResult.error === "RESEND_API_KEY not configured") {
      // Expected in dev/staging — log without sensitive data
      console.log(
        "[contact] RESEND_API_KEY absent — candidature reçue, email non envoyé.",
        { salonName: data.salonName, city: data.city },
      );
    } else {
      console.error("[contact] Erreur Resend:", emailResult.error, {
        salonName: data.salonName,
        city: data.city,
      });
    }
  }

  // Always redirect to confirmation — email failure is non-blocking
  redirect("/contact/merci");
}
