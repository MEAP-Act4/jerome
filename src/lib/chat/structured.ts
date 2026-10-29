import type { QuizSpec } from "./quiz";
import type { VisualSpec, VisualKind } from "./visuals";

/**
 * Structured chat blocks are embedded in the assistant's markdown as compact
 * markers:
 *
 *   [[JEROME_VISUAL:<base64url json>]]
 *   [[JEROME_QUIZ:<base64url json>]]
 *
 * Base64url keeps the payload on one line and stops markdown from mangling the
 * JSON (quotes, brackets, dollar signs in LaTeX). The renderer turns each marker
 * into an interactive component instead of showing the raw marker.
 */
export type StructuredKind = "visual" | "quiz";

export type ContentSegment =
  | { type: "markdown"; content: string }
  | { type: "visual"; spec: VisualSpec }
  | { type: "quiz"; spec: QuizSpec };

const MARKER_RE = /\[\[JEROME_(VISUAL|QUIZ):([A-Za-z0-9_-]+)\]\]/g;

const VISUAL_KINDS: readonly VisualKind[] = [
  "unit-circle",
  "parabola",
  "right-triangle",
  "sine-wave",
  "coordinate-line",
  "free-body",
  "circle",
  "cell",
  "atom",
];

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      normalized.length % 4 === 0
        ? normalized
        : normalized + "=".repeat(4 - (normalized.length % 4));
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeStructuredBlock(
  kind: StructuredKind,
  payload: VisualSpec | QuizSpec
): string {
  const tag = kind === "visual" ? "VISUAL" : "QUIZ";
  return `[[JEROME_${tag}:${toBase64Url(JSON.stringify(payload))}]]`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isVisualSpec(value: unknown): value is VisualSpec {
  if (!isRecord(value)) return false;
  if (typeof value.kind !== "string") return false;
  if (!VISUAL_KINDS.includes(value.kind as VisualKind)) return false;
  if (value.title !== undefined && typeof value.title !== "string") return false;
  if (value.caption !== undefined && typeof value.caption !== "string") {
    return false;
  }
  if (value.params !== undefined) {
    if (!isRecord(value.params)) return false;
    for (const entry of Object.values(value.params)) {
      if (typeof entry !== "number" || !Number.isFinite(entry)) return false;
    }
  }
  return true;
}

function isQuizSpec(value: unknown): value is QuizSpec {
  if (!isRecord(value)) return false;
  if (typeof value.title !== "string" || typeof value.subject !== "string") {
    return false;
  }
  if (typeof value.topic !== "string") return false;
  if (!Array.isArray(value.questions) || value.questions.length === 0) {
    return false;
  }

  return value.questions.every((question) => {
    if (!isRecord(question)) return false;
    if (typeof question.prompt !== "string") return false;
    if (!Array.isArray(question.options) || question.options.length < 2) {
      return false;
    }
    if (
      !question.options.every((option) => typeof option === "string")
    ) {
      return false;
    }
    if (
      typeof question.answer !== "number" ||
      !Number.isInteger(question.answer) ||
      question.answer < 0 ||
      question.answer >= question.options.length
    ) {
      return false;
    }
    if (question.hint !== undefined && typeof question.hint !== "string") {
      return false;
    }
    if (
      question.explanation !== undefined &&
      typeof question.explanation !== "string"
    ) {
      return false;
    }
    return true;
  });
}

function decodeSpec(kind: "VISUAL" | "QUIZ", encoded: string): VisualSpec | QuizSpec | null {
  const raw = fromBase64Url(encoded);
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (kind === "VISUAL") return isVisualSpec(parsed) ? parsed : null;
  return isQuizSpec(parsed) ? parsed : null;
}

/**
 * Split assistant content into markdown and structured components. Invalid or
 * malformed markers are dropped so a bad model response never leaks raw JSON
 * into the chat.
 */
export function parseStructuredContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let cursor = 0;

  MARKER_RE.lastIndex = 0;
  let match: RegExpExecArray | null = MARKER_RE.exec(content);
  while (match !== null) {
    const index = match.index;
    const text = content.slice(cursor, index).trim();
    if (text) segments.push({ type: "markdown", content: text });

    const tag = match[1] as "VISUAL" | "QUIZ";
    const spec = decodeSpec(tag, match[2]);
    if (spec) {
      segments.push(
        tag === "VISUAL"
          ? { type: "visual", spec: spec as VisualSpec }
          : { type: "quiz", spec: spec as QuizSpec }
      );
    }

    cursor = index + match[0].length;
    match = MARKER_RE.exec(content);
  }

  const tail = content.slice(cursor).trim();
  if (tail) segments.push({ type: "markdown", content: tail });

  if (segments.length === 0) {
    return [{ type: "markdown", content: "" }];
  }

  return segments;
}
