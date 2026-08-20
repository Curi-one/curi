import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CompleteSheet } from "@/components/CompleteSheet";
import { linkedinShareUrl } from "@/lib/share/lesson-share";

describe("CompleteSheet", () => {
  it("shows path mastered CTAs when pathMastered", () => {
    render(
      <CompleteSheet
        open
        allPathsDoneToday
        pathMastered
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Path mastered")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View in Library" }),
    ).toHaveAttribute("href", "/library?tab=mastered");
    expect(
      screen.getByRole("link", { name: "Back to Today" }),
    ).toBeInTheDocument();
  });

  it("shows back to Today when more paths remain", () => {
    render(
      <CompleteSheet open allPathsDoneToday={false} onClose={vi.fn()} />,
    );
    expect(screen.getByText("Lesson complete.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Today" }),
    ).toBeInTheDocument();
  });

  it("shows Done when all paths done today", () => {
    render(
      <CompleteSheet open allPathsDoneToday onClose={vi.fn()} />,
    );
    expect(screen.getByText("All caught up")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Done" })).toHaveAttribute(
      "href",
      "/today",
    );
  });

  it("renders lesson meta, streak, and tomorrow teaser when provided", () => {
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
    expect(screen.getByText(/Fundraising/)).toBeInTheDocument();
    expect(screen.getByText(/Lesson 2 of 10/)).toBeInTheDocument();
    expect(screen.getByText("What is a valuation?")).toBeInTheDocument();
    expect(screen.getByText("4-day streak")).toBeInTheDocument();
    expect(screen.getByText("Dilution basics")).toBeInTheDocument();
    expect(screen.getByText(/Up next · Tomorrow/)).toBeInTheDocument();
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

  it("hides the insight section entirely when no shareable fact is provided", () => {
    render(
      <CompleteSheet
        open
        allPathsDoneToday={false}
        onClose={vi.fn()}
        courseTopic="Venture Capital"
      />,
    );
    expect(screen.queryByText("Today's insight")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Share on X" })).not.toBeInTheDocument();
  });

  it("shows the insight section only when the lesson API shareable fact is provided", () => {
    render(
      <CompleteSheet
        open
        allPathsDoneToday={false}
        onClose={vi.fn()}
        courseTopic="Venture Capital"
        shareableFact={{
          fact: "Generated fact from this lesson",
          reflection: "Generated reflection",
        }}
      />,
    );
    expect(screen.getByText("Today's insight")).toBeInTheDocument();
    expect(
      screen.getByText(/Generated fact from this lesson/),
    ).toBeInTheDocument();
    expect(screen.getByText("Generated reflection")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Share on X" })).toBeInTheDocument();
  });

  describe("Share on LinkedIn", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("copies the share text and opens LinkedIn", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      render(
        <CompleteSheet
          open
          allPathsDoneToday={false}
          onClose={vi.fn()}
          courseTopic="Venture Capital"
          shareableFact={{
            fact: "Generated fact from this lesson",
            reflection: "Generated reflection",
          }}
        />,
      );
      fireEvent.click(
        screen.getByRole("link", { name: /share on linkedin/i }),
      );

      expect(writeText).toHaveBeenCalled();
      await waitFor(() =>
        expect(openSpy).toHaveBeenCalledWith(
          linkedinShareUrl(),
          "_blank",
          "noopener,noreferrer",
        ),
      );
    });
  });
});
