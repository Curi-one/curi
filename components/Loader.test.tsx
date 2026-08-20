import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loader } from "@/components/Loader";
import { LoadingState } from "@/components/LoadingState";

describe("Loader", () => {
  it("renders status role and optional label", () => {
    render(<Loader label="Loading feed…" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading feed…")).toBeInTheDocument();
  });
});

describe("LoadingState", () => {
  it("centres the loader with a default label", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
