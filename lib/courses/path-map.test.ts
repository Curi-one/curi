import { describe, expect, it } from "vitest";
import { buildPathMapNodes } from "@/lib/courses/path-map";

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
});
