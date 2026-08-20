import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShareableFact } from "@/components/lesson/ShareableFact";
import { getShareableFact } from "@/lib/lessons/shareable-facts";
import { linkedinShareUrl, twitterIntentUrl } from "@/lib/share/lesson-share";

describe("ShareableFact", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the shareable fact for the topic with working X/LinkedIn links", () => {
    render(<ShareableFact topic="Venture Capital" title="Fund basics" />);
    const item = getShareableFact("Venture Capital");

    expect(screen.getByText(`“${item.fact}”`)).toBeInTheDocument();

    const xLink = screen.getByRole("link", { name: /share on x/i });
    expect(xLink.getAttribute("href")).toContain(
      twitterIntentUrl("placeholder").split("?")[0],
    );

    const liLink = screen.getByRole("link", { name: /share on linkedin/i });
    expect(liLink).toHaveAttribute("href", linkedinShareUrl());
  });

  it("prefers an API-provided fact over the curated topic map", () => {
    render(
      <ShareableFact
        topic="Venture Capital"
        title="Fund basics"
        fact={{
          fact: "Override fact from Perplexity",
          reflection: "Override reflection",
        }}
      />,
    );
    expect(
      screen.getByText(/Override fact from Perplexity/),
    ).toBeInTheDocument();
    expect(screen.getByText("Override reflection")).toBeInTheDocument();
  });

  it("copies text and opens LinkedIn when Share on LinkedIn is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<ShareableFact topic="Venture Capital" title="Fund basics" />);
    fireEvent.click(screen.getByRole("link", { name: /share on linkedin/i }));

    expect(writeText).toHaveBeenCalled();
    await waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith(
        linkedinShareUrl(),
        "_blank",
        "noopener,noreferrer",
      ),
    );
  });
});
