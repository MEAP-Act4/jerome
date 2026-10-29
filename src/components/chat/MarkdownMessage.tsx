"use client";

import { memo, useMemo, useRef, useState } from "react";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Check, Copy, ImageDown, Loader2 } from "lucide-react";
import { rehypeWrapDisplayMath } from "@/lib/chat/rehype-wrap-display-math";
import { normalizeDisplayMath } from "@/lib/chat/normalize-math";
import { downloadFormulaImage } from "@/lib/chat/formula-image";
import { parseStructuredContent } from "@/lib/chat/structured";
import { QuizCard } from "./QuizCard";
import { VisualCard } from "./VisualCard";

const remarkPlugins: Options["remarkPlugins"] = [remarkMath];

const rehypePlugins: Options["rehypePlugins"] = [
  rehypeWrapDisplayMath,
  [
    rehypeKatex,
    {
      throwOnError: false,
      strict: false,
      errorColor: "#9B3B3B",
    },
  ],
];

type ActionState = "idle" | "saving" | "copied" | "saved" | "error";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function FormulaBlock({
  latex,
  children,
}: {
  latex: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ActionState>("idle");

  const flash = (next: ActionState) => {
    setState(next);
    window.setTimeout(() => setState("idle"), 2200);
  };

  const handleCopy = async () => {
    flash((await copyToClipboard(latex)) ? "copied" : "error");
  };

  const handleSave = async () => {
    const element = ref.current?.querySelector<HTMLElement>(".katex");
    if (!element) {
      flash("error");
      return;
    }

    setState("saving");
    try {
      await downloadFormulaImage(element, `jerome-formula-${Date.now()}`);
      flash("saved");
    } catch {
      flash("error");
    }
  };

  return (
    <div
      ref={ref}
      data-latex={latex}
      className="math-block group/math relative my-3 rounded-xl border border-[#E2DED6] bg-[#FBFAF7] px-4 py-3"
    >
      <div className="overflow-x-auto overflow-y-hidden pr-2">{children}</div>

      <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-[#E2DED6]/70 pt-2 opacity-80 transition-opacity group-hover/math:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={handleCopy}
          title="Copy LaTeX source"
          aria-label="Copy LaTeX source"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-[#6B6B6B] transition-colors hover:bg-[#143D30]/10 hover:text-[#143D30]"
        >
          {state === "copied" ? <Check size={13} /> : <Copy size={13} />}
          {state === "copied" ? "Copied" : "LaTeX"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={state === "saving"}
          title="Save formula as an SVG image"
          aria-label="Save formula as an image"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-[#6B6B6B] transition-colors hover:bg-[#143D30]/10 hover:text-[#143D30] disabled:cursor-wait disabled:opacity-60"
        >
          {state === "saving" ? (
            <Loader2 size={13} className="animate-spin" />
          ) : state === "saved" ? (
            <Check size={13} />
          ) : (
            <ImageDown size={13} />
          )}
          {state === "saving"
            ? "Saving…"
            : state === "saved"
              ? "Saved"
              : state === "error"
                ? "Retry"
                : "Image"}
        </button>
      </div>
    </div>
  );
}

const components: Components = {
  div({ children, ...props }) {
    const latex = (props as Record<string, unknown>)["data-latex"];
    if (typeof latex === "string") {
      return <FormulaBlock latex={latex}>{children}</FormulaBlock>;
    }
    return <div>{children}</div>;
  },
  p({ children }) {
    return <p className="mb-2 last:mb-0">{children}</p>;
  },
  a({ href, title, children }) {
    return (
      <a
        href={href}
        title={title}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#143D30] underline underline-offset-2 hover:text-[#0E2B22]"
      >
        {children}
      </a>
    );
  },
  ul({ children }) {
    return <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>;
  },
  ol({ children }) {
    return (
      <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
    );
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic">{children}</em>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-2 border-l-2 border-[#8FD6BC] pl-3 text-[#4A4A4A] italic">
        {children}
      </blockquote>
    );
  },
  code({ children }) {
    return (
      <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    );
  },
  pre({ children }) {
    return (
      <pre className="my-2 overflow-x-auto rounded-lg bg-[#143D30] p-3 text-xs leading-relaxed text-[#E8F5EE] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
        {children}
      </pre>
    );
  },
  table({ children }) {
    return (
      <div className="my-2 overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs [&_td]:border [&_td]:border-[#E2DED6] [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[#E2DED6] [&_th]:bg-[#F1EEE7] [&_th]:px-2 [&_th]:py-1 [&_th]:font-semibold">
          {children}
        </table>
      </div>
    );
  },
  img({ src, alt, title }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        title={title}
        loading="lazy"
        className="my-2 max-w-full rounded-lg border border-[#E2DED6]"
      />
    );
  },
  hr() {
    return <hr className="my-3 border-[#E2DED6]" />;
  },
  h1({ children }) {
    return (
      <h1 className="mb-1.5 mt-3 font-semibold first:mt-0">{children}</h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="mb-1.5 mt-3 font-semibold first:mt-0">{children}</h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="mb-1.5 mt-3 font-semibold first:mt-0">{children}</h3>
    );
  },
};

export const MarkdownMessage = memo(function MarkdownMessage({
  content,
}: {
  content: string;
}) {
  const segments = useMemo(() => parseStructuredContent(content), [content]);
  const hasStructured = segments.some((segment) => segment.type !== "markdown");

  if (!hasStructured) {
    return <MarkdownSegment content={content} />;
  }

  return (
    <div>
      {segments.map((segment, index) => {
        if (segment.type === "visual") {
          return <VisualCard key={index} spec={segment.spec} />;
        }
        if (segment.type === "quiz") {
          return <QuizCard key={index} spec={segment.spec} />;
        }
        return <MarkdownSegment key={index} content={segment.content} />;
      })}
    </div>
  );
});

function MarkdownSegment({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
    >
      {normalizeDisplayMath(content)}
    </ReactMarkdown>
  );
}
