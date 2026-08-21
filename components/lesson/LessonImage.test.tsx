import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonImage } from "@/components/lesson/LessonImage";
import { buildTrackMark } from "@/lib/ui/topic-swatch";

describe("LessonImage", () => {
  it("renders the API visual title and caption", () => {
    render(
      <LessonImage
        visual={{ title: "API visual title", caption: "API visual caption" }}
      />,
    );
    expect(screen.getByText("Visual note")).toBeInTheDocument();
    expect(screen.getByText("API visual title")).toBeInTheDocument();
    expect(screen.getByText("API visual caption")).toBeInTheDocument();
  });

  it("renders greyscale topic art fallback when the API visual has no imageUrl", () => {
    const topic = "Constitutional Law";
    const mark = buildTrackMark(topic);
    const { container } = render(
      <LessonImage
        visual={{ title: topic, caption: "API visual caption" }}
      />,
    );
    expect(container.querySelector("img")).not.toBeInTheDocument();
    const fallback = screen.getByTestId("lesson-image-fallback");
    expect(fallback).toBeInTheDocument();
    // No vermilion radial fills in geometric imagery (BRAND §6.3)
    expect(fallback.innerHTML).not.toMatch(/193,\s*18,\s*31|#C1121F/i);
    expect(fallback.textContent).toContain(mark.glyph);
  });

  it("renders the real image when the API visual provides an imageUrl", () => {
    render(
      <LessonImage
        visual={{
          title: "API visual title",
          caption: "API visual caption",
          imageUrl: "https://example.com/figure.png",
        }}
      />,
    );
    const img = screen.getByRole("img", { name: "API visual title" });
    expect(img).toHaveAttribute("src", "https://example.com/figure.png");
  });
});
