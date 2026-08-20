import { describe, expect, it } from "vitest";
import { buildPathMapNodes, isLessonReadable } from "@/lib/courses/path-map";

const lessons = [
  { index: 0, title: "Lesson 1" },
  { index: 1, title: "Lesson 2" },
  { index: 2, title: "Lesson 3" },
];

describe("buildPathMapNodes", () => {
  it("marks read, today, and locked for active path at progress 1", () => {
    const nodes = buildPathMapNodes({
      progress: 1,
      status: "active",
      lessons,
    });
    expect(nodes.map((n) => n.status)).toEqual(["read", "today", "locked"]);
  });

  it("has no today node for shelved paths", () => {
    const nodes = buildPathMapNodes({
      progress: 1,
      status: "shelved",
      lessons,
    });
    expect(nodes.map((n) => n.status)).toEqual(["read", "locked", "locked"]);
  });

  it("marks all lessons read when completed", () => {
    const nodes = buildPathMapNodes({
      progress: 3,
      status: "completed",
      lessons,
    });
    expect(nodes.every((n) => n.status === "read")).toBe(true);
  });

  it("locks the progress index (not today) when activity already happened today", () => {
    const nodes = buildPathMapNodes({
      progress: 1,
      status: "active",
      lessons,
      hasActivityToday: true,
    });
    expect(nodes.map((n) => n.status)).toEqual(["read", "locked", "locked"]);
  });

  it("keeps today status when no activity has happened yet today", () => {
    const nodes = buildPathMapNodes({
      progress: 1,
      status: "active",
      lessons,
      hasActivityToday: false,
    });
    expect(nodes.map((n) => n.status)).toEqual(["read", "today", "locked"]);
  });
});

describe("isLessonReadable", () => {
  it("allows re-reading any lesson before progress", () => {
    expect(
      isLessonReadable({ index: 0, progress: 2, hasActivityToday: true }),
    ).toBe(true);
    expect(
      isLessonReadable({ index: 1, progress: 2, hasActivityToday: false }),
    ).toBe(true);
  });

  it("allows reading the progress lesson only when no activity today", () => {
    expect(
      isLessonReadable({ index: 2, progress: 2, hasActivityToday: false }),
    ).toBe(true);
    expect(
      isLessonReadable({ index: 2, progress: 2, hasActivityToday: true }),
    ).toBe(false);
  });

  it("never allows reading past the progress lesson", () => {
    expect(
      isLessonReadable({ index: 3, progress: 2, hasActivityToday: false }),
    ).toBe(false);
    expect(
      isLessonReadable({ index: 3, progress: 2, hasActivityToday: true }),
    ).toBe(false);
  });
});
