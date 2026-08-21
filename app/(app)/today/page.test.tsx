import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/api/client", () => ({
  getMe: vi.fn(),
  getFeed: vi.fn(),
  getProgress: vi.fn(),
}));

vi.mock("@/components/TodayView", () => ({
  TodayView: () => <div>Today feed</div>,
}));

import { getFeed, getMe, getProgress } from "@/lib/api/client";
import TodayPage from "@/app/(app)/today/page";

describe("TodayPage auth gate", () => {
  it("redirects guests to sign in", async () => {
    vi.mocked(getMe).mockResolvedValue({
      session: { kind: "guest", plan: "free" },
    });

    render(<TodayPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        "/auth?intent=signin&returnTo=%2Ftoday",
      );
    });
    expect(getFeed).not.toHaveBeenCalled();
  });

  it("loads the feed for members", async () => {
    vi.mocked(getMe).mockResolvedValue({
      session: {
        kind: "member",
        plan: "free",
        email: "a@b.com",
        name: "A",
      },
    });
    vi.mocked(getFeed).mockResolvedValue({ due: [], done: [], groups: [] });
    vi.mocked(getProgress).mockResolvedValue({
      streak: 1,
      heatmap: [],
      activePaths: 0,
      masteredPaths: 0,
    });

    const { findByText } = render(<TodayPage />);
    expect(await findByText("Today feed")).toBeInTheDocument();
  });
});
