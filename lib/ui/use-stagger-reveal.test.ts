import { describe, expect, it } from "vitest";
import { FEED_STAGGER_MS, feedStaggerDelay } from "./use-stagger-reveal";

describe("feedStaggerDelay", () => {
  it("sets CSS delay from index and stagger constant", () => {
    expect(FEED_STAGGER_MS).toBe(90);
    expect(feedStaggerDelay(0)).toEqual({ "--feed-stagger-delay": "0ms" });
    expect(feedStaggerDelay(3)).toEqual({ "--feed-stagger-delay": "270ms" });
  });
});
