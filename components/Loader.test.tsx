import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loader } from "@/components/Loader";
import { LoadingState } from "@/components/LoadingState";

describe("Loader", () => {
  it("renders branded wordmark loader with sweeping line", () => {
    const { container } = render(<Loader label="Loading feed…" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading feed…")).toBeInTheDocument();
    expect(container.querySelector(".loader-wordmark-line")).toBeTruthy();
    expect(container.querySelector(".font-display")).toBeTruthy();
  });
});

describe("LoadingState", () => {
  it("centres the loader with a default label", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
