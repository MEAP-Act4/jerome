"use client";

/**
 * Exports a KaTeX-rendered formula as a standalone SVG image.
 *
 * The live page already has KaTeX's stylesheet loaded. We collect those rules,
 * inline every font file as a data URI, and place the formula markup inside an
 * SVG <foreignObject>. Because the fonts are embedded, the image renders
 * identically when opened outside the browser tab.
 *
 * SVG (rather than PNG) is deliberate: Chrome taints canvases that draw
 * foreignObject-based SVG, so rasterising it client-side is not possible.
 */

const PADDING = 18;
const URL_PATTERN = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;

function collectKatexStyles(): string {
  if (typeof document === "undefined") return "";

  const chunks: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin stylesheet — nothing we can read.
      continue;
    }
    if (!rules) continue;

    for (const rule of Array.from(rules)) {
      const text = rule.cssText;
      if (!text) continue;
      if (text.includes("katex") || text.includes("KaTeX")) {
        chunks.push(absolutizeUrls(text, sheet.href));
      }
    }
  }

  return chunks.join("\n");
}

/**
 * Font URLs inside a stylesheet are relative to that stylesheet, not to the
 * page. Resolve them against the sheet href so the later fetch (and the data
 * URI inlining) works whether the CSS is served from /_next/static or a
 * different origin.
 */
function absolutizeUrls(css: string, base: string | null): string {
  if (!base) return css;

  return css.replace(URL_PATTERN, (full, _quote, url: string) => {
    if (/^(data:|https?:|\/\/)/i.test(url)) return full;
    try {
      return `url("${new URL(url, base).href}")`;
    } catch {
      return full;
    }
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

async function inlineFontAssets(css: string): Promise<string> {
  if (!css) return css;

  const urls = new Set<string>();
  for (const match of Array.from(css.matchAll(URL_PATTERN))) {
    const url = match[2];
    if (url && !url.startsWith("data:")) urls.add(url);
  }
  if (urls.size === 0) return css;

  const resolved = await Promise.all(
    Array.from(urls).map(async (url) => {
      // woff2 covers every modern browser and keeps the image small.
      if (!/\.woff2(\?|$)/i.test(url)) return null;
      try {
        const absolute = new URL(url, document.baseURI).href;
        const response = await fetch(absolute, { cache: "force-cache" });
        if (!response.ok) return null;
        const dataUrl = await blobToDataUrl(await response.blob());
        return [url, dataUrl] as const;
      } catch {
        return null;
      }
    })
  );

  const byUrl = new Map(resolved.filter((entry) => entry !== null));

  return css.replace(URL_PATTERN, (full, _quote, url: string) => {
    const dataUrl = byUrl.get(url);
    return dataUrl ? `url("${dataUrl}")` : full;
  });
}

function measureFormula(element: HTMLElement) {
  const baseFontSize =
    window.getComputedStyle(element.parentElement ?? element).fontSize || "16px";

  const probe = document.createElement("div");
  probe.style.cssText = [
    "position:fixed",
    "left:-100000px",
    "top:0",
    "width:max-content",
    "max-width:none",
    "display:inline-block",
    "line-height:normal",
    `font-size:${baseFontSize}`,
  ].join(";");

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.display = "inline-block";
  probe.appendChild(clone);
  document.body.appendChild(probe);

  const rect = clone.getBoundingClientRect();
  const html = clone.outerHTML;
  document.body.removeChild(probe);

  return {
    baseFontSize,
    html,
    width: Math.max(1, Math.ceil(rect.width)),
    height: Math.max(1, Math.ceil(rect.height)),
  };
}

export async function buildFormulaSvg(element: HTMLElement): Promise<{
  svg: string;
  width: number;
  height: number;
}> {
  // Measuring before the KaTeX web fonts settle gives fallback-font metrics.
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const { baseFontSize, html, width, height } = measureFormula(element);
  const css = await inlineFontAssets(collectKatexStyles());

  const canvasWidth = width + PADDING * 2;
  const canvasHeight = height + PADDING * 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">
<rect width="100%" height="100%" fill="#ffffff"/>
<foreignObject x="0" y="0" width="${canvasWidth}" height="${canvasHeight}">
<div xmlns="http://www.w3.org/1999/xhtml" style="width:${canvasWidth}px;height:${canvasHeight}px;display:flex;align-items:center;justify-content:center;background:#ffffff;color:#1a1a1a;font-size:${baseFontSize};line-height:normal;direction:ltr;">
<style>${css}</style>
${html}
</div>
</foreignObject>
</svg>`;

  return { svg, width: canvasWidth, height: canvasHeight };
}

/** Downloads the formula as an SVG image. */
export async function downloadFormulaImage(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const { svg } = await buildFormulaSvg(element);

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
