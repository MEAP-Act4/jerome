import {
  getLessonsForModule,
  getModulesForSubject,
  getSubjectByName,
  getTopicsForSubject,
} from "@/lib/data";

export const MATH_SUBJECTS = [
  "General Mathematics",
  "Statistics and Probability",
  "Pre-Calculus",
  "Basic Calculus",
] as const;

export function isMathSubject(subject: string): boolean {
  return (MATH_SUBJECTS as readonly string[]).includes(subject);
}

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "should",
  "so",
  "some",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
  "about",
  "explain",
  "help",
  "please",
  "need",
  "want",
  "know",
  "understand",
  "question",
  "answer",
  "example",
  "using",
  "use",
  "find",
  "get",
  "make",
  "give",
  "show",
  "step",
  "steps",
  "like",
  "also",
  "more",
  "most",
  "much",
  "many",
  "any",
  "all",
  "one",
  "two",
  "three",
  "first",
  "second",
  "next",
  "last",
  "really",
  "very",
  "again",
  "still",
  "even",
  "only",
  "own",
  "same",
  "other",
  "such",
  "nor",
  "not",
  "no",
  "yes",
  "ok",
  "okay",
  "sure",
  "hi",
  "hello",
  "hey",
  "thanks",
  "thank",
  "appreciate",
]);

const SYNONYMS: Record<string, string> = {
  differentiate: "derivative",
  differentiated: "derivative",
  differentiating: "derivative",
  differentiation: "derivative",
  derivative: "derivative",
  derivatives: "derivative",
  derive: "derivative",
  derived: "derivative",
  integrate: "integral",
  integrated: "integral",
  integrating: "integral",
  integration: "integral",
  antiderivative: "integral",
  antiderivatives: "integral",
  limits: "limit",
  functions: "function",
  equations: "equation",
  graphs: "graph",
  graphing: "graph",
  graphed: "graph",
  identities: "identity",
  probabilities: "probability",
  organelles: "organelle",
  mitochondria: "mitochondria",
  moles: "mole",
  isotopes: "isotope",
  alleles: "allele",
  forces: "force",
  velocities: "velocity",
  accelerations: "acceleration",
  reactions: "reaction",
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Whole-word/phrase containment, so "the mean" does not match "the meaning". */
export function containsPhrase(haystack: string, phrase: string): boolean {
  if (!phrase) return false;
  return ` ${haystack} `.includes(` ${phrase} `);
}

export function stemToken(token: string): string {
  if (token.length <= 3) return token;

  let t = token;
  if (t.endsWith("ies") && t.length > 4) t = `${t.slice(0, -3)}y`;
  else if (t.endsWith("ating") && t.length > 6) t = `${t.slice(0, -3)}e`;
  else if (t.endsWith("ing") && t.length > 5) t = t.slice(0, -3);
  else if (t.endsWith("ed") && t.length > 4) t = t.slice(0, -2);
  else if (t.endsWith("es") && t.length > 4) {
    // "classes" -> "class", "boxes" -> "box", but "earthquakes" -> "earthquake".
    t = /(sses|xes|zes|ches|shes)$/.test(t)
      ? t.slice(0, -2)
      : t.slice(0, -1);
  } else if (t.endsWith("s") && !t.endsWith("ss") && t.length > 3) {
    t = t.slice(0, -1);
  }

  return t;
}

export function tokenize(text: string): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];

  for (const raw of normalize(text).split(" ")) {
    if (!raw || raw.length < 2 || STOPWORDS.has(raw)) continue;
    const token = stemToken(SYNONYMS[raw] ?? raw);
    if (seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
  }

  return tokens;
}

export interface CurriculumMatch {
  subject: string;
  moduleId: string;
  moduleTitle: string;
  topicName: string;
  lessonId: string;
  lessonTitle: string;
  content: string;
  objectives: string[];
  score: number;
  matchedTerms: string[];
}

interface IndexedLesson extends CurriculumMatch {
  titleTokens: Set<string>;
  moduleTokens: Set<string>;
  topicTokens: Set<string>;
  objectiveTokens: Set<string>;
  contentTokens: Set<string>;
  normalizedTitle: string;
}

const indexCache = new Map<string, IndexedLesson[]>();

function buildIndex(subject: string): IndexedLesson[] {
  const topics = getTopicsForSubject(subject);
  const topicNameById = new Map(topics.map((topic) => [topic.id, topic.name]));
  const modules = getModulesForSubject(subject);
  const entries: IndexedLesson[] = [];

  for (const mod of modules) {
    const topicName = topicNameById.get(mod.topicId) ?? "";
    const moduleTokens = new Set(tokenize(mod.title));
    const topicTokens = new Set(tokenize(topicName));

    for (const lesson of getLessonsForModule(mod.id)) {
      entries.push({
        subject,
        moduleId: mod.id,
        moduleTitle: mod.title,
        topicName,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        content: lesson.content,
        objectives: lesson.objectives,
        score: 0,
        matchedTerms: [],
        titleTokens: new Set(tokenize(lesson.title)),
        moduleTokens,
        topicTokens,
        objectiveTokens: new Set(tokenize(lesson.objectives.join(" "))),
        contentTokens: new Set(tokenize(lesson.content)),
        normalizedTitle: normalize(lesson.title),
      });
    }
  }

  return entries;
}

function getIndex(subject: string): IndexedLesson[] {
  const cached = indexCache.get(subject);
  if (cached) return cached;

  const built = buildIndex(subject);
  indexCache.set(subject, built);
  return built;
}

/**
 * Rank the lessons in one subject against the student's actual message.
 * Only the current subject is indexed, so retrieval can never pull in another
 * subject's material.
 */
export function searchCurriculum(
  subject: string,
  query: string,
  limit = 3
): CurriculumMatch[] {
  const index = getIndex(subject);
  if (index.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const normalizedQuery = normalize(query);
  const scored: IndexedLesson[] = [];

  for (const entry of index) {
    let score = 0;
    const matched = new Set<string>();

    for (const token of queryTokens) {
      if (entry.titleTokens.has(token)) {
        score += 6;
        matched.add(token);
      }
      if (entry.moduleTokens.has(token)) {
        score += 3;
        matched.add(token);
      }
      if (entry.topicTokens.has(token)) {
        score += 3;
        matched.add(token);
      }
      if (entry.objectiveTokens.has(token)) {
        score += 2;
        matched.add(token);
      }
      if (entry.contentTokens.has(token)) {
        score += 1;
        matched.add(token);
      }
    }

    if (matched.size === 0) continue;

    if (
      entry.normalizedTitle &&
      normalizedQuery.includes(entry.normalizedTitle)
    ) {
      score += 12;
    }

    score += (matched.size / queryTokens.length) * 4;

    if (score < 4) continue;

    scored.push({
      ...entry,
      score,
      matchedTerms: Array.from(matched),
    });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => ({
      subject: entry.subject,
      moduleId: entry.moduleId,
      moduleTitle: entry.moduleTitle,
      topicName: entry.topicName,
      lessonId: entry.lessonId,
      lessonTitle: entry.lessonTitle,
      content: entry.content,
      objectives: entry.objectives,
      score: entry.score,
      matchedTerms: entry.matchedTerms,
    }));
}

export interface SubjectOutline {
  subject: string;
  description: string;
  topics: string[];
  modules: Array<{
    title: string;
    description: string;
    lessons: string[];
  }>;
}

export function getSubjectOutline(subject: string): SubjectOutline {
  const meta = getSubjectByName(subject);
  const topics = getTopicsForSubject(subject).map((topic) => topic.name);
  const modules = getModulesForSubject(subject).map((module) => ({
    title: module.title,
    description: module.description,
    lessons: getLessonsForModule(module.id).map((lesson) => lesson.title),
  }));

  return {
    subject,
    description: meta?.description?.trim() ?? "",
    topics,
    modules,
  };
}

const SUBJECT_KEYWORDS: Record<string, string[]> = {
  "General Mathematics": [
    "compound interest",
    "simple interest",
    "annuity",
    "amortization",
    "logarithm",
    "logarithmic",
    "exponential function",
    "piecewise",
    "proposition",
    "truth table",
    "logical connective",
    "conjunction",
    "disjunction",
    "negation",
    "business mathematics",
  ],
  "Statistics and Probability": [
    "probability",
    "statistics",
    "the mean",
    "arithmetic mean",
    "mean median mode",
    "median",
    "the mode",
    "standard deviation",
    "variance",
    "normal distribution",
    "z score",
    "z-score",
    "hypothesis testing",
    "null hypothesis",
    "permutation",
    "combination",
    "random variable",
    "sample space",
    "confidence interval",
    "correlation coefficient",
  ],
  "Pre-Calculus": [
    "trigonometric identity",
    "trig identity",
    "pythagorean identity",
    "unit circle",
    "reference angle",
    "inverse function",
    "composition of functions",
    "rational function",
    "conic section",
    "polar coordinates",
    "arithmetic sequence",
    "geometric sequence",
    "sigma notation",
    "domain and range",
    "domain of a function",
    "range of a function",
    "domain",
  ],
  "Basic Calculus": [
    "limit",
    "limits",
    "derivative",
    "differentiate",
    "differentiation",
    "integral",
    "antiderivative",
    "continuity",
    "chain rule",
    "product rule",
    "quotient rule",
    "tangent line",
    "related rates",
    "optimization",
    "indeterminate form",
  ],
  "General Biology 1": [
    "cell theory",
    "organelle",
    "organelles",
    "mitochondria",
    "ribosome",
    "nucleus",
    "chloroplast",
    "cell membrane",
    "prokaryote",
    "eukaryote",
    "cellular respiration",
    "glycolysis",
    "krebs cycle",
    "electron transport chain",
    "fermentation",
    "atp synthase",
  ],
  "General Biology 2": [
    "mendel",
    "mendelian",
    "punnett",
    "genotype",
    "phenotype",
    "dominant allele",
    "recessive allele",
    "allele",
    "hardy weinberg",
    "hardy-weinberg",
    "natural selection",
    "evolution",
    "speciation",
    "adaptation",
    "fossil record",
  ],
  "General Chemistry 1": [
    "atom",
    "atomic number",
    "mass number",
    "isotope",
    "electron configuration",
    "valence electron",
    "periodic table",
    "mole",
    "avogadro",
    "molar mass",
    "stoichiometry",
    "limiting reactant",
    "percent yield",
  ],
  "General Chemistry 2": [
    "chemical kinetics",
    "reaction rate",
    "rate law",
    "activation energy",
    "catalyst",
    "chemical equilibrium",
    "le chatelier",
    "le chateliers",
    "equilibrium constant",
    "kc",
    "kp",
  ],
  "General Physics 1": [
    "kinematics",
    "displacement",
    "velocity",
    "acceleration",
    "projectile motion",
    "projectile",
    "range of a projectile",
    "free fall",
    "kinematic equation",
    "newton",
    "newton's law",
    "inertia",
    "free body diagram",
    "net force",
    "action reaction",
    "friction",
    "kinetic energy",
    "potential energy",
    "work energy theorem",
    "momentum",
  ],
  "General Physics 2": [
    "coulomb",
    "electric field",
    "electric force",
    "ohm",
    "ohm's law",
    "circuit",
    "electric current",
    "voltage",
    "electrical resistance",
    "magnetism",
    "magnetic field",
    "electromagnetic induction",
    "optics",
    "lens",
    "mirror",
    "refraction",
    "reflection",
    "focal length",
    "snell",
  ],
  "Earth and Life Science": [
    "plate tectonics",
    "earthquake",
    "volcano",
    "geologic fault",
    "continental drift",
    "rock cycle",
    "geosphere",
    "hydrosphere",
    "atmosphere",
    "biosphere",
    "weather",
    "climate",
    "photosynthesis",
    "life process",
    "homeostasis",
    "ecosystem",
  ],
  "Research 1": [
    "research question",
    "qualitative research",
    "research problem",
    "literature review",
    "theoretical framework",
    "sampling",
    "interview",
    "focus group",
    "case study",
    "research design",
    "citation",
  ],
  "Research 2": [
    "quantitative research",
    "independent variable",
    "dependent variable",
    "hypothesis",
    "experimental design",
    "control group",
    "correlation",
    "regression",
    "survey questionnaire",
    "statistical treatment",
  ],
  "Capstone Project": [
    "capstone",
    "capstone project",
    "problem statement",
    "project proposal",
    "feasibility",
    "prototype",
    "project objective",
  ],
  "Empowerment Technologies": [
    "empowerment technology",
    "ict",
    "spreadsheet",
    "word processor",
    "presentation software",
    "credible source",
    "online source",
    "website credibility",
    "digital literacy",
    "mail merge",
  ],
  "Science, Technology and Society": [
    "science technology and society",
    "sts",
    "social change",
    "technological innovation",
    "science and technology",
    "technology and society",
    "innovation",
  ],
};

function keywordScore(subject: string, normalized: string, tokens: Set<string>) {
  const keywords = SUBJECT_KEYWORDS[subject] ?? [];
  let score = 0;

  for (const keyword of keywords) {
    const phrase = normalize(keyword);
    if (!phrase) continue;

    if (phrase.includes(" ")) {
      if (containsPhrase(normalized, phrase)) score += 4;
    } else if (tokens.has(stemToken(phrase))) {
      score += 2;
    }
  }

  return score;
}

/**
 * Return the other tutor subject a message is really about, or null when the
 * message belongs to the current subject (or is not clearly about another one).
 *
 * Shared foundational math (for example domain and range) is handled by the
 * curated concept notes before this check runs, so a calculus student can still
 * ask a foundational math question without being told to switch subjects.
 */
export function detectOtherSubject(
  currentSubject: string,
  message: string
): string | null {
  const normalized = normalize(message);
  const tokens = new Set(tokenize(message));
  if (tokens.size === 0) return null;

  const scores = new Map<string, number>();

  for (const subject of Object.keys(SUBJECT_KEYWORDS)) {
    const score = keywordScore(subject, normalized, tokens);
    if (score > 0) scores.set(subject, score);
  }

  const currentScore = scores.get(currentSubject) ?? 0;
  let bestSubject: string | null = null;
  let bestScore = 0;

  scores.forEach((score, subject) => {
    if (subject === currentSubject) return;
    if (score > bestScore) {
      bestScore = score;
      bestSubject = subject;
    }
  });

  if (!bestSubject || bestScore < 2) return null;
  if (bestScore <= currentScore) return null;

  return bestSubject;
}

const OFF_TOPIC_GROUPS: Array<{ label: string; keywords: string[] }> = [
  {
    label: "coding or programming",
    keywords: [
      "python",
      "javascript",
      "typescript",
      "html",
      "css",
      "java",
      "c++",
      "programming",
      "coding",
      "debug",
      "react",
      "sql",
    ],
  },
  {
    label: "English, literature, or essay writing",
    keywords: [
      "english essay",
      "essay about",
      "essay",
      "book report",
      "poem",
      "poetry",
      "novel",
      "literature",
      "grammar",
      "short story",
    ],
  },
  {
    label: "personal or relationship advice",
    keywords: [
      "girlfriend",
      "boyfriend",
      "crush",
      "relationship advice",
      "love advice",
      "breakup",
    ],
  },
  {
    label: "medical or health advice",
    keywords: [
      "diagnose",
      "diagnosis",
      "prescription",
      "medicine",
      "symptom",
      "doctor",
    ],
  },
  {
    label: "general trivia or entertainment",
    keywords: [
      "capital of",
      "president of",
      "movie",
      "netflix",
      "video game",
      "song lyrics",
      "celebrity",
    ],
  },
];

/** Catch requests that are clearly outside every STEM tutor subject. */
export function detectOffTopic(message: string): string | null {
  const normalized = normalize(message);
  const tokens = new Set(tokenize(message));
  if (tokens.size === 0) return null;

  for (const group of OFF_TOPIC_GROUPS) {
    for (const keyword of group.keywords) {
      const phrase = normalize(keyword);
      if (!phrase) continue;

      if (phrase.includes(" ")) {
        if (containsPhrase(normalized, phrase)) return group.label;
      } else if (tokens.has(stemToken(phrase))) {
        return group.label;
      }
    }
  }

  return null;
}
