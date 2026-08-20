import { describe, expect, it, vi } from "vitest";
import { updateProfile } from "@/lib/me/update-profile";

describe("updateProfile", () => {
  it("updates member name", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const admin = {
      from: vi.fn(() => ({ update })),
    };

    const result = await updateProfile(
      { name: "Sam Founder" },
      { admin: admin as never, getUserId: async () => "user-1" },
    );

    expect(result).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({ name: "Sam Founder" });
  });
});
