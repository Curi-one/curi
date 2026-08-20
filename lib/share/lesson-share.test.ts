import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildShareText,
  copyAndOpenLinkedIn,
  linkedinShareUrl,
  SHARE_SITE_URL,
  twitterIntentUrl,
} from "@/lib/share/lesson-share";

describe("SHARE_SITE_URL", () => {
  it("points at curi.one", () => {
    expect(SHARE_SITE_URL).toBe("https://curi.one");
  });
});

describe("buildShareText", () => {
  it("includes lesson title and topic when both are known", () => {
    const text = buildShareText({
      fact: "Test fact.",
      topic: "Unit Economics",
      lessonTitle: "Why margins matter",
    });
    expect(text).toContain("Test fact.");
    expect(text).toContain("Unit Economics");
    expect(text).toContain("Why margins matter");
  });

  it("falls back to topic-only framing when no lesson title is given", () => {
    const text = buildShareText({ fact: "Test fact.", topic: "Fundraising" });
    expect(text).toContain("Test fact.");
    expect(text).toContain("Fundraising");
  });

  it("still produces readable text with no topic or title", () => {
    const text = buildShareText({ fact: "Test fact." });
    expect(text).toContain("Test fact.");
    expect(text.length).toBeGreaterThan(0);
  });
});

describe("twitterIntentUrl", () => {
  it("encodes the share text into a tweet intent URL", () => {
    const url = twitterIntentUrl("Hello & welcome");
    expect(url).toBe(
      "https://twitter.com/intent/tweet?text=Hello%20%26%20welcome",
    );
  });
});

describe("linkedinShareUrl", () => {
  it("builds a share-offsite URL pointing at the Curi site", () => {
    expect(linkedinShareUrl()).toBe(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        SHARE_SITE_URL,
      )}`,
    );
  });
});

describe("copyAndOpenLinkedIn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("copies the text to the clipboard and opens the LinkedIn share URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const open = vi.fn();
    vi.stubGlobal("window", { open });

    await copyAndOpenLinkedIn("Share this");

    expect(writeText).toHaveBeenCalledWith("Share this");
    expect(open).toHaveBeenCalledWith(
      linkedinShareUrl(),
      "_blank",
      "noopener,noreferrer",
    );
  });
});
