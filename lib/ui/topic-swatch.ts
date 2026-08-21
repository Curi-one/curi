/** Deterministic cover palette for catalogue / library topic art. */
export function topicSwatch(topic: string): [bg: string, fg: string] {
  const palette: Record<string, [string, string]> = {
    "venture capital": ["#8BA0B8", "#102A43"],
    "term sheets": ["#C7A27A", "#3B240D"],
    "unit economics": ["#7FA88D", "#12351F"],
    "safe notes": ["#9A86B8", "#2B1744"],
    "cap tables": ["#B88D7A", "#3C190E"],
    fundraising: ["#7C9FB0", "#0D2B36"],
    "burn rate": ["#C18A6B", "#421A0B"],
    "founder equity": ["#A6A06D", "#332F0B"],
    "thinking, fast and slow": ["#8B9AB8", "#17233D"],
    sapiens: ["#A887B5", "#33163F"],
  };
  const key = topic.toLowerCase();
  if (palette[key]) return palette[key];
  const hues = [25, 145, 200, 260, 45, 310, 18, 190];
  const h =
    hues[
      topic.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % hues.length
    ]!;
  return [`hsl(${h} 32% 60%)`, `hsl(${h} 60% 16%)`];
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
