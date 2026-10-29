"use client";

import ReactMarkdown, { type Components, type Options } from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { normalizeDisplayMath } from "@/lib/chat/normalize-math";

const remarkPlugins: Options["remarkPlugins"] = [remarkMath];
const rehypePlugins: Options["rehypePlugins"] = [
  [
    rehypeKatex,
    {
      throwOnError: false,
      strict: false,
      errorColor: "#9B3B3B",
    },
  ],
];

const blockComponents: Components = {
  p({ children }) {
    return <p className="mb-1.5 last:mb-0">{children}</p>;
  },
  ul({ children }) {
    return <ul className="mb-1.5 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>;
  },
  ol({ children }) {
    return (
      <ol className="mb-1.5 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
    );
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic">{children}</em>;
  },
  code({ children }) {
    return (
      <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    );
  },
};

const inlineComponents: Components = {
  p({ children }) {
    return <span>{children}</span>;
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic">{children}</em>;
  },
  code({ children }) {
    return (
      <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    );
  },
};

/**
 * Small markdown + KaTeX renderer used inside quiz questions and options.
 * Keeping it separate from MarkdownMessage avoids a circular import (the main
 * renderer imports the quiz/visual cards).
 */
export function RichText({
  content,
  inline = false,
  className = "",
}: {
  content: string;
  inline?: boolean;
  className?: string;
}) {
  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={className}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={inline ? inlineComponents : blockComponents}
      >
        {normalizeDisplayMath(content)}
      </ReactMarkdown>
    </Wrapper>
  );
}
