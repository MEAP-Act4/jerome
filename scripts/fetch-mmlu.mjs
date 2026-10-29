import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "datasets", "_sources", "mmlu");
const PAGE_SIZE = 100;
const DELAY_MS = 250;

const CONFIGS = {
  high_school_mathematics: 120,
  college_mathematics: 100,
  college_biology: 120,
  high_school_biology: 150,
  college_chemistry: 110,
  high_school_chemistry: 150,
  college_physics: 110,
  high_school_physics: 150,
  astronomy: 100,
  conceptual_physics: 60,
  elementary_mathematics: 120,
  high_school_statistics: 120,
};

const DATASET = "cais/mmlu";
const SOURCE_URL = "https://huggingface.co/datasets/cais/mmlu";
const LICENSE = "MIT";
const CITATION =
  "Hendrycks et al. (2021). Measuring Massive Multitask Language Understanding. ICLR 2021.";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(config, offset, length, attempt = 1) {
  const url =
    "https://datasets-server.huggingface.co/rows?dataset=" +
    encodeURIComponent(DATASET) +
    "&config=" +
    encodeURIComponent(config) +
    "&split=test&offset=" +
    offset +
    "&length=" +
    length;

  const response = await fetch(url, {
    headers: { "user-agent": "jerome-dataset-pipeline/1.0" },
  });

  if (!response.ok) {
    if (attempt < 3) {
      await sleep(1000 * attempt);
      return fetchPage(config, offset, length, attempt + 1);
    }
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json();
}

async function fetchConfig(config, wanted) {
  const rows = [];
  const seen = new Set();
  let offset = 0;

  while (rows.length < wanted) {
    const length = Math.min(PAGE_SIZE, wanted - rows.length);
    const payload = await fetchPage(config, offset, length);
    const pageRows = payload.rows ?? [];

    if (pageRows.length === 0) break;

    for (const entry of pageRows) {
      const row = entry.row;
      const key = String(row.question).trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        question: row.question,
        subject: row.subject,
        choices: row.choices,
        answer: row.answer,
      });
      if (rows.length >= wanted) break;
    }

    offset += pageRows.length;
    await sleep(DELAY_MS);
  }

  return rows;
}

await fs.mkdir(OUT_DIR, { recursive: true });

const fetchedAt = new Date().toISOString();

for (const [config, wanted] of Object.entries(CONFIGS)) {
  process.stdout.write(`Fetching ${config} (${wanted})... `);
  const rows = await fetchConfig(config, wanted);
  const payload = {
    dataset: DATASET,
    config,
    split: "test",
    license: LICENSE,
    sourceUrl: SOURCE_URL,
    citation: CITATION,
    fetchedAt,
    requested: wanted,
    count: rows.length,
    rows,
  };
  await fs.writeFile(
    path.join(OUT_DIR, `${config}.json`),
    JSON.stringify(payload, null, 2),
    "utf8"
  );
  console.log(`${rows.length} rows`);
}

console.log(`\nSaved raw MMLU sources to ${OUT_DIR}`);
