/**
 * Normalize TeX from LLM output for KaTeX / remark-math.
 * Models often wrap equations in \[...\], \(...\), or $...$ / $$...$$.
 */

/** Strip common math delimiters; return bare TeX for KaTeX display mode. */
export function stripLatexDelimiters(raw: string): string {
  let s = raw.trim();
  if (!s) return "";

  // $$...$$ or $...$ (non-greedy; prefer longest match first)
  const dollarBlock = /^\$\$([\s\S]*)\$\$/.exec(s);
  if (dollarBlock) return dollarBlock[1].trim();
  const dollarInline = /^\$([^$]*)\$/.exec(s);
  if (dollarInline && s.endsWith("$") && !s.startsWith("$$")) {
    return dollarInline[1].trim();
  }

  // \[...\] or \(...\)
  const bracketBlock = /^\\\[([\s\S]*)\\\]$/.exec(s);
  if (bracketBlock) return bracketBlock[1].trim();
  const parenInline = /^\\\(([\s\S]*)\\\)$/.exec(s);
  if (parenInline) return parenInline[1].trim();

  // Leading/trailing $ only (partial wrap)
  s = s.replace(/^\$+/, "").replace(/\$+$/, "").trim();
  // Orphan \[ \] on ends
  s = s.replace(/^\\\[/, "").replace(/\\\]$/, "").trim();
  s = s.replace(/^\\\(/, "").replace(/\\\)$/, "").trim();

  return s;
}

/**
 * Convert LaTeX-style delimiters in markdown body to remark-math form
 * so rehype-katex can render them.
 */
export function normalizeMarkdownMathDelimiters(markdown: string): string {
  return (
    markdown
      // Block: \[ ... \] → $$ ... $$
      .replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner: string) => `$$${inner}$$`)
      // Inline: \( ... \) → $ ... $
      .replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner: string) => `$${inner}$`)
  );
}
