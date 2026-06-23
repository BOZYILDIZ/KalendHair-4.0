// Types partagés pour l'envoi d'email

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };
