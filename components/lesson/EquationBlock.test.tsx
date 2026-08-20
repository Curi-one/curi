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
          equation: "API Equation = 1",
          formulaNote: "From payload",
        }}
      />,
    );
    expect(screen.getByText("Working equation")).toBeInTheDocument();
    expect(screen.getByText("API Equation = 1")).toBeInTheDocument();
    expect(screen.getByText("From payload")).toBeInTheDocument();
  });

  it("renders nothing when the API visual has no equation", () => {
    const { container } = render(
      <EquationBlock visual={{ title: "API", caption: "cap" }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
