import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LibraryPathCard } from "@/components/LibraryPathCard";
import type { PathSummary } from "@/lib/api/schemas";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/api/client", () => ({
  ApiError: class ApiError extends Error {
    code?: string;
    status: number;
    constructor(message: string, status: number, code?: string) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
  patchRestoreCourse: vi.fn(),
}));

import { ApiError, patchRestoreCourse } from "@/lib/api/client";

const path: PathSummary = {
  id: "course-shelved",
  topic: "Constitutional Law",
  progress: 2,
  totalLessons: 7,
  depth: "fluent",
};

describe("LibraryPathCard", () => {
  beforeEach(() => {
    mockPush.mockReset();
    vi.mocked(patchRestoreCourse).mockReset();
  });

  it("renders square track-mark cover with progress line", () => {
    const { container } = render(
      <LibraryPathCard path={path} tab="exploring" />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/library/course-shelved");
    expect(link.className).toMatch(/aspect-square/);
    expect(screen.getByText("Constitutional Law")).toBeInTheDocument();
    // Progress reads in the mark foreground, not Vermilion: a grid renders
    // this card N times and the accent budget is once per screen (§1.2).
    expect(container.querySelector(".bg-mark-fg\\/75")).toBeTruthy();
    expect(container.querySelector(".bg-accent")).toBeNull();
  });

  it("spends no Vermilion at rest — a grid would multiply it by card count", () => {
    const { container } = render(
      <LibraryPathCard path={path} tab="exploring" />,
    );
    expect(container.querySelector(".text-accent")).toBeNull();
    expect(container.querySelector(".bg-accent")).toBeNull();
    // Hover is allowed to carry the accent: it resolves to one card at a time.
    expect(container.innerHTML).toContain("group-hover:text-accent");
  });

  it("draws on the mark field with theme-independent tones", () => {
    const { container } = render(
      <LibraryPathCard path={path} tab="exploring" />,
    );
    // `text-paper` here resolved to the page background, which becomes Ink in
    // dark mode — the card's own field is Ink, so the text disappeared.
    expect(container.querySelector(".text-paper")).toBeNull();
    expect(screen.getByRole("link").className).toMatch(/text-mark-fg/);
  });

  it("shows Shelved chip and Continue restores then navigates", async () => {
    vi.mocked(patchRestoreCourse).mockResolvedValue({
      ok: true,
      courseId: path.id,
    });
    render(<LibraryPathCard path={path} tab="shelved" />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await vi.waitFor(() => {
      expect(patchRestoreCourse).toHaveBeenCalledWith(path.id);
    });
    expect(mockPush).toHaveBeenCalledWith(
      "/courses/course-shelved/lessons/2?from=library",
    );
  });

  it("sends user to upgrade when restore hits path_limit", async () => {
    vi.mocked(patchRestoreCourse).mockRejectedValue(
      new ApiError("Free plan allows up to 2 active paths.", 403, "path_limit"),
    );
    render(<LibraryPathCard path={path} tab="shelved" />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/upgrade");
    });
  });
});
