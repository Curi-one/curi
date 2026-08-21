import { getEnv } from "@/lib/env";
import { emailFromAddress } from "@/lib/email/urls";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  /** Extra SMTP headers (e.g. RFC 8058 List-Unsubscribe). */
  headers?: Record<string, string>;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; code: "not_configured" | "provider_error"; message: string };

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = getEnv().RESEND_API_KEY.trim();
  if (!apiKey) {
    return { ok: false, code: "not_configured", message: "RESEND_API_KEY missing" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.headers ? { headers: input.headers } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return {
      ok: false,
      code: "provider_error",
      message: body || `Resend error (${res.status})`,
    };
  }

  const data = (await res.json()) as { id?: string };
  return { ok: true, id: data.id };
}
