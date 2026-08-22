import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loader } from "@/components/Loader";
import { LoadingState } from "@/components/LoadingState";

describe("Loader", () => {
  it("renders wordmark without underline and a sweeping line instead of visible label", () => {
    const { container } = render(<Loader label="Loading feed…" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Loading feed…");
    expect(screen.queryByText("Loading feed…")).not.toBeInTheDocument();
    expect(container.querySelector(".loader-line-sweep")).toBeTruthy();
    expect(container.querySelector(".bg-accent")).toBeNull();
    expect(container.querySelector(".font-display")).toBeTruthy();
  });
});

describe("LoadingState", () => {
  it("centres the loader and keeps the label for screen readers only", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading…");
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });
});
