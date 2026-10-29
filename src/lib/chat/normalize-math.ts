/**
 * remark-math only treats `$$...$$` as display math when the delimiters sit on
 * their own lines. Models (and the demo tutor) often emit a single-line
 * `$$...$$`, which silently renders as inline math — so the formula never gets
 * the "copy LaTeX" / "save as image" controls.
 *
 * This normalises every single-line `$$...$$` into block form before render.
 * Multi-line display math and inline `$...$` are left untouched.
 */
export function normalizeDisplayMath(markdown: string): string {
  if (!markdown.includes("$$")) return markdown;

  const output: string[] = [];

  for (const line of markdown.split(/\r?\n/)) {
    const matches = line.match(/\$\$[^$]+\$\$/g);
    if (!matches || matches.length === 0) {
      output.push(line);
      continue;
    }

    let remainder = line;
    for (const match of matches) {
      const inner = match.slice(2, -2).trim();
      if (!inner) continue;
      // Use a replacer function: `$$` in a replacement string means a literal
      // dollar sign, which would collapse the display-math delimiters.
      remainder = remainder.replace(match, () => `\n\n$$\n${inner}\n$$\n\n`);
    }
    output.push(remainder);
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n");
}
