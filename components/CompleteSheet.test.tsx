import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompleteSheet } from "@/components/CompleteSheet";

describe("CompleteSheet", () => {
  it("shows path mastered CTAs when pathMastered", () => {
    render(
      <CompleteSheet open allPathsDoneToday pathMastered onClose={vi.fn()} />,
    );
    expect(screen.getByText("Path mastered")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View in Library" }),
    ).toHaveAttribute("href", "/library?tab=mastered");
    expect(
      screen.getByRole("link", { name: "Back to Today" }),
    ).toBeInTheDocument();
  });

  it("does not show next-lesson preview when path is mastered", () => {
    render(
      <CompleteSheet
        open
        allPathsDoneToday
        pathMastered
        onClose={vi.fn()}
        nextLessonTitle="Should not appear"
        courseTopic="Fundraising"
        lessonNumber={10}
        totalLessons={10}
      />,
    );
    expect(screen.queryByText(/Up next/)).not.toBeInTheDocument();
    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
    expect(screen.queryByText(/unlocks tomorrow/)).not.toBeInTheDocument();
  });

  it("shows back to Today when more paths remain", () => {
    render(<CompleteSheet open allPathsDoneToday={false} onClose={vi.fn()} />);
    expect(screen.getByText("Lesson complete.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Today" }),
    ).toBeInTheDocument();
  });

  it("shows Done when all paths done today", () => {
    render(<CompleteSheet open allPathsDoneToday onClose={vi.fn()} />);
    expect(screen.getByText("All caught up")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Done" })).toHaveAttribute(
      "href",
      "/today",
    );
  });

  it("renders lesson meta, streak, and next-lesson preview as primary content", () => {
    render(
      <CompleteSheet
        open
        allPathsDoneToday
        onClose={vi.fn()}
        streak={4}
        lessonTitle="What is a valuation?"
        courseTopic="Fundraising"
        lessonNumber={2}
        totalLessons={10}
        nextLessonTitle="Dilution basics"
      />,
    );
    expect(screen.getAllByText(/Fundraising/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Lesson 2 of 10/)).toBeInTheDocument();
    expect(screen.getByText("What is a valuation?")).toBeInTheDocument();
    expect(screen.getByText("4-day streak")).toBeInTheDocument();
    expect(screen.getByText(/Up next · Tomorrow/)).toBeInTheDocument();
    expect(screen.getByText("Dilution basics")).toBeInTheDocument();
    expect(
      screen.getByText(/Lesson 3 of 10 · unlocks tomorrow/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Today's insight")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Share on X" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Share on LinkedIn" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Copy text")).not.toBeInTheDocument();
  });

  it("shows topic cover art in the next-lesson preview when courseTopic is set", () => {
    const { container } = render(
      <CompleteSheet
        open
        allPathsDoneToday={false}
        onClose={vi.fn()}
        courseTopic="Fundraising"
        lessonNumber={1}
        totalLessons={8}
        nextLessonTitle="Cap tables"
      />,
    );
    expect(screen.getByText("Cap tables")).toBeInTheDocument();
    expect(
      screen.getByText(/Lesson 2 of 8 · unlocks tomorrow/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/A short look ahead so you know what tomorrow holds/),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".complete-next-lesson")).toBeTruthy();
  });

  it("uses lesson-number title framing when provided and paths remain", () => {
    render(
      <CompleteSheet
        open
        allPathsDoneToday={false}
        onClose={vi.fn()}
        lessonNumber={1}
      />,
    );
    expect(screen.getByText("Lesson 1 complete.")).toBeInTheDocument();
  });

  it("shows next-lesson preview as hero when all caught up with a next title", () => {
    render(
      <CompleteSheet
        open
        allPathsDoneToday
        onClose={vi.fn()}
        lessonNumber={3}
        totalLessons={12}
        nextLessonTitle="Term sheets"
        courseTopic="Fundraising"
      />,
    );
    expect(screen.getByText("All caught up")).toBeInTheDocument();
    expect(screen.getByText(/Up next · Tomorrow/)).toBeInTheDocument();
    expect(screen.getByText("Term sheets")).toBeInTheDocument();
    expect(
      screen.getByText(/Lesson 4 of 12 · unlocks tomorrow/),
    ).toBeInTheDocument();
  });

  it("shows a calm placeholder preview when there is no nextLessonTitle", () => {
    render(
      <CompleteSheet
        open
        allPathsDoneToday={false}
        onClose={vi.fn()}
        lessonNumber={2}
        totalLessons={10}
      />,
    );
    expect(screen.getByText(/Up next · Tomorrow/)).toBeInTheDocument();
    expect(screen.getByText(/Your next lesson/)).toBeInTheDocument();
    expect(screen.getByText(/unlocks tomorrow/)).toBeInTheDocument();
    expect(screen.queryByText("Today's insight")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Share on X" }),
    ).not.toBeInTheDocument();
  });
});
