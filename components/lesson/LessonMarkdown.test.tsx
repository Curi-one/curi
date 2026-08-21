import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LessonMarkdown } from "@/components/lesson/LessonMarkdown";

describe("LessonMarkdown", () => {
  it("renders headings, lists, and bold text from markdown", () => {
    render(
      <LessonMarkdown
        markdown={`## Core idea

- First point
- Second point

This has **bold emphasis** in a paragraph.`}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Core idea" }),
    ).toBeInTheDocument();
    expect(screen.getByText("First point")).toBeInTheDocument();
    expect(screen.getByText("Second point")).toBeInTheDocument();
    expect(screen.getByText("bold emphasis").closest("strong")).toBeTruthy();
  });

  it("renders citation markers as tappable buttons", () => {
    const onCitationClick = vi.fn();
    render(
      <LessonMarkdown
        markdown="Growth without margin fails. [1]"
        onCitationClick={onCitationClick}
      />,
    );

    const btn = screen.getByRole("button", { name: /view source 1/i });
    fireEvent.click(btn);
    expect(onCitationClick).toHaveBeenCalledWith(0);
  });

  it("renders inline math via KaTeX", () => {
    const { container } = render(
      <LessonMarkdown markdown="Energy is $E=mc^2$ in this model." />,
    );

    expect(container.querySelector(".katex")).toBeTruthy();
  });

  it("renders math wrapped in \\[...\\] after delimiter normalization", () => {
    const { container } = render(
      <LessonMarkdown markdown={"See \\[E = mc^2\\] in physics."} />,
    );
    expect(container.querySelector(".katex")).toBeTruthy();
    expect(container.textContent).not.toMatch(/\\\[/);
  });

  it("applies bionic reading only to plain text segments", () => {
    const { container } = render(
      <LessonMarkdown markdown="Reading helps learning." bionic />,
    );

    expect(container.querySelector("strong.font-semibold")).toBeTruthy();
  });
});
