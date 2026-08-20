import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DepthPicker } from "@/components/DepthPicker";

describe("DepthPicker", () => {
  it("renders all three depth options", () => {
    render(
      <DepthPicker step={3} totalSteps={3} onSelect={vi.fn()} />,
    );

    expect(screen.getByText("Essentials")).toBeInTheDocument();
    expect(screen.getByText("Fluent")).toBeInTheDocument();
    expect(screen.getByText("Thorough")).toBeInTheDocument();
    expect(screen.getByText(/Core ideas/)).toBeInTheDocument();
    expect(screen.getByText(/about two weeks/)).toBeInTheDocument();
    expect(screen.getByText(/about a month/)).toBeInTheDocument();
  });

  it("calls onSelect when an option is tapped", () => {
    const onSelect = vi.fn();
    render(
      <DepthPicker step={3} totalSteps={3} onSelect={onSelect} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Fluent[\s\S]*about two weeks/i }),
    );
    expect(onSelect).toHaveBeenCalledWith("fluent");
  });
});
