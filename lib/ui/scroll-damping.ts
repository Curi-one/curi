/**
 * Soften native wheel scrolling to 90% of delta for a calmer app feel.
 * Touch / trackpad momentum scrolling is left alone (cannot damp reliably).
 */

export const SCROLL_SPEED_FACTOR = 0.9;

export function dampedDelta(delta: number): number {
  return delta * SCROLL_SPEED_FACTOR;
}

function isScrollable(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const oy = style.overflowY;
  const ox = style.overflowX;
  const canY =
    (oy === "auto" || oy === "scroll" || oy === "overlay") &&
    el.scrollHeight > el.clientHeight + 1;
  const canX =
    (ox === "auto" || ox === "scroll" || ox === "overlay") &&
    el.scrollWidth > el.clientWidth + 1;
  return canY || canX;
}

/** Nearest scrollable ancestor, or the document scrolling element. */
export function findScrollParent(start: EventTarget | null): Element | null {
  let node: Element | null =
    start instanceof Element
      ? start
      : start instanceof Node
        ? start.parentElement
        : null;

  while (node) {
    if (node instanceof HTMLElement && isScrollable(node)) return node;
    node = node.parentElement;
  }

  return document.scrollingElement ?? document.documentElement;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Install document-level wheel damping. Returns an uninstall function.
 * Skipped when the user prefers reduced motion.
 */
export function installScrollDamping(
  factor: number = SCROLL_SPEED_FACTOR,
): () => void {
  if (typeof window === "undefined" || prefersReducedMotion()) {
    return () => undefined;
  }

  const onWheel = (event: WheelEvent) => {
    // Let browser handle pinch-zoom / browser chrome gestures.
    if (event.ctrlKey || event.defaultPrevented) return;
    if (event.deltaY === 0 && event.deltaX === 0) return;

    const target = findScrollParent(event.target);
    if (!target) return;

    event.preventDefault();
    target.scrollTop += event.deltaY * factor;
    target.scrollLeft += event.deltaX * factor;
  };

  // Non-passive so we can preventDefault and apply our own scroll.
  window.addEventListener("wheel", onWheel, { passive: false });
  return () => window.removeEventListener("wheel", onWheel);
}
