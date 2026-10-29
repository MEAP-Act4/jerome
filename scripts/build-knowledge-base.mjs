import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "datasets", "_sources", "mmlu");
const DATASET_DIR = path.join(ROOT, "datasets");
const KB_DIR = path.join(ROOT, "src", "lib", "knowledge-base");
const KB_FILE = path.join(KB_DIR, "datasets.generated.json");

const SOURCE_META = {
  dataset: "cais/mmlu",
  url: "https://huggingface.co/datasets/cais/mmlu",
  license: "MIT",
  citation:
    "Hendrycks, D., Burns, C., Basart, S., Zou, A., Mazeika, M., Song, D., & Steinhardt, J. (2021). Measuring Massive Multitask Language Understanding. ICLR 2021.",
};

const CURATED_META = {
  dataset: "JEROME STEM Question Bank",
  config: "question_bank",
  url: "",
  license: "Teacher-provided",
  citation:
    "JEROME STEM Adaptive Practice Dataset - Question Bank (teacher-provided, 2026).",
};

const CURATED_FILE = path.join(
  ROOT,
  "datasets",
  "_sources",
  "curated",
  "question_bank.csv"
);

const DIFFICULTY_LABEL = { 1: "Easy", 2: "Medium", 3: "Hard" };

const DIFFICULTY = {
  elementary_mathematics: { level: 1, label: "Easy", seconds: 45 },
  high_school_mathematics: { level: 2, label: "Medium", seconds: 60 },
  college_mathematics: { level: 3, label: "Hard", seconds: 90 },
  college_biology: { level: 3, label: "Hard", seconds: 90 },
  high_school_biology: { level: 2, label: "Medium", seconds: 60 },
  college_chemistry: { level: 3, label: "Hard", seconds: 90 },
  high_school_chemistry: { level: 2, label: "Medium", seconds: 60 },
  college_physics: { level: 3, label: "Hard", seconds: 90 },
  high_school_physics: { level: 2, label: "Medium", seconds: 60 },
  astronomy: { level: 3, label: "Hard", seconds: 90 },
  conceptual_physics: { level: 2, label: "Medium", seconds: 60 },
  high_school_statistics: { level: 2, label: "Medium", seconds: 60 },
};

const SUBJECTS = [
  {
    id: "pre-calculus",
    name: "Pre-Calculus",
    code: "PRECALC",
    category: "Specialized",
    description:
      "Trigonometric identities, functions, graphs, and analytic geometry foundations.",
    sources: [{ config: "high_school_mathematics" }],
    fallback: 1,
    topics: [
      {
        id: "precalc-trig-identities",
        name: "Trigonometric Identities",
        keywords: ["trig", "sine", "cosine", "tangent", "sin", "cos", "tan", "identity", "angle", "radian"],
      },
      {
        id: "precalc-functions-graphs",
        name: "Functions and Graphs",
        keywords: ["function", "graph", "domain", "range", "inverse", "polynomial", "asymptote", "logarithm", "slope", "equation"],
      },
    ],
  },
  {
    id: "basic-calculus",
    name: "Basic Calculus",
    code: "BASICCALC",
    category: "Specialized",
    description:
      "Limits, continuity, derivatives, and an introduction to integration.",
    sources: [{ config: "college_mathematics" }],
    topics: [
      {
        id: "basiccalc-limits",
        name: "Limits",
        keywords: ["limit", "limits", "approaches", "continuity", "continuous", "asymptote", "infinity"],
      },
      {
        id: "basiccalc-derivatives",
        name: "Derivatives",
        keywords: ["derivative", "differentiate", "differentiation", "tangent", "slope", "rate of change", "integral", "integrate"],
      },
    ],
  },
  {
    id: "general-biology-1",
    name: "General Biology 1",
    code: "BIO1",
    category: "Specialized",
    description:
      "Cell structure, biomolecules, cellular energetics, and transport.",
    sources: [{ config: "college_biology" }],
    topics: [
      {
        id: "bio1-cell-structure",
        name: "Cell Structure",
        keywords: ["cell", "organelle", "membrane", "nucleus", "mitochondri", "ribosome", "dna", "rna", "protein", "enzyme"],
      },
      {
        id: "bio1-cellular-respiration",
        name: "Cellular Respiration",
        keywords: ["respiration", "glycolysis", "atp", "krebs", "electron transport", "photosynthesis", "metabolism", "energy"],
      },
    ],
  },
  {
    id: "general-biology-2",
    name: "General Biology 2",
    code: "BIO2",
    category: "Specialized",
    description:
      "Heredity, genetics, evolution, and the diversity of living systems.",
    sources: [{ config: "high_school_biology" }],
    topics: [
      {
        id: "bio2-heredity",
        name: "Heredity and Genetics",
        keywords: ["gene", "genetic", "allele", "mendel", "inherit", "genotype", "phenotype", "chromosome", "dna", "cross"],
      },
      {
        id: "bio2-evolution",
        name: "Evolution",
        keywords: ["evolution", "natural selection", "species", "darwin", "mutation", "population", "fossil", "adapt"],
      },
    ],
  },
  {
    id: "general-chemistry-1",
    name: "General Chemistry 1",
    code: "CHEM1",
    category: "Specialized",
    description:
      "Matter, atomic structure, bonding, and stoichiometric calculations.",
    sources: [{ config: "college_chemistry" }],
    topics: [
      {
        id: "chem1-atomic-structure",
        name: "Atomic Structure",
        keywords: ["atom", "electron", "proton", "neutron", "orbital", "isotope", "periodic", "bond", "molecule", "ion"],
      },
      {
        id: "chem1-mole-concept",
        name: "Mole Concept and Stoichiometry",
        keywords: ["mole", "molar", "stoichiometr", "avogadro", "concentration", "mass", "reaction", "balanced"],
      },
    ],
  },
  {
    id: "general-chemistry-2",
    name: "General Chemistry 2",
    code: "CHEM2",
    category: "Specialized",
    description:
      "Chemical kinetics, equilibrium, acids and bases, and thermodynamics.",
    sources: [{ config: "high_school_chemistry" }],
    fallback: 1,
    topics: [
      {
        id: "chem2-kinetics",
        name: "Chemical Kinetics",
        keywords: ["rate", "kinetic", "catalyst", "activation energy", "collision", "reaction rate"],
      },
      {
        id: "chem2-equilibrium",
        name: "Chemical Equilibrium",
        keywords: ["equilibrium", "le chatelier", "acid", "base", "ph", "buffer", "solubility", "constant", "thermodynamic"],
      },
    ],
  },
  {
    id: "general-physics-1",
    name: "General Physics 1",
    code: "PHYS1",
    category: "Specialized",
    description:
      "Mechanics, kinematics, Newton's laws, work, energy, and momentum.",
    sources: [{ config: "college_physics" }],
    fallback: 1,
    topics: [
      {
        id: "phys1-kinematics",
        name: "Kinematics",
        keywords: ["velocity", "acceleration", "motion", "displacement", "projectile", "speed", "distance", "time"],
      },
      {
        id: "phys1-newtons-laws",
        name: "Newton's Laws of Motion",
        keywords: ["force", "newton", "friction", "mass", "momentum", "gravity", "work", "energy", "torque", "collision"],
      },
    ],
  },
  {
    id: "general-physics-2",
    name: "General Physics 2",
    code: "PHYS2",
    category: "Specialized",
    description:
      "Electricity, magnetism, circuits, optics, and modern physics.",
    sources: [{ config: "high_school_physics" }],
    topics: [
      {
        id: "phys2-electricity",
        name: "Electricity and Magnetism",
        keywords: ["electric", "charge", "current", "circuit", "voltage", "resistance", "magnetic", "field", "capacitor", "induction"],
      },
      {
        id: "phys2-optics",
        name: "Optics",
        keywords: ["light", "lens", "mirror", "refract", "reflect", "wavelength", "optic", "wave", "frequency", "photon"],
      },
    ],
  },
  {
    id: "earth-and-life-science",
    name: "Earth and Life Science",
    code: "ELS",
    category: "STEM Core",
    description:
      "Earth's systems, geology, climate, astronomy, and life processes.",
    sources: [{ config: "astronomy" }, { config: "conceptual_physics" }],
    topics: [
      {
        id: "els-earth-systems",
        name: "Earth's Systems",
        keywords: ["earth", "atmosphere", "climate", "rock", "plate", "ocean", "weather", "planet", "solar", "geolog", "volcan", "star", "galaxy"],
      },
      {
        id: "els-life-processes",
        name: "Life Processes",
        keywords: ["life", "organism", "cell", "photosynthesis", "ecosystem", "evolution", "species", "energy", "water cycle"],
      },
    ],
  },
  {
    id: "general-mathematics",
    name: "General Mathematics",
    code: "GENMATH",
    category: "STEM Core",
    description:
      "Functions, rational expressions, logic, and real-world modeling.",
    sources: [{ config: "elementary_mathematics" }],
    topics: [
      {
        id: "genmath-functions",
        name: "Functions",
        keywords: ["function", "graph", "equation", "linear", "quadratic", "inverse", "fraction", "percent", "ratio", "proportion"],
      },
      {
        id: "genmath-logic",
        name: "Logic",
        keywords: ["logic", "proposition", "truth", "argument", "fallacy", "valid", "statement", "set"],
      },
    ],
  },
  {
    id: "statistics-and-probability",
    name: "Statistics and Probability",
    code: "STATS",
    category: "STEM Core",
    description:
      "Descriptive statistics, probability, distributions, and inference.",
    sources: [{ config: "high_school_statistics" }],
    topics: [
      {
        id: "stats-descriptive",
        name: "Descriptive Statistics",
        keywords: ["mean", "median", "mode", "variance", "standard deviation", "distribution", "data", "sample", "graph", "quartile"],
      },
      {
        id: "stats-probability",
        name: "Probability",
        keywords: ["probability", "event", "random", "chance", "independent", "complement", "conditional", "odds", "die", "coin"],
      },
    ],
  },
];

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function answerLetter(value) {
  if (typeof value === "number") return ["A", "B", "C", "D"][value] ?? null;
  const letter = String(value).trim().toUpperCase();
  return ["A", "B", "C", "D"].includes(letter) ? letter : null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordScore(question, keywords) {
  const text = ` ${slug(question)} `;
  let score = 0;

  for (const keyword of keywords) {
    const token = slug(keyword);
    if (!token) continue;

    if (token.includes(" ")) {
      if (text.includes(` ${token} `)) score += 1;
    } else {
      const pattern = new RegExp(`(^| )${escapeRegExp(token)}[a-z]*( |$)`);
      if (pattern.test(text)) score += 1;
    }
  }

  return score;
}

function assignTopic(question, topics, fallbackIndex) {
  let best = null;
  let bestScore = 0;

  for (const topic of topics) {
    const score = keywordScore(question, topic.keywords);
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }

  if (best) return best;
  return topics[fallbackIndex] ?? topics[0];
}

function csvCell(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function toCsv(headers, rows) {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((value) => value !== ""));
}

async function loadCuratedRows() {
  const raw = await fs.readFile(CURATED_FILE, "utf8");
  const table = parseCsv(raw.replace(/^\uFEFF/, ""));
  const header = table[0];
  return table.slice(1).map((row) =>
    Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""]))
  );
}

async function loadSource(config) {
  const file = path.join(SOURCE_DIR, `${config}.json`);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}

const seenQuestions = new Set();
const generatedSubjects = [];
const generatedAt = new Date().toISOString();
const curatedRows = await loadCuratedRows();

for (const subject of SUBJECTS) {
  const questions = [];
  const sourceSummary = new Map();

  const recordSource = (source, count) => {
    const key = `${source.dataset}::${source.config}`;
    const entry = sourceSummary.get(key) ?? { ...source, questionCount: 0 };
    entry.questionCount += count;
    sourceSummary.set(key, entry);
  };

  const addQuestion = (question) => {
    questions.push(question);
    seenQuestions.add(slug(question.questionText));
  };

  let curatedAccepted = 0;
  for (const row of curatedRows) {
    if (row.subject !== subject.name) continue;

    const topic = subject.topics.find((entry) => entry.name === row.topic);
    const correctAnswer = answerLetter(row.correct_answer);
    const key = slug(row.question_text);
    if (!topic || !correctAnswer || !key || seenQuestions.has(key)) continue;

    const level = Number(row.difficulty_level) || 2;

    addQuestion({
      id: `CUR-${subject.code}-${String(curatedAccepted + 1).padStart(3, "0")}`,
      subjectId: subject.id,
      subjectName: subject.name,
      topicId: topic.id,
      topicName: topic.name,
      difficulty: level,
      difficultyLabel: row.difficulty_label || DIFFICULTY_LABEL[level],
      questionText: row.question_text,
      options: {
        A: row.option_a,
        B: row.option_b,
        C: row.option_c,
        D: row.option_d,
      },
      correctAnswer,
      explanation: row.explanation,
      estTimeSec: Number(row.est_time_sec) || 60,
      source: CURATED_META,
    });

    curatedAccepted += 1;
  }

  if (curatedAccepted > 0) recordSource(CURATED_META, curatedAccepted);

  for (const source of subject.sources) {
    const payload = await loadSource(source.config);
    const difficulty = DIFFICULTY[source.config];
    let accepted = 0;

    for (const row of payload.rows) {
      const key = slug(row.question);
      if (!key || seenQuestions.has(key)) continue;

      const choices = Array.isArray(row.choices) ? row.choices : [];
      const correctAnswer = answerLetter(row.answer);
      if (choices.length !== 4 || !correctAnswer) continue;

      const topic = assignTopic(
        row.question,
        subject.topics,
        subject.fallback ?? 0
      );

      addQuestion({
        id: `MMLU-${subject.code}-${String(accepted + 1).padStart(4, "0")}`,
        subjectId: subject.id,
        subjectName: subject.name,
        topicId: topic.id,
        topicName: topic.name,
        difficulty: difficulty.level,
        difficultyLabel: difficulty.label,
        questionText: row.question,
        options: {
          A: choices[0],
          B: choices[1],
          C: choices[2],
          D: choices[3],
        },
        correctAnswer,
        explanation: `The correct answer is ${correctAnswer}. Source: MMLU ${source.config} (MIT).`,
        estTimeSec: difficulty.seconds,
        source: {
          dataset: SOURCE_META.dataset,
          config: source.config,
          license: SOURCE_META.license,
          url: SOURCE_META.url,
          citation: SOURCE_META.citation,
        },
      });

      accepted += 1;
    }

    recordSource(
      {
        dataset: SOURCE_META.dataset,
        config: source.config,
        license: SOURCE_META.license,
        url: SOURCE_META.url,
        citation: SOURCE_META.citation,
      },
      accepted
    );
  }

  const topicCounts = Object.fromEntries(
    subject.topics.map((topic) => [
      topic.id,
      questions.filter((question) => question.topicId === topic.id).length,
    ])
  );

  const difficultyCounts = questions.reduce((acc, question) => {
    acc[question.difficultyLabel] = (acc[question.difficultyLabel] ?? 0) + 1;
    return acc;
  }, {});

  const subjectDir = path.join(DATASET_DIR, subject.id);
  await fs.mkdir(subjectDir, { recursive: true });

  const questionRows = questions.map((question) => [
    question.id,
    question.subjectId,
    question.subjectName,
    question.topicId,
    question.topicName,
    question.difficulty,
    question.difficultyLabel,
    question.questionText,
    question.options.A,
    question.options.B,
    question.options.C,
    question.options.D,
    question.correctAnswer,
    question.explanation,
    question.estTimeSec,
    question.source.dataset,
    question.source.config,
    question.source.url,
    question.source.license,
  ]);

  await fs.writeFile(
    path.join(subjectDir, "questions.csv"),
    toCsv(
      [
        "id",
        "subject_id",
        "subject",
        "topic_id",
        "topic",
        "difficulty",
        "difficulty_label",
        "question_text",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct_answer",
        "explanation",
        "est_time_sec",
        "source_dataset",
        "source_config",
        "source_url",
        "license",
      ],
      questionRows
    ),
    "utf8"
  );

  await fs.writeFile(
    path.join(subjectDir, "topics.csv"),
    toCsv(
      ["topic_id", "topic", "subject_id", "subject", "question_count"],
      subject.topics.map((topic) => [
        topic.id,
        topic.name,
        subject.id,
        subject.name,
        topicCounts[topic.id],
      ])
    ),
    "utf8"
  );

  const metadata = {
    id: subject.id,
    name: subject.name,
    category: subject.category,
    description: subject.description,
    generatedAt,
    questionCount: questions.length,
    topicCount: subject.topics.length,
    method:
      "Normalized from the MMLU test split; topic assigned with keyword matching; difficulty derived from source level.",
    topics: subject.topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      questionCount: topicCounts[topic.id],
    })),
    difficultyCounts,
    sources: Array.from(sourceSummary.values()),
    files: {
      questions: "questions.csv",
      topics: "topics.csv",
      metadata: "metadata.json",
    },
  };

  await fs.writeFile(
    path.join(subjectDir, "metadata.json"),
    JSON.stringify(metadata, null, 2),
    "utf8"
  );

  generatedSubjects.push({
    id: subject.id,
    name: subject.name,
    category: subject.category,
    description: subject.description,
    folder: `datasets/${subject.id}`,
    questionCount: questions.length,
    topicCount: subject.topics.length,
    difficultyCounts,
    sources: metadata.sources,
    topics: metadata.topics,
    questions,
  });

  console.log(
    `${subject.id.padEnd(28)} ${String(questions.length).padStart(4)} questions  ${JSON.stringify(topicCounts)}`
  );
}

const totals = generatedSubjects.reduce(
  (acc, subject) => {
    acc.subjects += 1;
    acc.questions += subject.questionCount;
    acc.topics += subject.topicCount;
    return acc;
  },
  { subjects: 0, questions: 0, topics: 0 }
);

const manifest = {
  name: "JEROME STEM Knowledge Base",
  version: 1,
  generatedAt,
  source: SOURCE_META,
  additionalSources: [CURATED_META],
  method:
    "Teacher-provided question bank first, then MMLU test split; topic assignment uses the bank's labels or keyword heuristics; difficulty is taken from the source or derived from its level.",
  totals,
  subjects: generatedSubjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    category: subject.category,
    folder: subject.folder,
    questionCount: subject.questionCount,
    topicCount: subject.topicCount,
    difficultyCounts: subject.difficultyCounts,
    sources: subject.sources.map((source) => ({
      dataset: source.dataset,
      config: source.config,
      license: source.license,
      questionCount: source.questionCount,
    })),
  })),
};

await fs.writeFile(
  path.join(DATASET_DIR, "manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

await fs.mkdir(KB_DIR, { recursive: true });
await fs.writeFile(
  KB_FILE,
  JSON.stringify(
    {
      generatedAt,
      source: SOURCE_META,
      additionalSources: [CURATED_META],
      method:
        "Teacher-provided question bank first, then MMLU test split; topic assignment uses the bank's labels or keyword heuristics; difficulty is taken from the source or derived from its level.",
      totals,
      subjects: generatedSubjects,
    },
    null,
    2
  ),
  "utf8"
);

const readme = [
  "# JEROME STEM Knowledge Base Datasets",
  "",
  "STEM question datasets used by the JEROME adaptive practice app.",
  "Each subject has its own folder so the data can be reviewed independently of the application code.",
  "Sources are the teacher-provided JEROME question bank and the MMLU benchmark (test split), normalized to one schema.",
  "",
  "## Folder layout",
  "",
  "```",
  "datasets/",
  "  README.md",
  "  manifest.json",
  "  _sources/mmlu/          raw downloaded source data (MMLU, test split)",
  "  _sources/curated/       teacher-provided question bank (original UTF-8 CSV)",
  ...generatedSubjects.map((subject) => `  ${subject.id}/`.padEnd(30) + `questions.csv, topics.csv, metadata.json`),
  "```",
  "",
  "## Subject summary",
  "",
  "| Subject | Folder | Questions | Topics | Sources |",
  "| --- | --- | ---: | ---: | --- |",
  ...generatedSubjects.map(
    (subject) =>
      `| ${subject.name} | \`${subject.folder}\` | ${subject.questionCount} | ${subject.topicCount} | ${subject.sources
        .map((source) => `${source.dataset}: ${source.config}`)
        .join(", ")} |`
  ),
  "",
  `**Total:** ${totals.subjects} subjects · ${totals.questions} questions · ${totals.topics} topics.`,
  "",
  "## Method",
  "",
  "- The teacher-provided question bank is loaded first, keeping its original topic and difficulty labels.",
  "- Remaining slots are filled from the MMLU `test` split for each subject's mapped config.",
  "- Duplicate questions are removed globally, and every row is validated for four options and an A-D answer.",
  "- MMLU topics are assigned with keyword heuristics against the existing JEROME topic names, so their topic alignment is approximate.",
  "- Difficulty is derived from the source level: elementary = Easy, high school / conceptual = Medium, college / astronomy = Hard.",
  "- CSVs are UTF-8 with a BOM so Excel renders symbols correctly.",
  "",
  "## Data quality checks",
  "",
  "Run `npm run datasets:validate`. It verifies that:",
  "",
  "- every question has exactly four non-empty options and an A-D answer;",
  "- no question text is duplicated across any subject;",
  "- topic counts and CSV row counts match each `metadata.json` and the manifest;",
  "- all files are valid UTF-8 with no replacement characters.",
  "",
  "## Columns",
  "",
  "`questions.csv`: `id, subject_id, subject, topic_id, topic, difficulty, difficulty_label, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, est_time_sec, source_dataset, source_config, source_url, license`",
  "",
  "`topics.csv`: `topic_id, topic, subject_id, subject, question_count`",
  "",
  "## Source and license",
  "",
  `- MMLU: [${SOURCE_META.dataset}](${SOURCE_META.url}) (test split), licensed **${SOURCE_META.license}**.`,
  `  Citation: ${SOURCE_META.citation}`,
  `- JEROME STEM Question Bank: **${CURATED_META.license}**, original CSV kept in \`datasets/_sources/curated/\`.`,
  "- Raw rows are kept in `datasets/_sources/` for provenance and can be re-downloaded with `npm run datasets:fetch`.",
  "",
  "## Rebuilding",
  "",
  "```bash",
  "npm run datasets:fetch   # download raw source data",
  "npm run datasets:build   # normalize CSVs + regenerate the app knowledge base",
  "```",
  "",
].join("\n");

await fs.writeFile(path.join(DATASET_DIR, "README.md"), readme, "utf8");

console.log(
  `\nWrote ${totals.questions} questions across ${totals.subjects} subjects.`
);
console.log(`Datasets: ${DATASET_DIR}`);
console.log(`Knowledge base: ${KB_FILE}`);
