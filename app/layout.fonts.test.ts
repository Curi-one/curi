import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression: next/font CSS variables must be on <html>, not only <body>.
 * Stacks in globals.css use var(--font-display|ui|mono). Those vars invalidate
 * on :root when missing, and the site falls back to Times New Roman.
 */
describe("brand font CSS variable wiring", () => {
  it("applies next/font variables on the html element", () => {
    const layout = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");
    expect(layout).toMatch(/<html[^>]*className=\{fontVars\}/);
    expect(layout).toMatch(/fraunces\.variable/);
    expect(layout).toMatch(/plusJakarta\.variable/);
    expect(layout).toMatch(/jetbrains\.variable/);
    // Must not reintroduce body-only font vars (the original bug).
    expect(layout).toMatch(
      /<body className="min-h-screen font-ui antialiased">/,
    );
    expect(layout).not.toMatch(
      /<body\s+className=\{`\$\{fraunces\.variable\}/,
    );
  });

  it("defines font stacks with literal fallbacks on :root", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    expect(css).toMatch(
      /--font-display-stack:\s*var\(--font-display,\s*"Fraunces"\)/,
    );
    expect(css).toMatch(
      /--font-ui-stack:\s*var\(--font-ui,\s*"Plus Jakarta Sans"\)/,
    );
    expect(css).toMatch(
      /--font-mono-stack:\s*var\(--font-mono,\s*"JetBrains Mono"\)/,
    );
  });
});
