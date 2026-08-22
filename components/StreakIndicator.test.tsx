import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StreakIndicator, StreakLabel } from "@/components/StreakIndicator";

describe("StreakIndicator", () => {
  it("heats from ember to burning over three days", () => {
    const { container: day1 } = render(<StreakIndicator streak={1} />);
    expect(day1.querySelector(".streak-heat-ember")).toBeTruthy();
    expect(day1.querySelector(".streak-heat-burn")).toBeNull();

    const { container: day3 } = render(<StreakIndicator streak={3} />);
    expect(day3.querySelector(".streak-heat-burning")).toBeTruthy();
    expect(day3.querySelector(".streak-heat-burn")).toBeTruthy();
  });

  it("renders hyphenated streak label copy", () => {
    render(<StreakLabel streak={5} atRisk />);
    expect(screen.getByText("5-day streak")).toBeInTheDocument();
  });
});
