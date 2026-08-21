import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DepthPicker } from "@/components/DepthPicker";

describe("DepthPicker", () => {
  it("renders all three depth options", () => {
    render(<DepthPicker step={3} totalSteps={3} onSelect={vi.fn()} />);

    expect(screen.getByText("Essentials")).toBeInTheDocument();
    expect(screen.getByText("Fluent")).toBeInTheDocument();
    expect(screen.getByText("Thorough")).toBeInTheDocument();
    expect(screen.getByText(/Core ideas/)).toBeInTheDocument();
    expect(screen.getByText(/about two weeks/)).toBeInTheDocument();
    expect(screen.getByText(/about a month/)).toBeInTheDocument();
  });

  it("calls onSelect when an option is tapped", () => {
    const onSelect = vi.fn();
    render(<DepthPicker step={3} totalSteps={3} onSelect={onSelect} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Fluent[\s\S]*about two weeks/i }),
    );
    expect(onSelect).toHaveBeenCalledWith("fluent");
  });

  it("renders custom depth option labels when provided", () => {
    render(
      <DepthPicker
        step={3}
        totalSteps={3}
        onSelect={vi.fn()}
        options={[
          {
            slug: "essentials",
            label: "Survival phrases",
            subcopy: "Core phrases · about a week",
          },
          {
            slug: "fluent",
            label: "Conversational basics",
            subcopy: "Everyday exchanges · about two weeks",
          },
          {
            slug: "thorough",
            label: "Structured foundation",
            subcopy: "Grammar + patterns · about a month",
          },
        ]}
      />,
    );

    expect(screen.getByText("Survival phrases")).toBeInTheDocument();
    expect(screen.getByText("Conversational basics")).toBeInTheDocument();
    expect(screen.getByText("Structured foundation")).toBeInTheDocument();
    expect(screen.queryByText("Fluent")).not.toBeInTheDocument();
  });

  it("shows optional details textarea with character counter", () => {
    const onDetailsChange = vi.fn();
    render(
      <DepthPicker
        step={3}
        totalSteps={3}
        onSelect={vi.fn()}
        details="Prior Spanish helps."
        onDetailsChange={onDetailsChange}
        detailsMax={500}
      />,
    );

    expect(
      screen.getByLabelText(/Anything else we should know/i),
    ).toBeInTheDocument();
    expect(screen.getByText("20 / 500")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "New note" },
    });
    expect(onDetailsChange).toHaveBeenCalledWith("New note");
  });
});
