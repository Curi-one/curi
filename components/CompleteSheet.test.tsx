import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompleteSheet } from "@/components/CompleteSheet";

describe("CompleteSheet", () => {
  it("shows path mastered CTAs when pathMastered", () => {
    render(
      <CompleteSheet
        open
        allPathsDoneToday
        pathMastered
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Path mastered")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View in Library" }),
    ).toHaveAttribute("href", "/library?tab=mastered");
  });

  it("shows back to Today when more paths remain", () => {
    render(
      <CompleteSheet open allPathsDoneToday={false} onClose={vi.fn()} />,
    );
    expect(screen.getByText("Nice work")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Today" }),
    ).toBeInTheDocument();
  });
});
