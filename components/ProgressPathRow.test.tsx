import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressPathRow } from "@/components/ProgressPathRow";
import type { PathSummary } from "@/lib/api/schemas";

const path: PathSummary = {
  id: "course-1",
  topic: "Venture capital",
  progress: 3,
  totalLessons: 10,
  depth: "fluent",
};

describe("ProgressPathRow", () => {
  it("renders track-mark cover and red progress bar", () => {
    const { container } = render(<ProgressPathRow path={path} />);
    expect(screen.getByText("Venture capital")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/library/course-1");
    expect(container.querySelector(".bg-accent")).toBeTruthy();
  });

  it("shows mastered copy when mastered", () => {
    render(<ProgressPathRow path={path} mastered />);
    expect(screen.getByText(/Mastered/)).toBeInTheDocument();
  });
});
