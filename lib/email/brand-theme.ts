/**
 * Curi email brand shell — BRAND.md §12, WEBSITE-DESIGN-RULES.md §1.
 * Table-based HTML for client compatibility; inline styles on components.
 */

export { EMAIL_COLORS } from "@/lib/brand/email-colors";
import { EMAIL_COLORS } from "@/lib/brand/email-colors";

export const EMAIL_FONTS = {
  display: "'Fraunces', Georgia, 'Times New Roman', serif",
  ui: "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Courier New', monospace",
} as const;

export const EMAIL_WIDTH = 600;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailHead(title: string): string {
  const safeTitle = escapeHtml(title);
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${safeTitle}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>`;
}

/** Wordmark with vermilion rule — §12.2 */
export function emailWordmark(size: "lg" | "sm" = "lg"): string {
  const fontSize = size === "lg" ? "28px" : "18px";
  return `<div style="font-family:${EMAIL_FONTS.display};font-size:${fontSize};font-weight:300;color:${EMAIL_COLORS.ink};line-height:1;">Cu<em style="font-style:italic;">ri</em></div><div style="height:3px;width:32px;background:${EMAIL_COLORS.accent};margin-top:4px;"></div>`;
}

export type EmailHeaderOptions = {
  dateLabel?: string;
  metaLine?: string;
};

export function emailHeader({ dateLabel, metaLine }: EmailHeaderOptions): string {
  const dateCell = dateLabel
    ? `<td align="right" style="font-family:${EMAIL_FONTS.mono};font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:${EMAIL_COLORS.silver};vertical-align:top;">${escapeHtml(dateLabel)}</td>`
    : "";

  const metaRow = metaLine
    ? `<div style="font-family:${EMAIL_FONTS.mono};font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:${EMAIL_COLORS.silver};margin-top:12px;padding-bottom:20px;">${escapeHtml(metaLine)}</div>`
    : `<div style="padding-bottom:20px;"></div>`;

  return `<tr><td style="padding:28px 36px 0;border-bottom:1px solid ${EMAIL_COLORS.light};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
<td>${emailWordmark("lg")}</td>
${dateCell}
</tr></table>
${metaRow}
</td></tr>`;
}

export type EmailFooterOptions = {
  preferencesUrl?: string;
  unsubscribeUrl?: string;
  userName?: string;
  /** Override default daily-email legal line. */
  legalLine?: string;
};

export function emailFooter({
  preferencesUrl,
  unsubscribeUrl,
  userName,
  legalLine,
}: EmailFooterOptions): string {
  const links: string[] = [];
  if (preferencesUrl) {
    links.push(
      `<a href="${escapeHtml(preferencesUrl)}" style="color:${EMAIL_COLORS.silver};text-decoration:none;">Manage preferences</a>`,
    );
  }
  if (unsubscribeUrl) {
    links.push(
      `<a href="${escapeHtml(unsubscribeUrl)}" style="color:${EMAIL_COLORS.silver};text-decoration:none;">Unsubscribe</a>`,
    );
  }
  const linkRow =
    links.length > 0
      ? `<td align="right" style="font-family:${EMAIL_FONTS.mono};font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:${EMAIL_COLORS.silver};">${links.join(" · ")}</td>`
      : "";

  const defaultLegal = userName
    ? `Hi ${escapeHtml(userName)}, you're receiving this because daily lesson emails are enabled for your account.`
    : "You're receiving this from Curi.";

  return `<tr><td style="padding:20px 36px;border-top:1px solid ${EMAIL_COLORS.light};background:${EMAIL_COLORS.paper};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
<td>${emailWordmark("sm")}</td>
${linkRow}
</tr></table>
<p style="font-family:${EMAIL_FONTS.ui};font-size:11px;font-weight:300;line-height:1.6;color:${EMAIL_COLORS.silver};margin:12px 0 0;">${legalLine ?? defaultLegal}</p>
<p style="font-family:${EMAIL_FONTS.mono};font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL_COLORS.silver};margin:16px 0 0;">Curi · daily micro-learning</p>
</td></tr>`;
}

export function emailCtaButton(
  href: string,
  label: string,
  options?: { rawHref?: boolean },
): string {
  const safeHref = options?.rawHref ? href : escapeHtml(href);
  return `<a href="${safeHref}" style="display:block;text-align:center;background:${EMAIL_COLORS.ink};color:${EMAIL_COLORS.white};font-family:${EMAIL_FONTS.ui};font-size:13px;font-weight:600;letter-spacing:0.04em;padding:14px 28px;text-decoration:none;border-bottom:3px solid ${EMAIL_COLORS.accent};">${escapeHtml(label)}</a>`;
}

export function emailKicker(text: string): string {
  return `<div style="font-family:${EMAIL_FONTS.mono};font-size:8px;letter-spacing:0.25em;text-transform:uppercase;color:${EMAIL_COLORS.accent};">${escapeHtml(text)}</div>`;
}

export function emailSectionLabel(text: string): string {
  return `<div style="font-family:${EMAIL_FONTS.mono};font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:${EMAIL_COLORS.silver};">${escapeHtml(text)}</div>`;
}

export function emailDisplayTitle(text: string, padding = "32px 36px 0"): string {
  return `<div style="font-family:${EMAIL_FONTS.display};font-size:32px;font-weight:400;line-height:1.1;letter-spacing:-0.02em;color:${EMAIL_COLORS.ink};padding:${padding};">${escapeHtml(text)}</div>`;
}

export function emailBodyText(html: string, padding = "20px 36px"): string {
  return `<div style="font-family:${EMAIL_FONTS.ui};font-size:16px;font-weight:300;line-height:1.75;color:${EMAIL_COLORS.ink};padding:${padding};">${html}</div>`;
}

/** Full-width card shell for transactional / simple pages. */
export function emailPage(options: {
  title: string;
  heading: string;
  bodyHtml: string;
  actionHtml?: string;
}): string {
  const { title, heading, bodyHtml, actionHtml } = options;
  return `<!DOCTYPE html>
<html lang="en">
${emailHead(title)}
<body style="margin:0;padding:0;background:${EMAIL_COLORS.canvas};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.canvas};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="${EMAIL_WIDTH}" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.white};border:1px solid ${EMAIL_COLORS.light};">
${emailHeader({})}
<tr><td style="padding:32px 36px 24px;">
<h1 style="font-family:${EMAIL_FONTS.display};font-size:28px;font-weight:300;line-height:1.15;letter-spacing:-0.02em;color:${EMAIL_COLORS.ink};margin:0 0 16px;">${escapeHtml(heading)}</h1>
<div style="font-family:${EMAIL_FONTS.ui};font-size:15px;font-weight:300;line-height:1.75;color:${EMAIL_COLORS.mid};">${bodyHtml}</div>
${actionHtml ? `<div style="margin-top:24px;">${actionHtml}</div>` : ""}
</td></tr>
${emailFooter({ legalLine: "Manage email settings anytime at curi.one/profile." })}
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function emailShell(options: {
  title: string;
  header: EmailHeaderOptions;
  rows: string;
  footer: EmailFooterOptions;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
${emailHead(options.title)}
<body style="margin:0;padding:0;background:${EMAIL_COLORS.canvas};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.canvas};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="${EMAIL_WIDTH}" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.white};border:1px solid ${EMAIL_COLORS.light};">
${emailHeader(options.header)}
${options.rows}
${emailFooter(options.footer)}
</table>
</td></tr>
</table>
</body>
</html>`;
}
