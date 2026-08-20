/**
 * Deterministic cover field for catalogue / library topic art.
 *
 * Greyscale only: imagery is never rendered in colour (BRAND.md §6.3) and the
 * palette admits no second accent (§16.1). Topics stay distinguishable by
 * tonal value rather than hue, on the dark field described in §6.2.
 *
 * Returns `[field, glyph]` — the field background and the colour of the
 * oversized letterform set on it.
 */
export function topicSwatch(topic: string): [field: string, glyph: string] {
  // Dark field, Ink through Ink 3 (§4.2)
  const tones = [5, 8, 11, 14, 17, 9, 13, 16];
  const i =
    topic.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % tones.length;
  return [`hsl(0 0% ${tones[i]!}%)`, "#FFFFFF"];
}

/** Progress % with a slight endowment so early progress feels visible. */
export function endowedPct(progress: number, total: number): number {
  if (total <= 0) return 0;
  const p = Math.min(progress, total);
  if (p >= total) return 100;
  return Math.round(((p + 1) / (total + 1)) * 100);
}

export type ChapterSlice = { label: string | null; start: number; end: number };

/** Split a lesson list into named chapter bands (prototype CoursePathScreen). */
export function buildChapters(n: number): ChapterSlice[] {
  if (n <= 7) return [{ label: null, start: 0, end: n }];
  if (n <= 14) {
    const mid = Math.ceil(n / 2);
    return [
      { label: "Opening", start: 0, end: mid },
      { label: "Depths", start: mid, end: n },
    ];
  }
  if (n <= 21) {
    const t = Math.ceil(n / 3);
    return [
      { label: "Foundations", start: 0, end: t },
      { label: "Structure", start: t, end: t * 2 },
      { label: "Mastery", start: t * 2, end: n },
    ];
  }
  const q = Math.ceil(n / 4);
  return [
    { label: "Part I", start: 0, end: q },
    { label: "Part II", start: q, end: q * 2 },
    { label: "Part III", start: q * 2, end: q * 3 },
    { label: "Part IV", start: q * 3, end: n },
  ];
}
