export const CURIOSITY_EMAIL_FORMAT = "Curiosity" as const;

export type DailyLessonFeatured = {
  topic: string;
  depthLabel: string;
  lessonTitle: string;
  lessonIndex: number;
  totalLessons: number;
  bodyParagraphs: string[];
  pullQuote?: string;
  takeaways: string[];
  tomorrowTitle?: string;
};

export type DailyLessonAlsoDue = {
  topic: string;
  lessonTitle: string;
  lessonUrl: string;
};

export type DailyLessonEmailPayload = {
  to: string;
  userName: string;
  streak: number;
  dateLabel: string;
  /** Always Curiosity; legacy Full/Summary/Headlines map to the same template. */
  emailFormat: string;
  featured: DailyLessonFeatured;
  alsoDue: DailyLessonAlsoDue[];
  ctaUrl: string;
  preferencesUrl: string;
  unsubscribeUrl: string;
  isAcademy: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(\d+)\]/g, "")
    .trim();
}

const SNAPSHOT_FALLBACK = "Today's lesson is ready";
const SNAPSHOT_MAX_CHARS = 200;

/**
 * Short peek into the lesson — never the full body or takeaways list.
 * Prefer first takeaway → pullQuote → first body paragraph (truncated) → calm fallback.
 */
export function curiositySnapshot(featured: DailyLessonFeatured): string {
  const firstTakeaway = featured.takeaways.find(
    (t) => typeof t === "string" && t.trim().length > 0,
  );
  if (firstTakeaway) {
    return stripMarkdown(firstTakeaway);
  }
  if (featured.pullQuote?.trim()) {
    return stripMarkdown(featured.pullQuote);
  }
  const firstPara = featured.bodyParagraphs.find(
    (p) => typeof p === "string" && p.trim().length > 0,
  );
  if (firstPara) {
    const plain = stripMarkdown(firstPara);
    if (plain.length <= SNAPSHOT_MAX_CHARS) return plain;
    const cut = plain.slice(0, SNAPSHOT_MAX_CHARS);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  }
  return SNAPSHOT_FALLBACK;
}

export function dailyLessonSubject(payload: DailyLessonEmailPayload): string {
  const totalDue = 1 + payload.alsoDue.length;
  if (totalDue > 1) {
    return `${totalDue} lessons for today — ${payload.featured.lessonTitle}`;
  }
  return payload.featured.lessonTitle;
}

export function renderDailyLessonEmail(payload: DailyLessonEmailPayload): string {
  const {
    userName,
    streak,
    dateLabel,
    featured,
    alsoDue,
    ctaUrl,
    preferencesUrl,
    unsubscribeUrl,
  } = payload;
  const totalDue = 1 + alsoDue.length;
  const hasMultiple = alsoDue.length > 0;
  const ctaLabel = hasMultiple ? "Open today's lessons" : "Open today's lesson";
  const metaLine = hasMultiple
    ? `${totalDue} active paths`
    : `${featured.topic} · ${featured.depthLabel}`;
  const dayNum = Math.max(streak, 1);
  const snapshot = curiositySnapshot(featured);

  const featuredLabel = hasMultiple
    ? `<div style="padding:20px 36px 0;font-family:'JetBrains Mono','Courier New',monospace;font-size:8px;letter-spacing:0.25em;text-transform:uppercase;color:#C1121F;">Featured · ${escapeHtml(featured.topic)}</div>`
    : "";

  const snapshotHtml = `<p style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:15px;font-weight:300;line-height:1.75;color:#0A0908;margin:0;">${escapeHtml(snapshot)}</p>`;

  const alsoDueHtml = hasMultiple
    ? `<div style="border-top:1px solid #D4D0C8;background:#EEEDE9;"><div style="padding:20px 36px 8px;font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:#9E9B94;">Also due today</div>${alsoDue
          .map(
            (course, i) =>
              `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 36px;border-bottom:${i === alsoDue.length - 1 ? "none" : "1px solid #D4D0C8"};"><div style="flex:1;min-width:0;"><div style="font-family:'JetBrains Mono','Courier New',monospace;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#9E9B94;margin-bottom:4px;">${escapeHtml(course.topic)}</div><div style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:14px;line-height:1.4;color:#0A0908;">${escapeHtml(course.lessonTitle)}</div></div><a href="${escapeHtml(course.lessonUrl)}" style="flex-shrink:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:11px;font-weight:600;color:#0A0908;text-decoration:none;border:1px solid #D4D0C8;padding:7px 14px;">Read →</a></div>`,
          )
          .join("")}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#EEEDE9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#EEEDE9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="background:#FAF9F5;border:1px solid #D4D0C8;">
        <tr><td style="padding:28px 36px 0;border-bottom:1px solid #D4D0C8;">
          <table role="presentation" width="100%"><tr>
            <td><div style="font-family:'Fraunces',Georgia,serif;font-size:26px;font-weight:300;color:#0A0908;line-height:1;">Cu<em style="font-style:italic;">ri</em></div><div style="height:3px;width:32px;background:#C1121F;margin-top:4px;"></div></td>
            <td align="right" style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#9E9B94;">${escapeHtml(dateLabel)}</td>
          </tr></table>
          <div style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#9E9B94;margin-top:12px;padding-bottom:20px;">Day ${dayNum} · ${escapeHtml(metaLine)}</div>
        </td></tr>
        ${featuredLabel ? `<tr><td>${featuredLabel}</td></tr>` : ""}
        <tr><td style="padding:${hasMultiple ? "10px" : "32px"} 36px 0;">
          <div style="font-family:'Fraunces',Georgia,serif;font-size:30px;font-weight:400;line-height:1.1;letter-spacing:-0.02em;color:#0A0908;">${escapeHtml(featured.lessonTitle)}</div>
        </td></tr>
        <tr><td style="padding:20px 36px;">${snapshotHtml}</td></tr>
        ${alsoDueHtml ? `<tr><td>${alsoDueHtml}</td></tr>` : ""}
        <tr><td style="padding:28px 36px;border-top:1px solid #D4D0C8;">
          <a href="${escapeHtml(ctaUrl)}" style="display:block;text-align:center;background:#0A0908;color:#FAF9F5;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.04em;padding:14px 28px;text-decoration:none;">${ctaLabel} →</a>
          <p style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:11px;color:#9E9B94;text-align:center;margin:12px 0 0;">${dayNum} day streak — keep it alive</p>
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #D4D0C8;background:#F4F1E8;">
          <table role="presentation" width="100%"><tr>
            <td style="font-family:'Fraunces',Georgia,serif;font-size:18px;color:#0A0908;">Cu<em style="font-style:italic;">ri</em></td>
            <td align="right" style="font-family:'JetBrains Mono','Courier New',monospace;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:#9E9B94;"><a href="${escapeHtml(preferencesUrl)}" style="color:#9E9B94;text-decoration:none;">Manage preferences</a> · <a href="${escapeHtml(unsubscribeUrl)}" style="color:#9E9B94;text-decoration:none;">Unsubscribe</a></td>
          </tr></table>
          <p style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:11px;color:#9E9B94;margin:12px 0 0;">Hi ${escapeHtml(userName)}, you're receiving this because daily lesson emails are enabled for your account.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
