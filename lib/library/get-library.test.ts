import { describe, expect, it, vi } from "vitest";
import { getLibrary } from "@/lib/library/get-library";

const USER_ID = "user-lib";

function mockAdmin(
  courses: {
    id: string;
    topic: string;
    depth: string;
    progress: number;
    total: number;
    status: string;
  }[],
) {
  return {
    from: vi.fn((table: string) => {
      if (table !== "courses") throw new Error(`unexpected ${table}`);
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: courses, error: null }),
          }),
        }),
      };
    }),
  };
}

describe("getLibrary", () => {
  it("returns empty tabs for guests", async () => {
    const lib = await getLibrary({ getUserId: async () => null });
    expect(lib).toEqual({ exploring: [], mastered: [], shelved: [] });
  });

  it("groups courses by status", async () => {
    const admin = mockAdmin([
      {
        id: "c1",
        topic: "Active path",
        depth: "essentials",
        progress: 1,
        total: 7,
        status: "active",
      },
      {
        id: "c2",
        topic: "Done path",
        depth: "fluent",
        progress: 10,
        total: 10,
        status: "completed",
      },
      {
        id: "c3",
        topic: "Shelved path",
        depth: "thorough",
        progress: 2,
        total: 20,
        status: "shelved",
      },
    ]);

    const lib = await getLibrary({
      admin: admin as never,
      getUserId: async () => USER_ID,
    });

    expect(lib.exploring.map((p) => p.id)).toEqual(["c1"]);
    expect(lib.mastered.map((p) => p.id)).toEqual(["c2"]);
    expect(lib.shelved.map((p) => p.id)).toEqual(["c3"]);
  });
});
