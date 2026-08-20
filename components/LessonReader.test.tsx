import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LessonReader } from "@/components/LessonReader";
import type { LessonResponse } from "@/lib/api/schemas";

const lesson: LessonResponse = {
  title: "Why unit economics matter before you scale",
  body: [
    "The first useful thing to know about unit economics is that growth without contribution margin is just a more expensive way to fail. [1]",
    "Today’s idea is simple: every founder concept has a surface and a consequence.",
    "Think of unit economics as a room with two doors — explanation and judgment.",
    "Do not ask only what this means. Ask what decision this changes.",
  ],
  sources: [
    {
      title: "a16z — Unit Economics",
      url: "https://a16z.com/unit-economics/",
    },
    {
      title: "First Round — Startup Metrics",
      url: "https://firstround.com/startup-metrics/",
    },
  ],
};

describe("LessonReader", () => {
  it("renders title, takeaways label, Sources, and Take the quiz", () => {
    render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        totalLessons={10}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Why unit economics matter before you scale",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/things from this lesson/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sources/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /take the quiz/i }),
    ).toBeInTheDocument();
  });

  it("opens sources panel from Sources button", () => {
    render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /sources/i }));
    expect(screen.getByText(/these references informed/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /a16z — Unit Economics/i }),
    ).toBeInTheDocument();
  });

  it("renders inline citation markers as clickable buttons", () => {
    render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /view source 1/i }),
    ).toBeInTheDocument();
  });

  it("clicking a citation opens the sources drawer and highlights the matching source", () => {
    render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /view source 1/i }));

    expect(screen.getByText(/these references informed/i)).toBeInTheDocument();
    const highlightedLink = screen.getByRole("link", {
      name: /a16z — Unit Economics/i,
    });
    expect(highlightedLink).toHaveClass("border-accent");

    const otherLink = screen.getByRole("link", {
      name: /First Round — Startup Metrics/i,
    });
    expect(otherLink).not.toHaveClass("border-accent");
  });

  it("clears the citation highlight when the sources drawer is closed", () => {
    render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /view source 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /close sources/i }));
    fireEvent.click(screen.getByRole("button", { name: /sources/i }));

    const link = screen.getByRole("link", {
      name: /a16z — Unit Economics/i,
    });
    expect(link).not.toHaveClass("border-accent");
  });
});
