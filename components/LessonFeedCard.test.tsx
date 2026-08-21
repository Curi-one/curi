import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonFeedCard } from "@/components/LessonFeedCard";
import type { FeedLessonItem } from "@/lib/api/schemas";

function item(overrides: Partial<FeedLessonItem>): FeedLessonItem {
  return {
    id: "id-1",
    courseId: "course-1",
    topic: "Stoicism",
    lessonIndex: 2,
    title: "The dichotomy of control",
    lessonNumber: 3,
    totalLessons: 7,
    daysAgo: 0,
    status: "available",
    ...overrides,
  };
}

const FOOTHOLD =
  "The first foothold: the definition, pressure, and real decision this path is built around.";

describe("LessonFeedCard", () => {
  it("renders an available lesson as a Read now link", () => {
    render(<LessonFeedCard item={item({ status: "available" })} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/courses/course-1/lessons/2?from=today",
    );
    expect(screen.getByText("Read now")).toBeInTheDocument();
  });

  it("shows a content preview under the title, not a generic status blurb", () => {
    render(
      <LessonFeedCard
        item={item({
          status: "available",
          lessonIndex: 0,
          lessonNumber: 1,
          title: "Opening the path",
        })}
      />,
    );
    expect(screen.getByText(FOOTHOLD)).toBeInTheDocument();
    expect(screen.getByText("Lesson 1 of 7")).toBeInTheDocument();
    expect(screen.queryByText(/continue your path/i)).not.toBeInTheDocument();
  });

  it("keeps topic as meta under the title", () => {
    render(<LessonFeedCard item={item({ status: "available" })} />);
    expect(screen.getByText("Stoicism")).toBeInTheDocument();
  });

  it("renders a completed lesson dimmed with a re-read link", () => {
    render(<LessonFeedCard item={item({ status: "completed" })} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/courses/course-1/lessons/2?from=today",
    );
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Lesson 3 of 7")).toBeInTheDocument();
  });

  it("renders an overdue lesson as tappable with catch up action", () => {
    render(<LessonFeedCard item={item({ status: "overdue" })} />);
    expect(screen.getByRole("link")).toBeInTheDocument();
    expect(screen.getByText("Catch up")).toBeInTheDocument();
    expect(screen.queryByText(/continue your path/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/missed yesterday/i)).not.toBeInTheDocument();
  });

  it("renders a locked lesson with display title type, preview, and no link", () => {
    render(
      <LessonFeedCard
        item={item({
          status: "locked",
          lessonIndex: 0,
          lessonNumber: 1,
          title: "Opening the path",
        })}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    const title = screen.getByText("Opening the path");
    expect(title.className).toContain("font-display");
    expect(title.className).not.toContain("font-semibold");
    expect(screen.getByText(FOOTHOLD)).toBeInTheDocument();
    expect(screen.getByText("Unlocks tomorrow")).toBeInTheDocument();
    expect(screen.getByText("Lesson 1 of 7")).toBeInTheDocument();
    expect(screen.queryByText(/continue your path/i)).not.toBeInTheDocument();
  });

  it("uses custom locked copy when provided", () => {
    render(
      <LessonFeedCard
        item={item({ status: "locked" })}
        lockedCopy="Unlocks after today's lesson"
      />,
    );
    expect(
      screen.getByText("Unlocks after today's lesson"),
    ).toBeInTheDocument();
  });
});
