import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonImage } from "@/components/lesson/LessonImage";

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

  it("renders decorative geometry chrome when the API visual has no imageUrl", () => {
    const { container } = render(
      <LessonImage
        visual={{ title: "API visual title", caption: "API visual caption" }}
      />,
    );
    expect(container.querySelector("img")).not.toBeInTheDocument();
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
