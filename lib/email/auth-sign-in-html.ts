/**
 * Supabase magic-link email — link + 6-digit OTP in one message.
 * Placeholders are Go template vars; do not escape them.
 *
 * Sync to supabase/templates/magic_link.html via:
 *   pnpm generate:auth-email-template
 */

import {
  EMAIL_COLORS,
  EMAIL_FONTS,
  emailBodyText,
  emailCtaButton,
  emailDisplayTitle,
  emailKicker,
  emailSectionLabel,
  emailShell,
} from "@/lib/email/brand-theme";

export const AUTH_SIGN_IN_EMAIL_SUBJECT = "Your Curi sign-in link and code";

/** Supabase magic_link template vars — must stay literal in output. */
export const AUTH_SIGN_IN_PLACEHOLDERS = {
  confirmationUrl: "{{ .ConfirmationURL }}",
  token: "{{ .Token }}",
  email: "{{ .Email }}",
} as const;

export function emailOtpCode(token: string): string {
  return `<div style="font-family:${EMAIL_FONTS.mono};font-size:36px;font-weight:400;letter-spacing:0.35em;color:${EMAIL_COLORS.accent};margin:12px 0 0;">${token}</div>`;
}

export function emailSentToLine(email: string): string {
  return `<p style="font-family:${EMAIL_FONTS.ui};font-size:12px;font-weight:300;line-height:1.6;color:${EMAIL_COLORS.silver};margin:0;">Sent to ${email}. If you did not request this, you can ignore this email.</p>`;
}

/** Branded sign-in email for Supabase Auth magic_link template. */
export function renderAuthSignInEmailTemplate(): string {
  const { confirmationUrl, token, email } = AUTH_SIGN_IN_PLACEHOLDERS;

  const rows = `<tr><td style="padding:0 36px;">${emailKicker("Sign in")}</td></tr>
<tr><td>${emailDisplayTitle("Continue to Curi", "12px 36px 0")}</td></tr>
<tr><td>${emailBodyText(
    "Tap the button below on this device, or enter the six-digit code in the app. The link and code expire in one hour and work once.",
    "16px 36px 0",
  )}</td></tr>
<tr><td style="padding:24px 36px 0;">${emailCtaButton(confirmationUrl, "Open Curi →", { rawHref: true })}</td></tr>
<tr><td style="padding:32px 36px 0;border-top:1px solid ${EMAIL_COLORS.light};">${emailSectionLabel("Or enter this code")}${emailOtpCode(token)}</td></tr>
<tr><td style="padding:20px 36px 28px;">${emailSentToLine(email)}</td></tr>`;

  return emailShell({
    title: "Continue to Curi",
    header: { metaLine: "Secure sign-in" },
    rows,
    footer: {
      legalLine:
        "This is an automated sign-in email from Curi. If you did not request it, you can safely ignore it.",
    },
  });
}
