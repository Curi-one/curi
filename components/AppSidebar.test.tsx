import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppSidebar } from "@/components/AppSidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
}));

vi.mock("@/lib/api/client", () => ({
  getMe: vi.fn().mockResolvedValue({
    session: {
      kind: "member",
      plan: "free",
      name: "Ada Lovelace",
      email: "ada@example.com",
    },
  }),
}));

describe("AppSidebar", () => {
  it("renders icon rail with accessible labels and active home state", () => {
    render(<AppSidebar />);

    expect(screen.getByLabelText("Curi")).toBeTruthy();
    expect(screen.getByLabelText("Home")).toHaveAttribute("aria-current", "page");
    expect(screen.getByLabelText("Paths")).toBeTruthy();
    expect(screen.getByLabelText("New")).toBeTruthy();
    expect(screen.queryByText("Daily")).toBeNull();
  });

  it("shows profile avatar only in footer", async () => {
    render(<AppSidebar />);

    expect(await screen.findByLabelText("Ada Lovelace")).toBeTruthy();
    expect(screen.queryByText("Upgrade")).toBeNull();
    expect(screen.queryByRole("link", { name: /streak/i })).toBeNull();
  });
});
