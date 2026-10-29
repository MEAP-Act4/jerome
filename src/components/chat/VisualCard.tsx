"use client";

import { useMemo, useState } from "react";
import { Check, Download } from "lucide-react";
import {
  renderVisualSvg,
  visualCaption,
  visualTitle,
  type VisualSpec,
} from "@/lib/chat/visuals";

function fileSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "jerome-diagram"
  );
}

export function VisualCard({ spec }: { spec: VisualSpec }) {
  const [saved, setSaved] = useState(false);
  const svg = useMemo(() => renderVisualSvg(spec), [spec]);
  const title = visualTitle(spec);
  const caption = visualCaption(spec);

  const download = () => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileSlug(title)}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <figure className="my-3 overflow-hidden rounded-2xl border border-[#E2DED6] bg-white text-sm text-[#1A1A1A]">
      <div className="flex items-center justify-between gap-3 border-b border-[#E2DED6] bg-[#F1EEE7] px-4 py-2.5">
        <div className="min-w-0">
          <span className="rounded bg-[#143D30] px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#8FD6BC]">
            Diagram
          </span>
          <p className="mt-1 truncate text-xs font-semibold text-[#143D30]">
            {title}
          </p>
        </div>
        <button
          type="button"
          onClick={download}
          title="Download this diagram as an SVG"
          aria-label="Download diagram as SVG"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#D8D4CA] bg-white px-2 py-1 text-[11px] font-medium text-[#6B6B6B] transition-colors hover:border-[#8FD6BC] hover:text-[#143D30]"
        >
          {saved ? <Check size={13} /> : <Download size={13} />}
          {saved ? "Saved" : "SVG"}
        </button>
      </div>

      {/* The SVG is produced by renderVisualSvg from trusted, whitelisted
          diagram code; no raw model output is injected here. */}
      <div
        className="bg-white p-3"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {caption && (
        <figcaption className="border-t border-[#E2DED6] bg-[#FBFAF7] px-4 py-2.5 text-[11px] leading-relaxed text-[#6B6B6B]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
