import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/components/Button";

describe("Button", () => {
  it("keeps the same type class family across variants", () => {
    const { rerender } = render(<Button variant="primary">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");

    rerender(<Button variant="secondary">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-secondary");

    rerender(<Button variant="ghost">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-ghost");

    rerender(<Button variant="danger">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-danger");
  });

  it("renders icon-only with accessible name", () => {
    const onClick = vi.fn();
    render(
      <Button
        variant="secondary"
        iconOnly
        icon={<span data-testid="ico">★</span>}
        onClick={onClick}
      >
        Search
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Search" });
    expect(btn).toHaveClass("btn-icon");
    expect(screen.getByTestId("ico")).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it("places leading and trailing icons around the label", () => {
    render(
      <Button
        icon={<span data-testid="left">L</span>}
        iconRight={<span data-testid="right">R</span>}
      >
        Continue
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /Continue/ });
    expect(btn.textContent).toMatch(/L.*Continue.*R/);
  });

  it("keeps type classes while loading", () => {
    render(
      <Button variant="primary" loading>
        Save
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /Loading/ });
    expect(btn).toHaveClass("btn-primary");
    expect(btn).toBeDisabled();
  });

  it("applies size classes with default size", () => {
    const { rerender } = render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-size-default");

    rerender(<Button size="large">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-size-large");

    rerender(<Button size="small">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-size-small");

    rerender(<Button size="compact">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-size-compact");
  });

  it("keeps size class on icon-only buttons", () => {
    render(
      <Button size="small" iconOnly icon={<span>★</span>}>
        Search
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Search" });
    expect(btn).toHaveClass("btn-icon");
    expect(btn).toHaveClass("btn-size-small");
  });
});
