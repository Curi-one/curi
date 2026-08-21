import type { ReactNode } from "react";

const CITATION_REGEX = /(\[\d+\])/g;

/** Bold the first ~40% of each word for bionic reading. */
export function applyBionic(text: string): ReactNode[] {
  return text.split(/(\s+)/).map((token, i) => {
    if (/^\s+$/.test(token) || token.length < 2) {
      return <span key={i}>{token}</span>;
    }
    const cut = Math.ceil(token.length * 0.4);
    return (
      <span key={i}>
        <strong className="font-semibold">{token.slice(0, cut)}</strong>
        {token.slice(cut)}
      </span>
    );
  });
}

/** Splits plain text on `[n]` citation markers and renders each as a tappable button. */
export function renderTextWithCitations(
  text: string,
  bionic: boolean,
  onCitationClick?: (sourceIndex: number) => void,
): ReactNode[] {
  const segments = text.split(CITATION_REGEX);
  return segments.map((segment, i) => {
    const match = /^\[(\d+)\]$/.exec(segment);
    if (match) {
      const n = Number(match[1]);
      return (
        <button
          key={`citation-${i}`}
          type="button"
          onClick={() => onCitationClick?.(n - 1)}
          aria-label={`View source ${n}`}
          className="citation-ref relative mx-0.5 inline-flex align-baseline text-[0.7em] font-medium text-ink hover:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-default before:absolute before:-inset-3 before:content-['']"
        >
          [{n}]
        </button>
      );
    }
    return <span key={i}>{bionic ? applyBionic(segment) : segment}</span>;
  });
}
