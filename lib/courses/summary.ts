import type { DepthSlug, PathSummary } from "@/lib/api/schemas";

export function parseDepth(raw: unknown): DepthSlug {
  if (raw === "essentials" || raw === "fluent" || raw === "thorough") {
    return raw;
  }
  return "essentials";
}

export type CourseSummaryRow = {
  id: string;
  topic: string;
  depth: unknown;
  progress: number;
  total: number;
};

export function courseRowToSummary(row: CourseSummaryRow): PathSummary {
  return {
    id: String(row.id),
    topic: String(row.topic),
    depth: parseDepth(row.depth),
    progress: typeof row.progress === "number" ? row.progress : 0,
    totalLessons:
      typeof row.total === "number" && row.total > 0 ? row.total : 1,
  };
}
