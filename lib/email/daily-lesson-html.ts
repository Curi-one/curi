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

function formatParagraphs(paragraphs: string[]): string {
  return paragraphs
    .map(
      (p) =>
        `<p style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:15px;font-weight:300;line-height:1.75;color:#0A0908;margin:16px 0 0;">${escapeHtml(stripMarkdown(p))}</p>`,
    )
    .join("");
}

function bodyForFormat(
  payload: DailyLessonEmailPayload,
): { paragraphs: string[]; showTakeaways: boolean } {
  const { featured, emailFormat } = payload;
  if (emailFormat === "Headlines") {
    return { paragraphs: [], showTakeaways: false };
  }
  if (emailFormat === "Summary") {
    return {
      paragraphs: featured.bodyParagraphs.slice(0, 1),
      showTakeaways: false,
    };
  }
  return { paragraphs: featured.bodyParagraphs, showTakeaways: true };
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
  const { paragraphs, showTakeaways } = bodyForFormat(payload);

  const featuredLabel = hasMultiple
    ? `<div style="padding:20px 36px 0;font-family:'JetBrains Mono','Courier New',monospace;font-size:8px;letter-spacing:0.25em;text-transform:uppercase;color:#C1121F;">Featured · ${escapeHtml(featured.topic)}</div>`
    : "";

  const bodyHtml =
    payload.emailFormat === "Headlines"
      ? `<p style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:15px;line-height:1.6;color:#0A0908;margin:0;">Your ${totalDue} lesson${totalDue === 1 ? "" : "s"} for today ${totalDue === 1 ? "is" : "are"} ready in Curi.</p>`
      : formatParagraphs(paragraphs);

  const pullQuote = featured.pullQuote
    ? `<div style="padding:4px 36px 24px 60px;border-left:2px solid #C1121F;margin:0 36px 8px;"><p style="font-family:'Fraunces',Georgia,'Times New Roman',serif;font-style:italic;font-size:17px;font-weight:300;line-height:1.6;color:#0A0908;margin:0;">${escapeHtml(stripMarkdown(featured.pullQuote))}</p></div>`
    : "";

  const takeaways =
    showTakeaways && featured.takeaways.length > 0
      ? `<div style="padding:24px 36px;border-top:1px solid #D4D0C8;"><div style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:#9E9B94;margin-bottom:14px;">Key takeaways</div>${featured.takeaways
          .map(
            (t, i) =>
              `<div style="display:flex;gap:12px;align-items:flex-start;margin-top:${i > 0 ? 10 : 0}px;"><span style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#C1121F;line-height:24px;">${String(i + 1).padStart(2, "0")}</span><span style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:14px;line-height:1.6;color:#0A0908;">${escapeHtml(stripMarkdown(t))}</span></div>`,
          )
          .join("")}</div>`
      : "";

  const alsoDueHtml = hasMultiple
    ? `<div style="border-top:1px solid #D4D0C8;background:#EEEDE9;"><div style="padding:20px 36px 8px;font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:#9E9B94;">Also due today</div>${alsoDue
          .map(
            (course, i) =>
              `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 36px;border-bottom:${i === alsoDue.length - 1 ? "none" : "1px solid #D4D0C8"};"><div style="flex:1;min-width:0;"><div style="font-family:'JetBrains Mono','Courier New',monospace;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#9E9B94;margin-bottom:4px;">${escapeHtml(course.topic)}</div><div style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:14px;line-height:1.4;color:#0A0908;">${escapeHtml(course.lessonTitle)}</div></div><a href="${escapeHtml(course.lessonUrl)}" style="flex-shrink:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:11px;font-weight:600;color:#0A0908;text-decoration:none;border:1px solid #D4D0C8;padding:7px 14px;">Read →</a></div>`,
          )
          .join("")}</div>`
    : "";

  const tomorrow = featured.tomorrowTitle
    ? `<div style="padding:20px 36px 28px;background:#EEEDE9;border-top:1px solid #D4D0C8;"><div style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#9E9B94;margin-bottom:8px;">Tomorrow · ${escapeHtml(featured.topic)}</div><div style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:17px;color:#0A0908;line-height:1.3;">${escapeHtml(featured.tomorrowTitle)}</div></div>`
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
        <tr><td style="padding:20px 36px;">${bodyHtml}</td></tr>
        ${pullQuote ? `<tr><td>${pullQuote}</td></tr>` : ""}
        ${takeaways ? `<tr><td>${takeaways}</td></tr>` : ""}
        ${alsoDueHtml ? `<tr><td>${alsoDueHtml}</td></tr>` : ""}
        <tr><td style="padding:28px 36px;border-top:1px solid #D4D0C8;">
          <a href="${escapeHtml(ctaUrl)}" style="display:block;text-align:center;background:#0A0908;color:#FAF9F5;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.04em;padding:14px 28px;text-decoration:none;">${ctaLabel} →</a>
          <p style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:11px;color:#9E9B94;text-align:center;margin:12px 0 0;">${dayNum} day streak — keep it alive</p>
        </td></tr>
        ${tomorrow ? `<tr><td>${tomorrow}</td></tr>` : ""}
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
