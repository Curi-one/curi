import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodayView } from "@/components/TodayView";
import type { PathSummary } from "@/lib/api/schemas";

const due: PathSummary[] = [
  {
    id: "a",
    topic: "Stoicism",
    depth: "fluent",
    progress: 1,
    totalLessons: 14,
  },
];

const done: PathSummary[] = [
  {
    id: "b",
    topic: "Sleep science",
    depth: "essentials",
    progress: 1,
    totalLessons: 7,
  },
];

describe("TodayView", () => {
  it("groups due and done paths into separate sections", () => {
    render(
      <TodayView due={due} done={done} streak={3} streakAtRisk={false} />,
    );

    expect(screen.getByText("Still to read")).toBeInTheDocument();
    expect(screen.getByText("Already today")).toBeInTheDocument();
    expect(screen.getByText("Stoicism")).toBeInTheDocument();
    expect(screen.getByText("Sleep science")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 still to read")).toBeInTheDocument();
  });

  it("shows Explore CTA when empty", () => {
    render(<TodayView due={[]} done={[]} streak={0} streakAtRisk={false} />);

    expect(screen.getByText("No paths yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore paths" })).toHaveAttribute(
      "href",
      "/explore",
    );
  });
});
