import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingToggle } from "@/components/SettingToggle";
import { SettingChips } from "@/components/SettingChips";

describe("SettingToggle", () => {
  it("reflects checked state and toggles on click", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SettingToggle
        label="Send daily email"
        hint="One email per day"
        checked={false}
        onChange={onChange}
      />,
    );

    const sw = screen.getByRole("switch", { name: "Send daily email" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);

    const track = sw.querySelector(".setting-toggle-track");
    expect(track).toBeTruthy();
    expect(track?.querySelector(".rounded-full")).toBeNull();

    rerender(
      <SettingToggle
        label="Send daily email"
        checked={true}
        onChange={onChange}
      />,
    );
    expect(
      screen.getByRole("switch", { name: "Send daily email" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("switch", { name: "Send daily email" }).querySelector(
        ".setting-toggle-track.is-checked",
      ),
    ).toBeTruthy();
  });
});

describe("SettingChips", () => {
  it("supports string and value/label options", () => {
    const onChange = vi.fn();
    render(
      <SettingChips
        label="How far do you want to go?"
        value="Standard"
        onChange={onChange}
        options={[
          { value: "Quick", label: "A taste · ~2 min" },
          { value: "Standard", label: "The essentials · ~5 min" },
          "Deep",
        ]}
      />,
    );

    expect(screen.getByText("A taste · ~2 min")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "The essentials · ~5 min" }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "A taste · ~2 min" }));
    expect(onChange).toHaveBeenCalledWith("Quick");

    fireEvent.click(screen.getByRole("button", { name: "Deep" }));
    expect(onChange).toHaveBeenCalledWith("Deep");
  });
});
