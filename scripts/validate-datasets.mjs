import { promises as fs } from "node:fs";
import path from "node:path";

const DATASET_DIR = path.join(process.cwd(), "datasets");
const KB_FILE = path.join(
  process.cwd(),
  "src",
  "lib",
  "knowledge-base",
  "datasets.generated.json"
);

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

const errors = [];
const warnings = [];

const manifest = JSON.parse(
  await fs.readFile(path.join(DATASET_DIR, "manifest.json"), "utf8")
);
const kb = JSON.parse(await fs.readFile(KB_FILE, "utf8"));

if (manifest.totals.subjects !== manifest.subjects.length) {
  errors.push("manifest totals.subjects does not match subject list");
}

if (kb.totals.questions !== manifest.totals.questions) {
  errors.push("knowledge base question total does not match manifest");
}

let csvTotal = 0;
const seen = new Map();

for (const subject of manifest.subjects) {
  const folder = path.join(DATASET_DIR, subject.id);
  const metadata = JSON.parse(
    await fs.readFile(path.join(folder, "metadata.json"), "utf8")
  );
  const csv = parseCsv(
    (await fs.readFile(path.join(folder, "questions.csv"), "utf8")).replace(
      /^\uFEFF/,
      ""
    )
  );
  const header = csv[0];
  const rows = csv.slice(1);

  if (metadata.questionCount !== rows.length) {
    errors.push(
      `${subject.id}: metadata says ${metadata.questionCount} questions, CSV has ${rows.length}`
    );
  }

  if (subject.questionCount !== rows.length) {
    errors.push(
      `${subject.id}: manifest says ${subject.questionCount} questions, CSV has ${rows.length}`
    );
  }

  const topicTotal = metadata.topics.reduce(
    (sum, topic) => sum + topic.questionCount,
    0
  );
  if (topicTotal !== rows.length) {
    errors.push(
      `${subject.id}: topic counts sum to ${topicTotal}, expected ${rows.length}`
    );
  }

  const index = Object.fromEntries(header.map((key, i) => [key, i]));

  for (const row of rows) {
    if (row.length !== header.length) {
      errors.push(`${subject.id}: malformed CSV row (${row.length} columns)`);
      continue;
    }

    const id = row[index.id];
    const answer = row[index.correct_answer];
    const text = row[index.question_text];

    if (!/^[ABCD]$/.test(answer)) {
      errors.push(`${subject.id}/${id}: invalid answer "${answer}"`);
    }

    if (!text || text.includes("\uFFFD")) {
      errors.push(`${subject.id}/${id}: missing or corrupted question text`);
    }

    for (const option of ["option_a", "option_b", "option_c", "option_d"]) {
      if (!row[index[option]]) {
        errors.push(`${subject.id}/${id}: empty ${option}`);
      }
    }

    const key = text.trim().toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) {
      errors.push(
        `${subject.id}/${id}: duplicate question also in ${seen.get(key)}`
      );
    } else {
      seen.set(key, `${subject.id}/${id}`);
    }

    csvTotal += 1;
  }

  if (rows.length < 50) {
    warnings.push(`${subject.id}: only ${rows.length} questions`);
  }

  console.log(
    `${subject.id.padEnd(28)} rows=${String(rows.length).padStart(4)}  topics=${metadata.topicCount}  OK`
  );
}

if (csvTotal !== manifest.totals.questions) {
  errors.push(
    `CSV total ${csvTotal} does not match manifest total ${manifest.totals.questions}`
  );
}

console.log("");
console.log(`Subjects: ${manifest.subjects.length}`);
console.log(`Questions: ${csvTotal}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Errors: ${errors.length}`);

for (const warning of warnings) console.log(`WARN ${warning}`);
for (const error of errors) console.log(`FAIL ${error}`);

if (errors.length > 0) process.exit(1);
