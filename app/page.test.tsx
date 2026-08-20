import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock("@/lib/api/client", () => ({
  getMe: vi.fn().mockResolvedValue({
    session: { kind: "guest", plan: "free" },
  }),
}));

import LandingPage from "@/app/page";

describe("LandingPage", () => {
  it("offers Sign in and Sign up without blocking the topic start CTA", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("link", { name: "Sign in" }),
    ).toHaveAttribute("href", "/auth?intent=signin&returnTo=%2Ftoday");
    expect(
      screen.getByRole("link", { name: "Sign up" }),
    ).toHaveAttribute("href", "/auth?intent=signup&returnTo=%2Ftoday");
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
    expect(screen.getByText("What are you curious about?")).toBeInTheDocument();
  });
});
