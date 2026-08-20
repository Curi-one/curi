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

  it("renders a completed lesson dimmed with a re-read link", () => {
    render(<LessonFeedCard item={item({ status: "completed" })} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/courses/course-1/lessons/2?from=today",
    );
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders an overdue lesson as tappable with catch up copy", () => {
    render(<LessonFeedCard item={item({ status: "overdue" })} />);
    expect(screen.getByRole("link")).toBeInTheDocument();
    expect(screen.getByText("Catch up")).toBeInTheDocument();
    expect(screen.getByText(/missed yesterday/i)).toBeInTheDocument();
  });

  it("renders a locked lesson with a lock icon and no link", () => {
    render(<LessonFeedCard item={item({ status: "locked" })} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Unlocks tomorrow")).toBeInTheDocument();
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
