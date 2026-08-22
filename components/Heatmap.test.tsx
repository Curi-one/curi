import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Heatmap } from "@/components/Heatmap";
import { localDateKey } from "@/lib/progress/heatmap-grid";

const TODAY = new Date(2026, 7, 22);

describe("Heatmap", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders activity on today's calendar cell", () => {
    const key = localDateKey(TODAY);
    const { container } = render(
      <Heatmap activityByDay={{ [key]: 2 }} streak={3} />,
    );

    expect(screen.getByText("Lesson rhythm")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(container.querySelector(".heatmap-cell-2")).toBeTruthy();
    expect(container.querySelector(".heatmap-cell-today")).toBeTruthy();
  });

  it("falls back to dates array when activityByDay is empty", () => {
    const key = localDateKey(TODAY);
    const { container } = render(<Heatmap dates={[key]} streak={1} />);
    expect(container.querySelector(".heatmap-cell-1")).toBeTruthy();
  });
});
