import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShareableFact } from "@/components/lesson/ShareableFact";
import { linkedinShareUrl, twitterIntentUrl } from "@/lib/share/lesson-share";

const fact = {
  fact: "API shareable fact from the lesson payload",
  reflection: "API reflection tied to the lesson",
};

describe("ShareableFact", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the lesson API fact with working X/LinkedIn links", () => {
    render(
      <ShareableFact topic="Venture Capital" title="Fund basics" fact={fact} />,
    );

    expect(screen.getByText(`“${fact.fact}”`)).toBeInTheDocument();
    expect(screen.getByText(fact.reflection)).toBeInTheDocument();

    const xLink = screen.getByRole("link", { name: /share on x/i });
    expect(xLink.getAttribute("href")).toContain(
      twitterIntentUrl("placeholder").split("?")[0],
    );

    const liLink = screen.getByRole("link", { name: /share on linkedin/i });
    expect(liLink).toHaveAttribute("href", linkedinShareUrl());
  });

  it("copies text and opens LinkedIn when Share on LinkedIn is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(
      <ShareableFact topic="Venture Capital" title="Fund basics" fact={fact} />,
    );
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
