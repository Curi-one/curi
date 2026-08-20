import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquationBlock } from "@/components/lesson/EquationBlock";

describe("EquationBlock", () => {
  it("renders the equation and formula note for a topic with a formula", () => {
    const { container } = render(<EquationBlock topic="Unit Economics" />);
    expect(screen.getByText("Working equation")).toBeInTheDocument();
    expect(container.textContent).toMatch(/CAC/);
  });

  it("renders nothing for a topic without a formula", () => {
    const { container } = render(<EquationBlock topic="Some Unknown Topic" />);
    expect(container).toBeEmptyDOMElement();
  });
});
