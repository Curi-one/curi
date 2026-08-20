import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BrowseFilterChips } from "@/components/BrowseFilterChips";

describe("BrowseFilterChips", () => {
  const categories = ["Raising & deal terms", "While you're building"];

  it("renders an All chip plus one per category, marking the active one", () => {
    render(
      <BrowseFilterChips categories={categories} active={null} onChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Raising & deal terms" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "While you're building" }),
    ).toBeInTheDocument();
  });

  it("calls onChange with the category value when a chip is clicked, and null for All", () => {
    const onChange = vi.fn();
    render(
      <BrowseFilterChips
        categories={categories}
        active="Raising & deal terms"
        onChange={onChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "While you're building" }),
    );
    expect(onChange).toHaveBeenCalledWith("While you're building");

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
