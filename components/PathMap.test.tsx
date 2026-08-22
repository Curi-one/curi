import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PathMap } from "@/components/PathMap";

const nodes = [
  { index: 0, title: "Intro", status: "read" as const },
  { index: 1, title: "Core ideas", status: "today" as const },
  { index: 2, title: "Next up", status: "locked" as const },
];

describe("PathMap", () => {
  it("renders prototype-style lesson rows with status and action labels", () => {
    render(<PathMap courseId="course-1" nodes={nodes} />);
    expect(screen.getByText("Lesson 1")).toBeInTheDocument();
    expect(screen.getByText("Intro")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Intro/ })).toHaveAttribute(
      "href",
      "/courses/course-1/lessons/0?from=library",
    );
    expect(screen.getByRole("link", { name: /Core ideas/ })).toHaveAttribute(
      "href",
      "/courses/course-1/lessons/1?from=library",
    );
    expect(screen.queryByText("Next up")?.closest("a")).toBeNull();
  });

  it("uses divide-y container", () => {
    const { container } = render(
      <PathMap courseId="course-1" nodes={nodes} readOnly />,
    );
    expect(container.firstChild).toHaveClass("divide-y");
  });
});
