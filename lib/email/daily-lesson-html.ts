import {
  EMAIL_COLORS,
  EMAIL_FONTS,
  emailBodyText,
  emailCtaButton,
  emailDisplayTitle,
  emailKicker,
  emailSectionLabel,
  emailShell,
  escapeHtml,
} from "@/lib/email/brand-theme";

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
  const ctaLabel = hasMultiple ? "Open today's lessons →" : "Open today's lesson →";
  const metaLine = hasMultiple
    ? `Day ${Math.max(streak, 1)} · ${totalDue} active paths`
    : `Day ${Math.max(streak, 1)} · ${featured.topic} · ${featured.depthLabel}`;
  const dayNum = Math.max(streak, 1);
  const snapshot = curiositySnapshot(featured);

  const featuredRow = hasMultiple
    ? `<tr><td style="padding:20px 36px 0;">${emailKicker(`Featured · ${featured.topic}`)}</td></tr>`
    : "";

  const snapshotRow = `<tr><td>${emailBodyText(escapeHtml(snapshot), hasMultiple ? "16px 36px 0" : "20px 36px")}</td></tr>`;

  const alsoDueRows = hasMultiple
    ? `<tr><td><div style="border-top:1px solid ${EMAIL_COLORS.light};background:${EMAIL_COLORS.paper};"><div style="padding:20px 36px 8px;">${emailSectionLabel("Also due today")}</div>${alsoDue
          .map(
            (course, i) =>
              `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 36px;border-bottom:${i === alsoDue.length - 1 ? "none" : `1px solid ${EMAIL_COLORS.light}`};"><div style="flex:1;min-width:0;"><div style="font-family:${EMAIL_FONTS.mono};font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:${EMAIL_COLORS.silver};margin-bottom:4px;">${escapeHtml(course.topic)}</div><div style="font-family:${EMAIL_FONTS.ui};font-size:14px;font-weight:400;line-height:1.4;color:${EMAIL_COLORS.ink};">${escapeHtml(course.lessonTitle)}</div></div><a href="${escapeHtml(course.lessonUrl)}" style="flex-shrink:0;font-family:${EMAIL_FONTS.ui};font-size:11px;font-weight:600;color:${EMAIL_COLORS.ink};text-decoration:none;border:1px solid ${EMAIL_COLORS.light};padding:7px 14px;">Read →</a></div>`,
          )
          .join("")}</div></td></tr>`
    : "";

  const rows = `${featuredRow}
<tr><td>${emailDisplayTitle(featured.lessonTitle, hasMultiple ? "12px 36px 0" : "32px 36px 0")}</td></tr>
${snapshotRow}
${alsoDueRows}
<tr><td style="padding:28px 36px;border-top:1px solid ${EMAIL_COLORS.light};">
${emailCtaButton(ctaUrl, ctaLabel)}
<p style="font-family:${EMAIL_FONTS.ui};font-size:11px;font-weight:300;color:${EMAIL_COLORS.silver};text-align:center;margin:12px 0 0;">${dayNum} day streak — keep it alive</p>
</td></tr>`;

  return emailShell({
    title: featured.lessonTitle,
    header: { dateLabel, metaLine },
    rows,
    footer: { preferencesUrl, unsubscribeUrl, userName },
  });
}
