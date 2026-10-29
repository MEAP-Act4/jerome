/**
 * Wraps display math (remark-math's `$$...$$` blocks) in a container element
 * that keeps the raw LaTeX around. The chat UI uses that raw source to offer
 * "copy LaTeX" and "save as image" actions per equation.
 *
 * This plugin must run BEFORE rehype-katex: KaTeX replaces the inner
 * `<pre><code class="language-math math-display">` node, but the wrapper
 * (and its `data-latex` attribute) survives.
 */

interface HastElement {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

type HastNode =
  | HastElement
  | { type: string; value?: string; children?: HastNode[] };

function isElement(node: HastNode): node is HastElement {
  return node.type === "element";
}

function classNames(node: HastElement): string[] {
  const value = node.properties?.className;
  return Array.isArray(value) ? value.map(String) : [];
}

function displayMathSource(node: HastNode): string | null {
  if (!isElement(node) || node.tagName !== "pre") return null;

  const code = node.children?.[0];
  if (!code || !isElement(code) || code.tagName !== "code") return null;

  const classes = classNames(code);
  if (!classes.includes("language-math") || !classes.includes("math-display")) {
    return null;
  }

  const latex = (code.children ?? [])
    .map((child) => (child.type === "text" ? child.value ?? "" : ""))
    .join("")
    .trim();

  return latex || null;
}

function walk(node: HastNode): void {
  const children = node.children;
  if (!children?.length) return;

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    const latex = displayMathSource(child);

    if (latex !== null) {
      children[index] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["math-block"],
          "data-latex": latex,
        },
        children: [child],
      };
      continue;
    }

    walk(child);
  }
}

export function rehypeWrapDisplayMath() {
  return (tree: HastNode) => {
    walk(tree);
  };
}
