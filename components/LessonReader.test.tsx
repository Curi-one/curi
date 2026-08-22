import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonReader } from "@/components/LessonReader";
import type { LessonResponse } from "@/lib/api/schemas";
import { clearReaderThemeFromDocument } from "@/lib/lessons/reader-settings";
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
  afterEach(() => {
    clearReaderThemeFromDocument();
    localStorage.clear();
    document.documentElement.removeAttribute("style");
    document.body.removeAttribute("style");
  });
  it("renders title, Sources, and Take the quiz from API data alone", () => {
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
    expect(
      screen.getByRole("button", { name: /sources/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /take the quiz/i }),
    ).toBeInTheDocument();
  });

  it("renders markdown body content in order with no peeled-off 'So what?' section", () => {
    const { container } = render(
      <LessonReader
        lesson={{
          ...lesson,
          body: [
            "The first useful thing to know about unit economics is that growth without contribution margin is just a more expensive way to fail. [1]",
            "## Two doors",
            "Think of unit economics as a room with two doors — explanation and judgment.",
            "Do not ask only what this means. Ask what decision this changes.",
          ],
        }}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    const text = container.textContent ?? "";
    expect(text).toMatch(/room with two doors/);
    expect(text).toMatch(/Do not ask only what this means/);
    expect(
      screen.getByRole("heading", { level: 2, name: "Two doors" }),
    ).toBeInTheDocument();
    const lastParaIndex = text.indexOf("Do not ask only what this means");
    const firstParaIndex = text.indexOf("growth without contribution margin");
    expect(lastParaIndex).toBeGreaterThan(firstParaIndex);
    expect(screen.queryByText("So what?")).not.toBeInTheDocument();
  });

  it("applies the selected reader theme to documentElement while mounted", async () => {
    localStorage.setItem(
      "curi-reader-settings",
      JSON.stringify({ size: "m", font: "sans", theme: "dark", bionic: false }),
    );

    const { unmount } = render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue("--color-ink").trim(),
      ).toBe("#FAF9F5");
    });

    unmount();
    expect(
      document.documentElement.style.getPropertyValue("--color-ink"),
    ).toBe("");
  });

  it("hides takeaways, shareable fact, and visuals when the API omits them", () => {
    render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    expect(
      screen.queryByText(/things from this lesson/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Shareable fact")).not.toBeInTheDocument();
    expect(screen.queryByText("Visual note")).not.toBeInTheDocument();
    expect(screen.queryByText("Working equation")).not.toBeInTheDocument();
  });

  it("keeps the lesson title section sticky while scrolling", () => {
    render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    expect(screen.getByTestId("lesson-title-sticky")).toHaveClass(
      "lesson-title-sticky",
    );
  });

  it("opens branded sources panel from Sources button", () => {
    render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /sources/i }));
    expect(screen.getByRole("dialog")).toHaveClass("sources-panel");
    expect(screen.getByText(/2 references/i)).toBeInTheDocument();
    expect(screen.getByTestId("lesson-source-1")).toBeInTheDocument();
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
    expect(highlightedLink).toHaveClass("border-ink");

    const otherLink = screen.getByRole("link", {
      name: /First Round — Startup Metrics/i,
    });
    expect(otherLink).not.toHaveClass("border-ink");
  });

  it("toggles takeaways accordion with brand motion panel", () => {
    render(
      <LessonReader
        lesson={{
          ...lesson,
          takeaways: ["Takeaway alpha", "Takeaway beta", "Takeaway gamma"],
        }}
        lessonIndex={0}
        topic="Unit Economics"
        onStartQuiz={vi.fn()}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /3 things from this lesson/i,
    });
    const panel = screen.getByTestId("lesson-takeaways-accordion");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(panel).toHaveClass("is-open");
    expect(screen.getByText("Takeaway alpha")).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toHaveClass("is-open");
  });

  it("shows API-provided takeaways, shareable fact, and visuals when present in the payload", () => {
    render(
      <LessonReader
        lesson={{
          ...lesson,
          takeaways: [
            "API takeaway one",
            "API takeaway two",
            "API takeaway three",
          ],
          shareableFact: {
            fact: "API shareable fact about this lesson",
            reflection: "API reflection tied to the path",
          },
          visuals: [
            {
              title: "API visual title",
              caption: "API visual caption",
              imageUrl: "https://example.com/diagram.png",
              equation: "API = Visual \\times Equation",
            },
          ],
        }}
        lessonIndex={0}
        topic="Some Random Topic"
        onStartQuiz={vi.fn()}
      />,
    );

    expect(screen.getByText("API takeaway one")).toBeInTheDocument();
    expect(screen.getByText("API takeaway two")).toBeInTheDocument();
    expect(screen.getByText("API takeaway three")).toBeInTheDocument();
    expect(
      screen.getByText(/API shareable fact about this lesson/),
    ).toBeInTheDocument();
    expect(screen.getByText("API visual title")).toBeInTheDocument();
    expect(screen.queryByText("Visual note")).not.toBeInTheDocument();
    expect(screen.getByText("Working equation")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "API visual title" }),
    ).toHaveAttribute("src", "https://example.com/diagram.png");
  });

  it("renders equation-only visuals without a glyph LessonImage card", () => {
    render(
      <LessonReader
        lesson={{
          ...lesson,
          visuals: [
            {
              title: "Equation only",
              caption: "Should not become a visual note card",
              equation: "E = mc^2",
            },
          ],
        }}
        lessonIndex={0}
        topic="Physics"
        onStartQuiz={vi.fn()}
      />,
    );

    expect(screen.getByText("Working equation")).toBeInTheDocument();
    expect(screen.queryByText("Equation only")).not.toBeInTheDocument();
    expect(screen.queryByText("Visual note")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lesson-image-fallback")).not.toBeInTheDocument();
  });

  it("skips caption-only visuals with no image and no equation", () => {
    render(
      <LessonReader
        lesson={{
          ...lesson,
          visuals: [
            {
              title: "Empty visual note",
              caption: "Caption with nothing to show",
            },
          ],
        }}
        lessonIndex={0}
        topic="Topic"
        onStartQuiz={vi.fn()}
      />,
    );

    expect(screen.queryByText("Empty visual note")).not.toBeInTheDocument();
    expect(screen.queryByText("Visual note")).not.toBeInTheDocument();
    expect(screen.queryByText("Working equation")).not.toBeInTheDocument();
  });

  it("does not show any visual when the API returns no visuals, regardless of topic", () => {
    render(
      <LessonReader
        lesson={lesson}
        lessonIndex={0}
        topic="Some Random Topic"
        onStartQuiz={vi.fn()}
      />,
    );

    expect(screen.queryByText("Visual note")).not.toBeInTheDocument();
    expect(screen.queryByText("Working equation")).not.toBeInTheDocument();
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
