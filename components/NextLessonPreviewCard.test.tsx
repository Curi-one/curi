import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NextLessonPreviewCard } from "@/components/NextLessonPreviewCard";

describe("NextLessonPreviewCard", () => {
  it("renders track-mark cover and prominent next lesson title", () => {
    const { container } = render(
      <NextLessonPreviewCard
        courseTopic="Fundraising"
        nextLessonTitle="Dilution basics"
        lessonNumber={2}
        totalLessons={10}
      />,
    );

    expect(screen.getByText(/Up next · Tomorrow/)).toBeInTheDocument();
    expect(screen.getByText("Dilution basics")).toBeInTheDocument();
    expect(
      screen.getByText(/Lesson 3 of 10 · unlocks tomorrow/),
    ).toBeInTheDocument();
    expect(container.querySelector(".complete-next-lesson")).toBeTruthy();
  });
});
