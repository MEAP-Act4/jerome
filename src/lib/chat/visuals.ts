/**
 * Deterministic SVG diagrams for the tutor's "draw / visualize" requests.
 *
 * The server never accepts raw SVG from the model. It picks one of these known
 * diagram kinds and a small set of numeric parameters, then renders the SVG
 * from trusted code on the client. That keeps the chat safe while still giving
 * students a real visual instead of a paragraph describing one.
 */

export type VisualKind =
  | "unit-circle"
  | "parabola"
  | "right-triangle"
  | "sine-wave"
  | "coordinate-line"
  | "free-body"
  | "circle"
  | "cell"
  | "atom";

export interface VisualSpec {
  kind: VisualKind;
  title?: string;
  caption?: string;
  params?: Record<string, number>;
}

export const VISUAL_TITLES: Record<VisualKind, string> = {
  "unit-circle": "The unit circle",
  parabola: "A quadratic parabola",
  "right-triangle": "Right-triangle ratios",
  "sine-wave": "The sine wave",
  "coordinate-line": "A line on the coordinate plane",
  "free-body": "Free-body diagram",
  circle: "Circle measurements",
  cell: "A cell diagram",
  atom: "An atom diagram",
};

const VISUAL_CAPTIONS: Record<VisualKind, string> = {
  "unit-circle":
    "On the unit circle, the point is (cos θ, sin θ). The horizontal projection is cosine; the vertical projection is sine.",
  parabola:
    "A quadratic opens upward when a > 0 and downward when a < 0. The vertex is its turning point.",
  "right-triangle":
    "SOH-CAH-TOA is just these side ratios: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.",
  "sine-wave":
    "The amplitude is the height from the middle line to a peak. The period is the horizontal length of one full cycle.",
  "coordinate-line":
    "Slope is rise over run. A positive slope rises from left to right; a negative slope falls.",
  "free-body":
    "A free-body diagram draws only the forces acting on one object, with arrows showing each force's direction.",
  circle:
    "The radius is half the diameter. Circumference is the distance around; area is the space inside.",
  cell: "The nucleus controls the cell, mitochondria release energy, and the membrane controls what enters and leaves.",
  atom: "Protons and neutrons sit in the nucleus; electrons occupy the shells around it.",
};

const INK = "#143D30";
const ACCENT = "#2D8F72";
const SOFT = "#8FD6BC";
const GOLD = "#C08A2E";
const GRAY = "#6B6B6B";
const GRID = "#DED9CE";

const WIDTH = 480;
const HEIGHT = 320;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function param(
  spec: VisualSpec,
  key: string,
  fallback: number,
  min: number,
  max: number
): number {
  const value = spec.params?.[key];
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return clamp(value, min, max);
}

function label(
  x: number,
  y: number,
  content: string,
  options: {
    size?: number;
    fill?: string;
    anchor?: "start" | "middle" | "end";
    weight?: number;
    italic?: boolean;
  } = {}
): string {
  const size = options.size ?? 13;
  const fill = options.fill ?? INK;
  const anchor = options.anchor ?? "middle";
  const weight = options.weight ?? 500;
  const italic = options.italic ? ' font-style="italic"' : "";
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${italic}>${escapeXml(
    content
  )}</text>`;
}

function frame(title: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(
    title
  )}" style="width:100%;height:auto;display:block;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif">
  <title>${escapeXml(title)}</title>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#FFFFFF" />
  ${body}
</svg>`;
}

function axisArrowDefs(id: string): string {
  return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${INK}" /></marker></defs>`;
}

function renderUnitCircle(spec: VisualSpec): string {
  const angle = param(spec, "angleDeg", 45, 5, 355);
  const cx = 240;
  const cy = 162;
  const radius = 108;
  const radians = (angle * Math.PI) / 180;
  const px = cx + radius * Math.cos(radians);
  const py = cy - radius * Math.sin(radians);
  const arcRadius = 34;
  const arcEndX = cx + arcRadius * Math.cos(radians);
  const arcEndY = cy - arcRadius * Math.sin(radians);
  const largeArc = angle > 180 ? 1 : 0;

  const body = [
    `<line x1="70" y1="${cy}" x2="412" y2="${cy}" stroke="${GRID}" stroke-width="1.5" />`,
    `<line x1="${cx}" y1="26" x2="${cx}" y2="300" stroke="${GRID}" stroke-width="1.5" />`,
    `<line x1="70" y1="${cy}" x2="412" y2="${cy}" stroke="${INK}" stroke-width="1.4" marker-end="url(#axis-arrow)" />`,
    `<line x1="${cx}" y1="300" x2="${cx}" y2="26" stroke="${INK}" stroke-width="1.4" marker-end="url(#axis-arrow)" />`,
    label(402, cy + 20, "x"),
    label(cx + 16, 36, "y"),
    `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${INK}" stroke-width="2.2" />`,
    `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${cy}" stroke="${SOFT}" stroke-width="7" stroke-linecap="round" opacity="0.9" />`,
    `<line x1="${px}" y1="${cy}" x2="${px}" y2="${py}" stroke="${GOLD}" stroke-width="2.2" stroke-dasharray="5 4" />`,
    `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="${ACCENT}" stroke-width="2.6" />`,
    `<circle cx="${cx}" cy="${cy}" r="4" fill="${INK}" />`,
    `<circle cx="${px}" cy="${py}" r="5" fill="${ACCENT}" />`,
    `<path d="M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ${arcEndX} ${arcEndY}" fill="none" stroke="${ACCENT}" stroke-width="2" />`,
    label(cx + 46, cy - 12, "θ", { fill: ACCENT, size: 15, italic: true }),
    label(px + (px >= cx ? 12 : -12), py - 12, "(cos θ, sin θ)", {
      anchor: px >= cx ? "start" : "end",
      fill: INK,
      size: 12,
      italic: true,
    }),
    label(cx - 14, cy + 18, "0"),
    label(cx + radius + 6, cy + 20, "1", { fill: GRAY }),
    label(cx - radius - 6, cy + 20, "−1", { fill: GRAY }),
    label(cx + 12, cy - radius - 6, "1", { fill: GRAY }),
    label(cx + 12, cy + radius + 20, "−1", { fill: GRAY }),
    label(cx + radius / 2, cy + 22, "cos θ", { fill: ACCENT, size: 11 }),
    label(px + 8, cy - radius * 0.35, "sin θ", {
      anchor: "start",
      fill: GOLD,
      size: 11,
    }),
  ].join("\n  ");

  return frame(
    spec.title || VISUAL_TITLES["unit-circle"],
    axisArrowDefs("axis-arrow") + body
  );
}

function renderParabola(spec: VisualSpec): string {
  const a = param(spec, "a", 1, -4, 4) || 1;
  const b = param(spec, "b", 0, -10, 10);
  const c = param(spec, "c", -4, -10, 10);

  const left = 60;
  const right = 420;
  const top = 38;
  const bottom = 284;
  const xMin = -5;
  const xMax = 5;
  const yMin = -7;
  const yMax = 9;

  const toX = (x: number) => left + ((x - xMin) / (xMax - xMin)) * (right - left);
  const toY = (y: number) => bottom - ((y - yMin) / (yMax - yMin)) * (bottom - top);

  const points: string[] = [];
  let started = false;
  for (let step = 0; step <= 240; step += 1) {
    const x = xMin + ((xMax - xMin) * step) / 240;
    const y = a * x * x + b * x + c;
    if (y < yMin - 1 || y > yMax + 1) continue;
    points.push(
      `${started ? "L" : "M"} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`
    );
    started = true;
  }

  const originX = toX(0);
  const originY = toY(0);
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  const vertexVisible =
    vertexX >= xMin && vertexX <= xMax && vertexY >= yMin && vertexY <= yMax;

  const bLabel = b === 0 ? "" : b > 0 ? ` + ${b}x` : ` − ${Math.abs(b)}x`;
  const cLabel = c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${Math.abs(c)}`;
  const aLabel = a === 1 ? "" : a === -1 ? "−" : `${a}`;
  const equation = `y = ${aLabel}x²${bLabel}${cLabel}`;

  const body = [
    `<line x1="${left}" y1="${originY}" x2="${right}" y2="${originY}" stroke="${INK}" stroke-width="1.4" marker-end="url(#axis-arrow)" />`,
    `<line x1="${originX}" y1="${bottom}" x2="${originX}" y2="${top}" stroke="${INK}" stroke-width="1.4" marker-end="url(#axis-arrow)" />`,
    label(right - 4, originY + 20, "x"),
    label(originX + 16, top + 10, "y"),
    `<path d="${points.join(" ")}" fill="none" stroke="${ACCENT}" stroke-width="3" stroke-linecap="round" />`,
    vertexVisible
      ? `<circle cx="${toX(vertexX)}" cy="${toY(vertexY)}" r="5" fill="${GOLD}" />`
      : "",
    vertexVisible
      ? label(
          toX(vertexX) + 12,
          toY(vertexY) + (a > 0 ? 22 : -12),
          `vertex (${vertexX.toFixed(1)}, ${vertexY.toFixed(1)})`,
          { anchor: "start", fill: GOLD, size: 11 }
        )
      : "",
    label(left + 4, top + 4, equation, {
      anchor: "start",
      size: 15,
      weight: 600,
    }),
    label(right - 4, bottom - 8, "x-intercepts where y = 0", {
      anchor: "end",
      fill: GRAY,
      size: 10,
    }),
  ].join("\n  ");

  return frame(spec.title || VISUAL_TITLES.parabola, axisArrowDefs("axis-arrow") + body);
}

function renderRightTriangle(spec: VisualSpec): string {
  const ax = 110;
  const ay = 262;
  const bx = 372;
  const by = 262;
  const cx = 372;
  const cy = 92;

  const body = [
    `<polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="${SOFT}" fill-opacity="0.22" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" />`,
    `<path d="M ${bx - 16} ${by} L ${bx - 16} ${by - 16} L ${bx} ${by - 16}" fill="none" stroke="${GOLD}" stroke-width="2" />`,
    `<path d="M ${ax + 42} ${ay} A 42 42 0 0 0 ${ax + 28} ${ay - 31}" fill="none" stroke="${ACCENT}" stroke-width="2" />`,
    label(ax + 48, ay - 14, "θ", { fill: ACCENT, size: 16, italic: true }),
    label((ax + bx) / 2, ay + 24, "adjacent", { fill: INK, size: 12 }),
    label(bx + 14, (by + cy) / 2, "opposite", {
      anchor: "start",
      fill: INK,
      size: 12,
    }),
    label((ax + cx) / 2 - 10, (ay + cy) / 2 - 12, "hypotenuse", {
      fill: ACCENT,
      size: 12,
      italic: true,
    }),
    label(ax - 6, ay + 22, "A", { fill: GRAY, size: 12, weight: 700 }),
    label(bx + 6, by + 22, "B", { fill: GRAY, size: 12, weight: 700 }),
    label(cx + 6, cy - 8, "C", { fill: GRAY, size: 12, weight: 700 }),
    label(240, 38, "sin θ = opp/hyp   cos θ = adj/hyp   tan θ = opp/adj", {
      size: 12,
      fill: INK,
      weight: 600,
    }),
  ].join("\n  ");

  return frame(spec.title || VISUAL_TITLES["right-triangle"], body);
}

function renderSineWave(spec: VisualSpec): string {
  const amplitude = param(spec, "amplitude", 70, 20, 110);
  const left = 46;
  const right = 438;
  const middle = 168;

  const points: string[] = [];
  for (let step = 0; step <= 360; step += 1) {
    const x = left + ((right - left) * step) / 360;
    const y = middle - amplitude * Math.sin((step / 360) * Math.PI * 4);
    points.push(`${step === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  const onePeriodX = left + (right - left) / 2;

  const body = [
    `<line x1="${left}" y1="${middle}" x2="${right}" y2="${middle}" stroke="${INK}" stroke-width="1.4" marker-end="url(#axis-arrow)" />`,
    `<line x1="${left}" y1="278" x2="${left}" y2="48" stroke="${INK}" stroke-width="1.4" marker-end="url(#axis-arrow)" />`,
    `<line x1="${left}" y1="${middle - amplitude}" x2="${right}" y2="${middle - amplitude}" stroke="${GRID}" stroke-width="1.2" stroke-dasharray="5 5" />`,
    `<line x1="${left}" y1="${middle + amplitude}" x2="${right}" y2="${middle + amplitude}" stroke="${GRID}" stroke-width="1.2" stroke-dasharray="5 5" />`,
    `<path d="${points.join(" ")}" fill="none" stroke="${ACCENT}" stroke-width="2.8" stroke-linecap="round" />`,
    label(right - 4, middle + 20, "x"),
    label(left + 14, 56, "y"),
    label(left + 8, middle - amplitude - 8, `amplitude = ${amplitude}`, {
      anchor: "start",
      fill: GOLD,
      size: 11,
    }),
    label(onePeriodX, 294, "one period = 2π", {
      fill: GRAY,
      size: 11,
    }),
    `<line x1="${left}" y1="284" x2="${onePeriodX}" y2="284" stroke="${GOLD}" stroke-width="1.6" marker-start="url(#axis-arrow)" marker-end="url(#axis-arrow)" />`,
    label(left + 4, 34, "y = sin x", { anchor: "start", size: 15, weight: 600 }),
  ].join("\n  ");

  return frame(spec.title || VISUAL_TITLES["sine-wave"], axisArrowDefs("axis-arrow") + body);
}

function renderCoordinateLine(spec: VisualSpec): string {
  const m = param(spec, "m", 2, -6, 6);
  const b = param(spec, "b", -1, -6, 6);

  const left = 62;
  const right = 420;
  const top = 40;
  const bottom = 282;
  const xMin = -5;
  const xMax = 5;
  const yMin = -6;
  const yMax = 6;

  const toX = (x: number) => left + ((x - xMin) / (xMax - xMin)) * (right - left);
  const toY = (y: number) => bottom - ((y - yMin) / (yMax - yMin)) * (bottom - top);

  const run = 1;
  const x0 = -1;
  const y0 = m * x0 + b;
  const x1 = x0 + run;
  const y1 = y0 + m * run;

  const bLabel = b === 0 ? "" : b > 0 ? ` + ${b}` : ` − ${Math.abs(b)}`;
  const equation = `y = ${m}x${bLabel}`;

  const body = [
    `<clipPath id="plot-clip"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" /></clipPath>`,
    `<line x1="${left}" y1="${toY(0)}" x2="${right}" y2="${toY(0)}" stroke="${INK}" stroke-width="1.4" marker-end="url(#axis-arrow)" />`,
    `<line x1="${toX(0)}" y1="${bottom}" x2="${toX(0)}" y2="${top}" stroke="${INK}" stroke-width="1.4" marker-end="url(#axis-arrow)" />`,
    label(right - 4, toY(0) + 20, "x"),
    label(toX(0) + 16, top + 10, "y"),
    `<line x1="${toX(xMin)}" y1="${toY(m * xMin + b)}" x2="${toX(xMax)}" y2="${toY(m * xMax + b)}" stroke="${ACCENT}" stroke-width="3" clip-path="url(#plot-clip)" />`,
    `<line x1="${toX(x0)}" y1="${toY(y0)}" x2="${toX(x1)}" y2="${toY(y0)}" stroke="${GOLD}" stroke-width="2" stroke-dasharray="5 4" />`,
    `<line x1="${toX(x1)}" y1="${toY(y0)}" x2="${toX(x1)}" y2="${toY(y1)}" stroke="${GOLD}" stroke-width="2" stroke-dasharray="5 4" />`,
    `<circle cx="${toX(x0)}" cy="${toY(y0)}" r="4" fill="${GOLD}" />`,
    `<circle cx="${toX(x1)}" cy="${toY(y1)}" r="4" fill="${GOLD}" />`,
    label((toX(x0) + toX(x1)) / 2, toY(y0) + 18, "run = 1", {
      fill: GOLD,
      size: 10,
    }),
    label(toX(x1) + 8, (toY(y0) + toY(y1)) / 2, `rise = ${m}`, {
      anchor: "start",
      fill: GOLD,
      size: 10,
    }),
    label(left + 4, top + 4, equation, {
      anchor: "start",
      size: 15,
      weight: 600,
    }),
    label(right - 4, bottom - 8, "slope = rise ÷ run", {
      anchor: "end",
      fill: GRAY,
      size: 10,
    }),
  ].join("\n  ");

  return frame(spec.title || VISUAL_TITLES["coordinate-line"], axisArrowDefs("axis-arrow") + body);
}

function renderFreeBody(spec: VisualSpec): string {
  const body = [
    axisArrowDefs("force-arrow"),
    `<line x1="54" y1="250" x2="426" y2="250" stroke="${GRID}" stroke-width="3" />`,
    `<rect x="220" y="150" width="100" height="70" rx="8" fill="${SOFT}" fill-opacity="0.35" stroke="${INK}" stroke-width="2.2" />`,
    label(270, 192, "object", { fill: INK, size: 12, weight: 600 }),
    `<line x1="270" y1="150" x2="270" y2="54" stroke="${ACCENT}" stroke-width="2.6" marker-end="url(#force-arrow)" />`,
    label(270, 44, "N (normal)", { fill: ACCENT, size: 12 }),
    `<line x1="270" y1="220" x2="270" y2="300" stroke="${GOLD}" stroke-width="2.6" marker-end="url(#force-arrow)" />`,
    label(270, 314, "W = mg", { fill: GOLD, size: 12 }),
    `<line x1="320" y1="185" x2="422" y2="185" stroke="${INK}" stroke-width="2.6" marker-end="url(#force-arrow)" />`,
    label(428, 180, "F", { anchor: "start", fill: INK, size: 13 }),
    `<line x1="220" y1="185" x2="126" y2="185" stroke="${GRAY}" stroke-width="2.6" marker-end="url(#force-arrow)" />`,
    label(118, 180, "f (friction)", { anchor: "end", fill: GRAY, size: 12 }),
    label(240, 34, "Forces acting on the object", { size: 12, fill: INK, weight: 600 }),
  ].join("\n  ");

  return frame(spec.title || VISUAL_TITLES["free-body"], body);
}

function renderCircle(spec: VisualSpec): string {
  const cx = 238;
  const cy = 158;
  const radius = 96;
  const angle = (-35 * Math.PI) / 180;
  const px = cx + radius * Math.cos(angle);
  const py = cy + radius * Math.sin(angle);

  const body = [
    `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${SOFT}" fill-opacity="0.18" stroke="${INK}" stroke-width="2.4" />`,
    `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="${ACCENT}" stroke-width="2.4" />`,
    `<circle cx="${cx}" cy="${cy}" r="4" fill="${INK}" />`,
    `<circle cx="${px}" cy="${py}" r="4.5" fill="${ACCENT}" />`,
    label((cx + px) / 2, (cy + py) / 2 - 8, "r", {
      fill: ACCENT,
      size: 15,
      italic: true,
    }),
    label(cx - 18, cy + 20, "center", { anchor: "end", fill: GRAY, size: 10 }),
    label(cx, cy + radius + 30, "C = 2πr", { fill: INK, size: 13, weight: 600 }),
    label(cx, cy + radius + 50, "A = πr²", { fill: INK, size: 13, weight: 600 }),
    label(cx, 38, "Circle measurements", { size: 13, fill: INK, weight: 600 }),
  ].join("\n  ");

  return frame(spec.title || VISUAL_TITLES.circle, body);
}

function renderCell(spec: VisualSpec): string {
  const body = [
    `<rect x="64" y="52" width="352" height="218" rx="58" fill="${SOFT}" fill-opacity="0.18" stroke="${INK}" stroke-width="2.6" />`,
    `<circle cx="186" cy="158" r="46" fill="${SOFT}" fill-opacity="0.5" stroke="${ACCENT}" stroke-width="2.2" />`,
    `<circle cx="198" cy="146" r="12" fill="${GOLD}" fill-opacity="0.8" />`,
    label(186, 220, "nucleus", { fill: ACCENT, size: 11, weight: 600 }),
    `<ellipse cx="322" cy="112" rx="42" ry="21" fill="#FFFFFF" stroke="${GOLD}" stroke-width="2.2" />`,
    `<path d="M 292 112 L 306 102 L 318 122 L 332 102 L 346 122 L 354 112" fill="none" stroke="${GOLD}" stroke-width="1.8" />`,
    label(322, 152, "mitochondrion", { fill: GOLD, size: 11, weight: 600 }),
    `<circle cx="112" cy="96" r="4" fill="${ACCENT}" />`,
    `<circle cx="136" cy="126" r="3" fill="${ACCENT}" />`,
    `<circle cx="104" cy="220" r="4" fill="${ACCENT}" />`,
    `<circle cx="290" cy="224" r="3.5" fill="${ACCENT}" />`,
    `<circle cx="344" cy="206" r="4" fill="${ACCENT}" />`,
    label(240, 248, "cytoplasm", { fill: GRAY, size: 10 }),
    `<line x1="64" y1="82" x2="30" y2="66" stroke="${GRAY}" stroke-width="1.2" />`,
    label(28, 58, "cell membrane", { anchor: "start", fill: GRAY, size: 10 }),
    label(240, 34, "A generalized cell", { size: 13, fill: INK, weight: 600 }),
  ].join("\n  ");

  return frame(spec.title || VISUAL_TITLES.cell, body);
}

function renderAtom(spec: VisualSpec): string {
  const cx = 240;
  const cy = 160;
  const shells = [54, 88, 122];

  const electrons = (radius: number, offset: number) => {
    const dots: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      const angle = offset + (index * Math.PI * 2) / 3;
      dots.push(
        `<circle cx="${(cx + radius * Math.cos(angle)).toFixed(1)}" cy="${(
          cy +
          radius * Math.sin(angle)
        ).toFixed(1)}" r="5" fill="${ACCENT}" stroke="#FFFFFF" stroke-width="1.5" />`
      );
    }
    return dots.join("\n    ");
  };

  const body = [
    shells
      .map(
        (radius) =>
          `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${GRID}" stroke-width="1.6" stroke-dasharray="4 4" />`
      )
      .join("\n  "),
    electrons(shells[0], 0.4),
    electrons(shells[1], 1.1),
    electrons(shells[2], 0.1),
    `<circle cx="${cx}" cy="${cy}" r="24" fill="${GOLD}" fill-opacity="0.35" stroke="${GOLD}" stroke-width="2.4" />`,
    `<circle cx="${cx - 8}" cy="${cy - 5}" r="4" fill="${GOLD}" />`,
    `<circle cx="${cx + 7}" cy="${cy + 2}" r="4" fill="${GRAY}" />`,
    `<circle cx="${cx - 1}" cy="${cy + 10}" r="4" fill="${GRAY}" />`,
    label(cx, cy + 48, "nucleus (p⁺ + n⁰)", { fill: GOLD, size: 10, weight: 600 }),
    label(cx + shells[2] + 10, cy + 4, "electron shell", {
      anchor: "start",
      fill: GRAY,
      size: 10,
    }),
    label(cx, 34, "Atomic structure", { size: 13, fill: INK, weight: 600 }),
  ].join("\n  ");

  return frame(spec.title || VISUAL_TITLES.atom, body);
}

export function renderVisualSvg(spec: VisualSpec): string {
  switch (spec.kind) {
    case "unit-circle":
      return renderUnitCircle(spec);
    case "parabola":
      return renderParabola(spec);
    case "right-triangle":
      return renderRightTriangle(spec);
    case "sine-wave":
      return renderSineWave(spec);
    case "coordinate-line":
      return renderCoordinateLine(spec);
    case "free-body":
      return renderFreeBody(spec);
    case "circle":
      return renderCircle(spec);
    case "cell":
      return renderCell(spec);
    case "atom":
      return renderAtom(spec);
    default:
      return renderUnitCircle(spec);
  }
}

export function visualTitle(spec: VisualSpec): string {
  return spec.title?.trim() || VISUAL_TITLES[spec.kind];
}

export function visualCaption(spec: VisualSpec): string {
  return spec.caption?.trim() || VISUAL_CAPTIONS[spec.kind];
}

const VISUAL_INTENT_RE =
  /\b(draw|drawing|diagram|sketch|visuali[sz]e|visuali[sz]ation|illustrat(?:e|ion)|picture|image|graph|plot|show\s+me\s+(?:a|an|the)\s+(?:picture|diagram|graph|drawing|visual|image)|what\s+(?:does|do)\b[^?]{0,80}\blook\s+like)\b/i;

function parseLineEquation(text: string): { m: number; b: number } | null {
  const match = text.match(/y\s*=\s*(-?\s*\d*)\s*x\s*([+-]\s*\d+(?:\.\d+)?)?/i);
  if (!match) return null;

  const rawM = match[1].replace(/\s+/g, "");
  const m =
    rawM === "" || rawM === "+"
      ? 1
      : rawM === "-"
        ? -1
        : Number(rawM);
  const b = match[2] ? Number(match[2].replace(/\s+/g, "")) : 0;

  if (!Number.isFinite(m) || !Number.isFinite(b)) return null;
  return { m, b };
}

/**
 * Turn a "draw / visualize" request into one of the supported diagram specs.
 * Returns null when the request is not visual or no topic matches, so normal
 * tutoring can handle it instead.
 */
export function detectVisualRequest(message: string): VisualSpec | null {
  const clean = message.replace(/\s+/g, " ").trim();
  if (!clean || !VISUAL_INTENT_RE.test(clean)) return null;

  const text = clean.toLowerCase();

  if (/\bunit\s+circle\b|\btrig(?:onometric)?\s+circle\b|\breference\s+angle\b/.test(text)) {
    const angleMatch = clean.match(/\b(?:angle|θ|theta)\s*(?:=|of|at)?\s*(\d{1,3})\s*(?:°|degrees?)?/i);
    return {
      kind: "unit-circle",
      params: angleMatch ? { angleDeg: Number(angleMatch[1]) } : undefined,
    };
  }

  if (/\bfree[\s-]?body\b|\bforce\s+diagram\b|\bnewton'?s?\s+laws?\b|\bforces?\b/.test(text)) {
    return { kind: "free-body" };
  }

  if (/\bright[\s-]?triangle\b|\bsoh\s*cah\s*toa\b|\btrig(?:onometric)?\s+ratios?\b|\bhypotenuse\b/.test(text)) {
    return { kind: "right-triangle" };
  }

  if (/\bsine\s+wave\b|\bsinusoid\w*\b|\bsine\s+graph\b|\bcosine\s+graph\b|\bamplitude\b|\bperiod\b/.test(text)) {
    return { kind: "sine-wave" };
  }

  if (/\bcell\b|\bnucleus\b|\bmitochondri\w*\b|\borganelle\w*\b|\bcell\s+membrane\b/.test(text)) {
    return { kind: "cell" };
  }

  if (/\batom\b|\belectron\s+shell\w*\b|\bprotons?\b|\bneutrons?\b|\borbital\w*\b/.test(text)) {
    return { kind: "atom" };
  }

  if (/\bparabola\b|\bquadratic\b|\bvertex\b|\baxis\s+of\s+symmetry\b|\bx\s*\^?\s*2\b|\bsquared\b/.test(text)) {
    return { kind: "parabola" };
  }

  if (/\bcircle\b|\bradius\b|\bdiameter\b|\bcircumference\b|\barea\s+of\s+a\s+circle\b/.test(text)) {
    return { kind: "circle" };
  }

  if (/\bline\b|\bslope\b|\blinear\b|\bintercept\b|\bcoordinate\s+plane\b|\bcartesian\b/.test(text)) {
    const line = parseLineEquation(clean);
    return {
      kind: "coordinate-line",
      params: line ? { m: line.m, b: line.b } : undefined,
    };
  }

  return null;
}
