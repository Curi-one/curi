import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquationBlock } from "@/components/lesson/EquationBlock";

describe("EquationBlock", () => {
  it("renders working equation label and formula note", () => {
    const { container } = render(
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
    expect(screen.getByText("From payload")).toBeInTheDocument();
    // Plain English still goes through KaTeX as identifiers when parseable.
    expect(container.querySelector(".katex")).toBeTruthy();
  });

  it("renders KaTeX markup for compact math", () => {
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

  it("renders KaTeX for symbolic equations including plain identities", () => {
    const { container } = render(
      <EquationBlock
        visual={{
          title: "API",
          caption: "cap",
          equation: "Deal = Economics + Control",
        }}
      />,
    );
    expect(container.querySelector(".katex")).toBeTruthy();
  });

  it("falls back to plain text when KaTeX cannot parse the equation", () => {
    render(
      <EquationBlock
        visual={{
          title: "API",
          caption: "cap",
          equation: "\\frac{a{b}",
        }}
      />,
    );
    expect(screen.getByText("\\frac{a{b}")).toBeInTheDocument();
    expect(document.querySelector(".katex")).toBeNull();
  });

  it("renders nothing when the API visual has no equation", () => {
    const { container } = render(
      <EquationBlock visual={{ title: "API", caption: "cap" }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
