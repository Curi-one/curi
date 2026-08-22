"use client";

import { useEffect, useState, type CSSProperties } from "react";

/** Flip visible after mount — pairs with `.feed-stagger-item.is-visible`. */
export function useStaggerReveal(trigger: unknown = true) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [trigger]);

  return visible;
}

export const FEED_STAGGER_MS = 90;

export function feedStaggerDelay(index: number): CSSProperties {
  return { ["--feed-stagger-delay" as string]: `${index * FEED_STAGGER_MS}ms` };
}
