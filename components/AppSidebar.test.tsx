import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppSidebar } from "@/components/AppSidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
}));

vi.mock("@/lib/api/client", () => ({
  getMe: vi.fn().mockResolvedValue({
    session: { kind: "member", plan: "free", name: "Ada Lovelace", email: "ada@example.com" },
  }),
  getProgress: vi.fn().mockResolvedValue({ streak: 5 }),
  getFeed: vi.fn().mockResolvedValue({ due: [{ id: "1" }] }),
}));

describe("AppSidebar", () => {
  it("renders brand rail with nav labels and active home state", async () => {
    render(<AppSidebar />);

    expect(screen.getByText("Daily")).toBeTruthy();
    expect(screen.getByLabelText("Curi")).toBeTruthy();
    expect(screen.getByLabelText("Home")).toHaveAttribute("aria-current", "page");
    expect(screen.getByLabelText("Paths")).toBeTruthy();
    expect(screen.getByLabelText("New")).toBeTruthy();
  });

  it("shows streak footer when streak is positive", async () => {
    render(<AppSidebar />);

    expect(await screen.findByText("5")).toBeTruthy();
    expect(screen.getByRole("link", { name: /5-day streak/ })).toHaveAttribute(
      "href",
      "/progress",
    );
  });
});
