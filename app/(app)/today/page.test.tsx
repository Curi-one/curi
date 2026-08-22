import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor, screen } from "@testing-library/react";

const replace = vi.fn();
const searchGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => ({ get: searchGet }),
}));

vi.mock("@/lib/api/client", () => ({
  getMe: vi.fn(),
  getFeed: vi.fn(),
  getProgress: vi.fn(),
  getNotes: vi.fn(),
  getPreferences: vi.fn(),
  invalidateClientCache: vi.fn(),
}));

vi.mock("@/components/TodayView", () => ({
  TodayView: ({
    upgradeConfirmed,
  }: {
    upgradeConfirmed?: boolean;
  }) => (
    <div>
      Today feed
      {upgradeConfirmed ? <span>Academy is active</span> : null}
    </div>
  ),
}));

import {
  getFeed,
  getMe,
  getNotes,
  getPreferences,
  getProgress,
  invalidateClientCache,
} from "@/lib/api/client";
import TodayPage from "@/app/(app)/today/page";

describe("TodayPage auth gate", () => {
  beforeEach(() => {
    replace.mockReset();
    searchGet.mockReturnValue(null);
    vi.mocked(invalidateClientCache).mockReset();
    vi.mocked(getNotes).mockResolvedValue({
      decks: [],
      stats: { deckCount: 0, cardCount: 0, dueCount: 0, reviewedCount: 0 },
    });
    vi.mocked(getPreferences).mockResolvedValue({
      preferences: {
        seq: "straight",
        anchor: "example",
        length: "medium",
        rigor: "clean",
        jargon: "always",
        emailEnabled: false,
        emailTime: "morning",
        emailFormat: "Curiosity",
        emailWeekends: true,
        emailWeeklyDigest: false,
        notesAutoSave: true,
        notesShowDueOnToday: true,
      },
    });
  });

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

  it("shows upgrade confirmation and strips ?upgraded=1", async () => {
    searchGet.mockImplementation((key: string) =>
      key === "upgraded" ? "1" : null,
    );
    vi.mocked(getMe).mockResolvedValue({
      session: {
        kind: "member",
        plan: "academy",
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

    render(<TodayPage />);

    await waitFor(() => {
      expect(invalidateClientCache).toHaveBeenCalledWith(["/api/me"]);
      expect(replace).toHaveBeenCalledWith("/today", { scroll: false });
    });
    expect(await screen.findByText("Academy is active")).toBeInTheDocument();
  });
});
