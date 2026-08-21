import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquationBlock } from "@/components/lesson/EquationBlock";

describe("EquationBlock", () => {
  it("renders an API visual equation and formula note when provided", () => {
    render(
      <EquationBlock
        visual={{
          title: "API",
          caption: "cap",
          equation: "Contribution margin explained simply",
          formulaNote: "From payload",
        }}
      />,
    );
    expect(screen.getByText("Working equation")).toBeInTheDocument();
    expect(
      screen.getByText("Contribution margin explained simply"),
    ).toBeInTheDocument();
    expect(screen.getByText("From payload")).toBeInTheDocument();
  });

  it("renders KaTeX markup when the equation looks like math", () => {
    const { container } = render(
      <EquationBlock
        visual={{
          title: "API",
          caption: "cap",
          equation: "E = mc^2",
          formulaNote: "Mass-energy",
        }}
      />,
    );
    expect(screen.getByText("Working equation")).toBeInTheDocument();
    expect(container.querySelector(".katex")).toBeTruthy();
    expect(screen.getByText("Mass-energy")).toBeInTheDocument();
  });

  it("falls back to plain text when KaTeX cannot parse the equation", () => {
    render(
      <EquationBlock
        visual={{
          title: "API",
          caption: "cap",
          equation: "Deal = Economics + Control",
        }}
      />,
    );
    expect(screen.getByText("Deal = Economics + Control")).toBeInTheDocument();
  });

  it("renders nothing when the API visual has no equation", () => {
    const { container } = render(
      <EquationBlock visual={{ title: "API", caption: "cap" }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
