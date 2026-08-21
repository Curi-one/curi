import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SCROLL_SPEED_FACTOR,
  dampedDelta,
  findScrollParent,
} from "@/lib/ui/scroll-damping";

describe("scroll-damping", () => {
  it("uses 90% of native wheel delta", () => {
    expect(SCROLL_SPEED_FACTOR).toBe(0.9);
    expect(dampedDelta(100)).toBe(90);
    expect(dampedDelta(-40)).toBe(-36);
  });

  it("findScrollParent returns the nearest overflow scroll ancestor", () => {
    const outer = document.createElement("div");
    outer.style.overflowY = "auto";
    Object.defineProperty(outer, "scrollHeight", { value: 400 });
    Object.defineProperty(outer, "clientHeight", { value: 200 });

    const inner = document.createElement("div");
    outer.appendChild(inner);
    document.body.appendChild(outer);

    expect(findScrollParent(inner)).toBe(outer);
    outer.remove();
  });

  it("findScrollParent falls back to document scrolling element", () => {
    const orphan = document.createElement("div");
    document.body.appendChild(orphan);
    expect(findScrollParent(orphan)).toBe(
      document.scrollingElement ?? document.documentElement,
    );
    orphan.remove();
  });
});

describe("installScrollDamping", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it("scales wheel delta on the scroll parent and prevents default", async () => {
    const { installScrollDamping } = await import("@/lib/ui/scroll-damping");

    const scroller = document.createElement("div");
    scroller.style.overflowY = "auto";
    Object.defineProperty(scroller, "scrollHeight", { value: 800 });
    Object.defineProperty(scroller, "clientHeight", { value: 200 });
    scroller.scrollTop = 0;
    const child = document.createElement("div");
    scroller.appendChild(child);
    document.body.appendChild(scroller);

    const uninstall = installScrollDamping();
    const event = new WheelEvent("wheel", {
      deltaY: 100,
      bubbles: true,
      cancelable: true,
    });
    const prevented = !child.dispatchEvent(event);

    expect(prevented).toBe(true);
    expect(scroller.scrollTop).toBe(90);

    uninstall();
    scroller.remove();
  });
});
