/**
 * Message-aware demo replies used when GEMINI_API_KEY is not configured.
 *
 * The real tutor path uses Gemini. Without an API key the app should still
 * answer the student's actual question instead of dropping in a canned example
 * about some unrelated topic. This fallback does that with:
 *   1. a scope check (other subjects / clearly off-topic requests),
 *   2. curated concept notes for common questions,
 *   3. retrieval over the current subject's own lesson bank,
 *   4. a question-aware generic scaffold when nothing else matches.
 *
 * It also reads the conversation history, so follow-ups ("break that down",
 * "why?", "give me a real-life example", "what about ...") are resolved against
 * what was just discussed instead of replaying the first answer verbatim.
 */

import { findConceptNote, type ConceptNote } from "./concept-notes";
import {
  detectOffTopic,
  detectOtherSubject,
  getSubjectOutline,
  isMathSubject,
  searchCurriculum,
  tokenize,
  type CurriculumMatch,
} from "./curriculum";

export interface FallbackTurn {
  role: string;
  content: string;
}

const GREETING_RE =
  /^(hi|hello|hey|good (morning|afternoon|evening)|kamusta|kumusta)\b/i;
const THANKS_RE = /^(thanks|thank you|salamat|ty)\b/i;
const ACK_RE = /^(ok|okay|sure|got it|i see|alright)\b/i;

const BREAKDOWN_RE =
  /\b(break(?:\s+(?:it|this|that|the\s+(?:formula|equation|answer|problem)))?\s+down|breakdown|step[\s-]?by[\s-]?step|walk\s+me\s+through|show\s+(?:me\s+)?(?:the\s+)?steps|how\s+did\s+you\s+(?:get|do|solve|find)|where\s+did\b[^.]{0,40}\bcome\s+from|derive|derivation|go\s+deeper|more\s+detail|in\s+detail|elaborate|explain\s+(?:that|this|it)\s+(?:more|again|differently))\b/i;

const EXAMPLE_RE =
  /\b(real[\s-]?life|real[\s-]?world|everyday|concrete|practical)\b[^.]{0,60}\b(example|application|use|situation|scenario)\b|\bexample\b/i;

const FOLLOW_UP_START_RE =
  /^(and|also|so|then|but|now|next|why|how\s+about|what\s+about|can\s+you|could\s+you|would\s+you|please|go\s+on|continue|more|explain|elaborate|simplify|expand)\b/i;

const DEICTIC_RE =
  /\b(it|its|that|this|these|those|the same|previous|above|earlier|one)\b/i;

const QUIZ_RE =
  /\b(quiz|test me|practice|give me (?:a|one) question|ask me (?:a|one) question|try one)\b/i;

const WHY_RE = /^(why|how come|what(?:'s| is) the reason)\b/i;

const DEFAULT_TOPICS: Record<string, string> = {
  "Research 1": "writing a research question",
  "Research 2": "quantitative research design",
  "Capstone Project": "writing a problem statement",
  "Empowerment Technologies": "evaluating online sources",
  "Science, Technology and Society": "science, technology, and social change",
};

function cleanMessage(message: string): string {
  return message.replace(/\s+/g, " ").trim();
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function firstTopic(subject: string): string {
  const outline = getSubjectOutline(subject);
  return (
    outline.topics[0] ??
    outline.modules[0]?.title ??
    DEFAULT_TOPICS[subject] ??
    "the next topic in this subject"
  );
}

function assistantText(history: FallbackTurn[]): string {
  return history
    .filter((turn) => turn.role !== "student")
    .map((turn) => turn.content)
    .join("\n");
}

function lastAssistantText(history: FallbackTurn[]): string {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const turn = history[index];
    if (turn.role !== "student" && turn.content.trim()) return turn.content;
  }
  return "";
}

function recentContext(history: FallbackTurn[], turns = 6): string {
  return history
    .slice(-turns)
    .map((turn) => turn.content)
    .join("\n");
}

/** Whitespace/punctuation-insensitive form used to spot verbatim repeats. */
function fingerprint(text: string): string {
  return text
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\s+/g, "")
    .replace(/[`*_>#~\-–—]/g, "");
}

function containsText(haystack: string, needle: string): boolean {
  const target = fingerprint(needle);
  return target.length > 0 && fingerprint(haystack).includes(target);
}

function wasAlreadySent(text: string, history: FallbackTurn[]): boolean {
  const needle = fingerprint(text).slice(0, 140);
  if (needle.length < 40) return false;
  return fingerprint(assistantText(history)).includes(needle);
}

function isFollowUp(clean: string, hasHistory: boolean): boolean {
  if (!hasHistory) return false;
  if (BREAKDOWN_RE.test(clean) || EXAMPLE_RE.test(clean)) return true;
  if (FOLLOW_UP_START_RE.test(clean)) return true;
  return wordCount(clean) <= 10 && DEICTIC_RE.test(clean);
}

/** Split a lesson/note body into readable units, keeping display math intact. */
function bodyUnits(body: string): string[] {
  const units: string[] = [];

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    if (line.includes("$$")) {
      units.push(line);
      continue;
    }

    const stripped = line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
    const sentences = stripped.split(/(?<=[.!?])\s+(?=[A-Z0-9$])/);
    for (const sentence of sentences) {
      const value = sentence.trim();
      if (value) units.push(value);
    }
  }

  return units;
}

/**
 * Paragraph-level blocks — the natural "steps" of a concept note. Display math
 * is always split into its own block so a breakdown keeps the formula intact
 * instead of burying it inside a paragraph.
 */
function bodyBlocks(body: string): string[] {
  const blocks: string[] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length === 0) return;
    blocks.push(current.join("\n").trim());
    current = [];
  };

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }

    if (/^\$\$[\s\S]*\$\$$/.test(line)) {
      flush();
      blocks.push(line);
      continue;
    }

    current.push(line);
  }

  flush();
  return blocks.filter(Boolean);
}

/** Pick the units that overlap most with the student's wording. */
function selectRelevantUnits(
  units: string[],
  message: string,
  limit = 2
): string[] {
  const queryTokens = new Set(tokenize(message));
  if (queryTokens.size === 0) return [];

  return units
    .map((unit, index) => {
      const unitTokens = new Set(tokenize(unit));
      let score = 0;
      queryTokens.forEach((token) => {
        if (unitTokens.has(token)) score += 1;
      });
      return { unit, index, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.unit);
}

function closingFor(note: ConceptNote, priorAssistant: string): string {
  if (!containsText(priorAssistant, note.followUp)) return note.followUp;
  return "Want to try the next step yourself, or should I work through a similar example with different numbers?";
}

function buildBreakdownReply(
  note: ConceptNote,
  message: string,
  priorAssistant: string
): string {
  const blocks = bodyBlocks(note.body);
  const narrative = blocks.filter((block) => !block.startsWith("$$"));
  const relevant = selectRelevantUnits(narrative, message, 1);

  const lines: string[] = [
    `Let's break **${note.title}** down step by step.`,
    "",
  ];

  let step = 0;
  for (const block of blocks) {
    if (block.startsWith("$$")) {
      lines.push(block, "");
      continue;
    }

    step += 1;
    lines.push(`**Step ${step}.** ${block}`, "");
  }

  if (relevant.length > 0) {
    lines.push(
      `**The part your question points at:** ${relevant.join(" ")}`,
      ""
    );
  }

  lines.push(closingFor(note, priorAssistant));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildExampleReply(
  note: ConceptNote,
  priorAssistant: string
): string {
  const blocks = bodyBlocks(note.body);
  const formula = blocks.find((block) => block.startsWith("$$"));
  const example =
    note.realWorld ??
    blocks.find((block) =>
      /^(for example|for instance|example:|imagine|consider|think of|suppose)\b/i.test(
        block
      )
    ) ??
    blocks[1] ??
    blocks[0];

  const sections = [
    `Here's a real-life way to see **${note.title}**.`,
    example,
  ];

  if (formula) {
    sections.push(`**The idea in symbols:**\n\n${formula}`);
  }

  sections.push(closingFor(note, priorAssistant));
  return sections.filter(Boolean).join("\n\n");
}

function buildQuizReply(note: ConceptNote): string {
  return [
    `Here's one question on **${note.title}** — one step at a time:`,
    note.followUp,
    "Answer just this one, and I'll tell you whether you're on track before we move on.",
  ].join("\n\n");
}

function buildWhyReply(
  note: ConceptNote,
  message: string,
  priorAssistant: string
): string {
  const blocks = bodyBlocks(note.body);
  const narrative = blocks.filter((block) => !block.startsWith("$$"));
  const explanation =
    selectRelevantUnits(narrative, message, 1)[0] ?? narrative[0] ?? "";
  const formula = blocks.find((block) => block.startsWith("$$"));

  const sections = [
    `The reason **${note.title}** works this way:`,
    explanation,
  ];

  if (formula) {
    sections.push(`That is exactly what this formula encodes:\n\n${formula}`);
  }

  sections.push(closingFor(note, priorAssistant));
  return sections.filter(Boolean).join("\n\n");
}

function buildTargetedReply(
  note: ConceptNote,
  message: string,
  priorAssistant: string
): string {
  const relevant = selectRelevantUnits(bodyUnits(note.body), message, 2);

  if (relevant.length > 0) {
    return [
      `Here's the part of **${note.title}** that answers that:`,
      "",
      relevant.join(" "),
      "",
      closingFor(note, priorAssistant),
    ].join("\n");
  }

  return [
    `We already went over the overview of **${note.title}**, so let's use it instead of repeating it.`,
    "",
    note.followUp,
    "",
    "Tell me what you get and I'll check each step with you.",
  ].join("\n");
}

function buildLessonReply(match: CurriculumMatch): string {
  const objectives = match.objectives.slice(0, 3);

  return [
    `Here's the ${match.subject} lesson that matches what you asked: **${match.lessonTitle}**.`,
    "",
    match.content,
    objectives.length
      ? `\nBy the end of this lesson you should be able to:\n${objectives
          .map((objective) => `- ${objective}`)
          .join("\n")}`
      : "",
    "",
    `Want me to walk through an example of ${match.lessonTitle.toLowerCase()}, or would you rather try one yourself first?`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildLessonFollowUpReply(
  match: CurriculumMatch,
  message: string
): string {
  const units = bodyUnits(match.content);
  const relevant = selectRelevantUnits(units, message, 3);
  const excerpt = (relevant.length > 0 ? relevant : units.slice(0, 3)).join(" ");

  return [
    `Staying with **${match.lessonTitle}**, here's the part that connects to your follow-up:`,
    "",
    excerpt,
    "",
    "Want to try the next step yourself, or should I walk through another example?",
  ].join("\n");
}

function buildContextualFollowUp(
  clean: string,
  priorAssistant: string
): string {
  const formula = priorAssistant.match(/\$\$[\s\S]+?\$\$/)?.[0] ?? "";
  const shortQuestion =
    clean.length > 160 ? `${clean.slice(0, 157).trimEnd()}…` : clean;

  return [
    `Following up on "${shortQuestion}":`,
    "",
    formula,
    formula
      ? "Tell me which part is unclear — the symbols, the substitution, or the algebra — and I'll take just that piece."
      : "Tell me which part is unclear and I'll take just that piece.",
    "",
    "You can also paste the exact line where you got stuck.",
  ]
    .filter(Boolean)
    .join("\n");
}

const SQRT_EXPRESSION_RE =
  /(?:\\sqrt\s*\{\s*([^}]+?)\s*\}|\\sqrt\s*\(\s*([^)]+?)\s*\)|sqrt\s*\(\s*([^)]+?)\s*\)|√\s*\(\s*([^)]+?)\s*\)|√\s*([a-z0-9]+))/i;

const RATIONAL_EXPRESSION_RE =
  /(?:\\frac\s*\{\s*1\s*\}\s*\{\s*([^}]+?)\s*\}|1\s*\/\s*\(\s*([^)]+?)\s*\))/i;

function parseLinearShift(
  inner: string
): { boundary: number; direction: "ge" | "le" } | null {
  const compact = inner.replace(/\s+/g, "").toLowerCase();

  let match = compact.match(/^x([+-])(\d+(?:\.\d+)?)$/);
  if (match) {
    const constant = Number(match[2]);
    return {
      boundary: match[1] === "-" ? constant : -constant,
      direction: "ge",
    };
  }

  match = compact.match(/^(\d+(?:\.\d+)?)-x$/);
  if (match) {
    return { boundary: Number(match[1]), direction: "le" };
  }

  return null;
}

function domainSet(
  boundary: number,
  direction: "ge" | "le" | "ne"
): string {
  if (direction === "ne") {
    return String.raw`\{x \in \mathbb{R} \mid x \ne ${boundary}\}`;
  }
  if (direction === "ge") {
    return String.raw`[${boundary}, \infty)`;
  }
  return String.raw`(-\infty, ${boundary}]`;
}

/**
 * Domain/range follow-ups often name a new function ("what about sqrt(x-4)?"
 * or "break down the range part"). Those can be answered exactly with the
 * standard rules, which is more useful than restating the general note.
 */
function applyDomainRangeRule(
  subject: string,
  message: string,
  priorAssistant: string
): string | null {
  if (!isMathSubject(subject)) return null;

  const messageMentionsTopic = /\bdomain\b|\brange\b/i.test(message);
  const messageHasExpression =
    SQRT_EXPRESSION_RE.test(message) ||
    RATIONAL_EXPRESSION_RE.test(message);
  const priorMentionsTopic = /\bdomain\b|\brange\b/i.test(priorAssistant);

  // Only intercept domain/range questions. A new expression counts when the
  // thread is already about domain/range, but never when the student is asking
  // for a derivative, limit, or integral of that same expression.
  const asksSomethingElse =
    /\b(derivative|differentiate|integral|integrate|limit|slope|tangent)\b/i.test(
      message
    );
  if (asksSomethingElse) return null;
  if (!messageMentionsTopic && !(messageHasExpression && priorMentionsTopic)) {
    return null;
  }

  const source = messageHasExpression ? message : priorAssistant;
  if (!source) return null;

  const mentionsDomain = /\bdomain\b/i.test(message);
  const mentionsRange = /\brange\b/i.test(message);
  const priorMentionsDomain = /\bdomain\b/i.test(priorAssistant);
  const priorMentionsRange = /\brange\b/i.test(priorAssistant);

  const asksDomain =
    mentionsDomain ||
    (!mentionsDomain && !mentionsRange && priorMentionsDomain);
  const asksRange =
    mentionsRange || (!mentionsDomain && !mentionsRange && priorMentionsRange);
  const wantDomain = asksDomain || (!asksDomain && !asksRange);
  const wantRange = asksRange || (!asksDomain && !asksRange);

  const sqrtMatch = source.match(SQRT_EXPRESSION_RE);
  if (sqrtMatch) {
    const inner = (
      sqrtMatch[1] ??
      sqrtMatch[2] ??
      sqrtMatch[3] ??
      sqrtMatch[4] ??
      sqrtMatch[5] ??
      ""
    ).trim();
    const shift = parseLinearShift(inner);
    if (!shift) return null;

    const latexInner = inner.replace(/\s+/g, "");
    const lines: string[] = [`For $f(x)=\\sqrt{${latexInner}}$:`, ""];

    if (wantDomain) {
      const inequality =
        shift.direction === "ge"
          ? String.raw`${latexInner} \ge 0 \Rightarrow x \ge ${shift.boundary}`
          : String.raw`${latexInner} \ge 0 \Rightarrow x \le ${shift.boundary}`;
      lines.push(
        "**Domain.** The expression under the square root must be non-negative:",
        `$$${inequality}$$`,
        `So the domain is $${domainSet(shift.boundary, shift.direction)}$.`,
        ""
      );
    }

    if (wantRange) {
      lines.push(
        "**Range.** A square root never returns a negative value, and it reaches 0 at the boundary:",
        String.raw`$$\text{range}=[0,\infty)$$`
      );
    }

    lines.push("", "Want to try a similar function with different numbers?");
    return lines.join("\n").trim();
  }

  const rationalMatch = source.match(RATIONAL_EXPRESSION_RE);
  if (rationalMatch) {
    const inner = (rationalMatch[1] ?? rationalMatch[2] ?? "").trim();
    const shift = parseLinearShift(inner);
    if (!shift) return null;

    const latexInner = inner.replace(/\s+/g, "");
    const lines: string[] = [`For $f(x)=\\frac{1}{${latexInner}}$:`, ""];

    if (wantDomain) {
      lines.push(
        "**Domain.** The denominator cannot be zero:",
        `$$${latexInner} \\ne 0 \\Rightarrow x \\ne ${shift.boundary}$$`,
        `So the domain is $${domainSet(shift.boundary, "ne")}$.`,
        ""
      );
    }

    if (wantRange) {
      lines.push(
        "**Range.** The numerator is never zero, so the output never reaches 0:",
        String.raw`$$\text{range}=\{y \in \mathbb{R} \mid y \ne 0\}$$`
      );
    }

    lines.push("", "Want to try a similar function with different numbers?");
    return lines.join("\n").trim();
  }

  return null;
}

/**
 * If the student names a concrete expression, answer that expression directly
 * before falling back to the general note. Only patterns that can be handled
 * with certainty are intercepted; anything else returns null.
 */
function refineNoteForExpression(
  note: ConceptNote,
  message: string
): string | null {
  const text = message.replace(/\s+/g, " ");

  const trig = text.match(/\b(sin|cos|tan)\s*\(\s*([0-9]*)\s*([a-z])\s*\)/i);
  if (trig && note.id === "trig-derivatives") {
    const fn = trig[1].toLowerCase();
    const coefficient = trig[2] ? Number(trig[2]) : 1;
    const variable = trig[3].toLowerCase();
    const inner = coefficient === 1 ? variable : `${coefficient}${variable}`;
    const factor = coefficient === 1 ? "" : String(coefficient);
    const result =
      fn === "sin"
        ? String.raw`\frac{d}{dx}\sin(${inner})=${factor}\cos(${inner})`
        : fn === "cos"
          ? String.raw`\frac{d}{dx}\cos(${inner})=-${factor}\sin(${inner})`
          : String.raw`\frac{d}{dx}\tan(${inner})=${factor}\sec^2(${inner})`;

    return [
      `For your expression $\\${fn}(${inner})$:`,
      "",
      `$$${result}$$`,
      "",
      "The factor in front comes from the chain rule.",
      "",
      note.body,
      "",
      note.followUp,
    ].join("\n");
  }

  const power = text.match(/\b([a-z])\s*\^\s*([0-9]+)\b/i);
  if (power && note.id === "derivative-rules") {
    const variable = power[1].toLowerCase();
    const exponent = Number(power[2]);
    const result = String.raw`\frac{d}{dx}${variable}^{${exponent}}=${exponent}${variable}^{${exponent - 1}}`;

    return [
      `For your expression $${variable}^{${exponent}}$:`,
      "",
      `$$${result}$$`,
      "",
      note.body,
      "",
      note.followUp,
    ].join("\n");
  }

  return null;
}

export function fallbackTutorReply(
  subject: string,
  message = "",
  history: FallbackTurn[] = []
): string {
  const clean = cleanMessage(message);
  const turns = history.filter((turn) => turn.content.trim());
  const hasHistory = turns.length > 0;
  const priorAssistant = lastAssistantText(turns);
  const followUp = isFollowUp(clean, hasHistory);
  const outline = getSubjectOutline(subject);
  const topic = firstTopic(subject);
  const topicList = outline.topics.length
    ? outline.topics.join(", ")
    : outline.modules.map((module) => module.title).join(", ");

  if (!clean) {
    return [
      `I'm ready to help with **${subject}**.`,
      topicList ? `We can start with ${topicList}.` : "",
      "What would you like to work on?",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (GREETING_RE.test(clean)) {
    const priorNote = hasHistory
      ? findConceptNote(subject, priorAssistant)
      : null;
    if (priorNote) {
      return [
        `Hi again! We were working on **${priorNote.title}**.`,
        "Want to keep going, or is there something else you want to try?",
      ].join("\n");
    }
    return [
      `Hi! I'm ready to help with **${subject}**.`,
      topicList ? `We can start with ${topicList}.` : "",
      "Paste a problem or ask about a concept, and we'll work through it together.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (THANKS_RE.test(clean)) {
    return [
      "You're welcome!",
      `Want to keep going with **${topic}**, or is there another ${subject} question you want to try?`,
    ].join("\n");
  }

  if (ACK_RE.test(clean) && clean.length <= 20) {
    if (hasHistory) {
      return [
        `Alright — let's keep going with **${subject}**.`,
        "Take the next step yourself and paste your work; I'll check it line by line.",
      ].join("\n");
    }
    return [
      `Got it. Let's keep going with **${subject}**.`,
      `What would you like to try next — ${topicList || "the next topic"}?`,
    ].join("\n");
  }

  const offTopic = detectOffTopic(clean);
  if (offTopic) {
    return [
      `That looks like ${offTopic}, which is outside the STEM subject we're working on.`,
      `I can only help with **${subject}** here.`,
      topicList
        ? `If you want to keep going, we can work on ${topicList}.`
        : `If you want to keep going, ask me an in-scope ${subject} question.`,
      "What would you like to try?",
    ]
      .filter(Boolean)
      .join("\n");
  }

  // A follow-up may not repeat the topic name ("break that down", "why?"), so
  // fall back to the most recent turn to work out what "that" refers to.
  let note = findConceptNote(subject, clean);
  if (!note && followUp) {
    note =
      findConceptNote(subject, priorAssistant) ??
      findConceptNote(subject, recentContext(turns, 4));
  }

  const otherSubject = detectOtherSubject(subject, clean);
  if (otherSubject) {
    // Foundational math notes are shared across the math subjects, so a
    // domain/range question inside Basic Calculus stays in scope. Everything
    // else that clearly belongs to another subject is refused.
    const sharedMathNote =
      note && isMathSubject(subject) && isMathSubject(otherSubject);

    if (!sharedMathNote) {
      return [
        `I can only help with **${subject}** right now, so I can't answer a ${otherSubject} question here.`,
        `Switch the subject selector on the left to **${otherSubject}** if you want to study that.`,
        `If you want to stay in ${subject}, we can work on **${topic}** next.`,
      ].join("\n");
    }
  }

  const domainRangeReply = applyDomainRangeRule(subject, clean, priorAssistant);
  if (domainRangeReply) return domainRangeReply;

  if (note) {
    const alreadySent = wasAlreadySent(note.body, turns);

    if (BREAKDOWN_RE.test(clean)) {
      return buildBreakdownReply(note, clean, priorAssistant);
    }

    if (EXAMPLE_RE.test(clean) && followUp) {
      return buildExampleReply(note, priorAssistant);
    }

    if (QUIZ_RE.test(clean) && followUp) {
      return buildQuizReply(note);
    }

    if (WHY_RE.test(clean) && followUp) {
      return buildWhyReply(note, clean, priorAssistant);
    }

    const refined = refineNoteForExpression(note, clean);
    if (refined) return refined;

    if (alreadySent) {
      return buildTargetedReply(note, clean, priorAssistant);
    }

    return [note.body, "", note.followUp].join("\n");
  }

  const matches = searchCurriculum(
    subject,
    followUp ? `${clean} ${recentContext(turns, 4)}` : clean,
    2
  );
  const best = matches[0];

  if (best) {
    if (followUp && wasAlreadySent(best.content, turns)) {
      return buildLessonFollowUpReply(best, clean);
    }
    return buildLessonReply(best);
  }

  if (followUp) {
    return buildContextualFollowUp(clean, priorAssistant);
  }

  const shortQuestion =
    clean.length > 160 ? `${clean.slice(0, 157).trimEnd()}…` : clean;

  return [
    `You asked: "${shortQuestion}"`,
    "",
    "I don't want to swap in a different example, so let's anchor on that exact question. A reliable way to start:",
    "",
    "1. Write down what is given and what is being asked.",
    `2. Name the ${subject} concept or rule that connects them.`,
    "3. Apply it one step at a time, then check whether the result makes sense.",
    "",
    topicList
      ? `The ${subject} topics I can support are: ${topicList}.`
      : `Ask me anything from the ${subject} MELC topics and I'll help you break it down.`,
    "If you share the exact function, values, or problem statement, I can walk through the specific steps with you.",
  ]
    .filter(Boolean)
    .join("\n");
}
