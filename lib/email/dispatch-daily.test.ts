import { describe, expect, it, vi } from "vitest";
import { dispatchDailyLessonEmails } from "@/lib/email/dispatch-daily";

describe("dispatchDailyLessonEmails", () => {
  it("returns zero counts when no opted-in users exist", async () => {
    const admin = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    };

    const result = await dispatchDailyLessonEmails({
      admin: admin as never,
      send: vi.fn(),
    });

    expect(result).toEqual({
      scanned: 0,
      eligible: 0,
      sent: 0,
      skipped: 0,
      errors: [],
    });
  });
});
