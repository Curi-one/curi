"use client";

import { Children, isValidElement, type CSSProperties, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { renderTextWithCitations } from "@/components/lesson/text-with-citations";
import { normalizeMarkdownMathDelimiters } from "@/lib/lessons/tex";
import "katex/dist/katex.min.css";

type Props = {
  markdown: string;
  bionic?: boolean;
  onCitationClick?: (index: number) => void;
  className?: string;
  style?: CSSProperties;
};

function mapTextChildren(
  children: ReactNode,
  bionic: boolean,
  onCitationClick?: (index: number) => void,
): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      return renderTextWithCitations(child, bionic, onCitationClick);
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      // Do not rewrite KaTeX / code trees
      const cls = (child.props as { className?: string }).className ?? "";
      if (
        typeof cls === "string" &&
        (cls.includes("katex") || cls.includes("math"))
      ) {
        return child;
      }
      if (child.type === "code" || child.type === "pre") {
        return child;
      }
    }
    return child;
  });
}

export function LessonMarkdown({
  markdown,
  bionic = false,
  onCitationClick,
  className,
  style,
}: Props) {
  const wrap = (nodes: ReactNode) =>
    mapTextChildren(nodes, bionic, onCitationClick);
  const normalized = normalizeMarkdownMathDelimiters(markdown);

  return (
    <div className={className} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h2: ({ children }) => (
            <h2 className="mt-10 mb-4 font-display text-2xl font-light tracking-tight text-ink sm:text-3xl">
              {wrap(children)}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 mb-3 font-display text-xl font-light tracking-tight text-ink">
              {wrap(children)}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-6 text-ink last:mb-0">{wrap(children)}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-6 list-disc space-y-2 pl-5 text-ink">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 list-decimal space-y-2 pl-5 text-ink">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-ink">{wrap(children)}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-ink">{wrap(children)}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-ink/90">{wrap(children)}</em>
          ),
          code: ({ children, className: codeClass }) => {
            const isBlock = Boolean(codeClass);
            if (isBlock) {
              return <code className={codeClass}>{children}</code>;
            }
            return (
              <code className="rounded-none bg-paper-secondary px-1 py-0.5 font-mono text-[0.9em] text-ink">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-6 overflow-x-auto border border-border bg-paper-secondary p-4 font-mono text-sm text-ink">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-6 border-l-2 border-border pl-4 text-ink-muted">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-border" />,
          a: ({ href, children }) => (
            <a
              href={href}
              className="underline decoration-border underline-offset-2 hover:text-ink"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
