import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/components/design-system/DesignSystemShowcase", () => ({
  DesignSystemShowcase: ({ env }: { env: string }) => (
    <div>Design system · {env}</div>
  ),
}));

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(),
}));

import { notFound } from "next/navigation";
import DesignSystemPage from "@/app/design-system/page";
import { getEnv } from "@/lib/env";

describe("DesignSystemPage", () => {
  beforeEach(() => {
    vi.mocked(notFound).mockClear();
    vi.mocked(getEnv).mockReset();
  });

  it("renders on staging", () => {
    vi.mocked(getEnv).mockReturnValue({
      APP_ENV: "staging",
    } as ReturnType<typeof getEnv>);

    render(DesignSystemPage());
    expect(screen.getByText("Design system · staging")).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("calls notFound on production", () => {
    vi.mocked(getEnv).mockReturnValue({
      APP_ENV: "production",
    } as ReturnType<typeof getEnv>);

    expect(() => DesignSystemPage()).toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
