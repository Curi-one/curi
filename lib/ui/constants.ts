import type { DepthSlug, LessonFeel } from "@/lib/api/schemas";

export const DEPTH_OPTIONS: {
  slug: DepthSlug;
  label: string;
  subcopy: string;
}[] = [
  {
    slug: "essentials",
    label: "Essentials",
    subcopy: "Core ideas · about a week",
  },
  {
    slug: "fluent",
    label: "Fluent",
    subcopy: "Enough for real decisions · about two weeks",
  },
  {
    slug: "thorough",
    label: "Thorough",
    subcopy: "Full picture · about a month",
  },
];

export const LESSON_FEEL_OPTIONS: { slug: LessonFeel; label: string }[] = [
  { slug: "too_easy", label: "Too easy" },
  { slug: "just_right", label: "Just right" },
  { slug: "too_hard", label: "Too hard" },
  { slug: "confusing", label: "Confusing" },
];

export function depthLabel(depth: DepthSlug): string {
  return DEPTH_OPTIONS.find((d) => d.slug === depth)?.label ?? depth;
}
