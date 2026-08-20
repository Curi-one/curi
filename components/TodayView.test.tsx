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
    expect(screen.getByText("Read now")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("links a completed-today path back to its last completed lesson for re-reading", () => {
    render(
      <TodayView due={due} done={done} streak={3} streakAtRisk={false} />,
    );

    const completedLink = screen.getByRole("link", { name: /Sleep science/ });
    expect(completedLink).toHaveAttribute(
      "href",
      "/courses/b/lessons/0?from=today",
    );
    expect(screen.getByText(/completed today/i)).toBeInTheDocument();
  });

  it("shows welcome headline and full-width action rows when empty", () => {
    render(<TodayView due={[]} done={[]} streak={0} streakAtRisk={false} />);

    expect(screen.getByText("Your daily founder fluency")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Browse founder paths/ }),
    ).toHaveAttribute("href", "/explore");
    expect(
      screen.getByRole("link", { name: /Create a custom path/ }),
    ).toHaveAttribute("href", "/new");
    expect(screen.queryByText("Nothing due today")).not.toBeInTheDocument();
  });
});
