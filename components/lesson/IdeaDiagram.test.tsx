import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IdeaDiagram } from "@/components/lesson/IdeaDiagram";
import { getMentalModel } from "@/lib/lessons/mental-models";

describe("IdeaDiagram", () => {
  it("renders curated Surface/Incentive/Trade-off content for a known topic", () => {
    render(<IdeaDiagram topic="Venture Capital" />);
    const model = getMentalModel("Venture Capital");

    expect(screen.getByText("Surface")).toBeInTheDocument();
    expect(screen.getByText("Incentive")).toBeInTheDocument();
    expect(screen.getByText("Trade-off")).toBeInTheDocument();
    expect(screen.getByText(model.surface)).toBeInTheDocument();
    expect(screen.getByText(model.incentive)).toBeInTheDocument();
    expect(screen.getByText(model.tradeoff)).toBeInTheDocument();
  });

  it("falls back to a topic-aware generic model for unknown topics", () => {
    render(<IdeaDiagram topic="Some Random Topic" />);
    expect(
      screen.getByText(/some random topic/i),
    ).toBeInTheDocument();
  });
});
