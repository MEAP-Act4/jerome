# JEROME STEM Knowledge Base Datasets

STEM question datasets used by the JEROME adaptive practice app.
Each subject has its own folder so the data can be reviewed independently of the application code.
Sources are the teacher-provided JEROME question bank and the MMLU benchmark (test split), normalized to one schema.

## Folder layout

```
datasets/
  README.md
  manifest.json
  _sources/mmlu/          raw downloaded source data (MMLU, test split)
  _sources/curated/       teacher-provided question bank (original UTF-8 CSV)
  pre-calculus/               questions.csv, topics.csv, metadata.json
  basic-calculus/             questions.csv, topics.csv, metadata.json
  general-biology-1/          questions.csv, topics.csv, metadata.json
  general-biology-2/          questions.csv, topics.csv, metadata.json
  general-chemistry-1/        questions.csv, topics.csv, metadata.json
  general-chemistry-2/        questions.csv, topics.csv, metadata.json
  general-physics-1/          questions.csv, topics.csv, metadata.json
  general-physics-2/          questions.csv, topics.csv, metadata.json
  earth-and-life-science/     questions.csv, topics.csv, metadata.json
  general-mathematics/        questions.csv, topics.csv, metadata.json
  statistics-and-probability/ questions.csv, topics.csv, metadata.json
```

## Subject summary

| Subject | Folder | Questions | Topics | Sources |
| --- | --- | ---: | ---: | --- |
| Pre-Calculus | `datasets/pre-calculus` | 132 | 2 | JEROME STEM Question Bank: question_bank, cais/mmlu: high_school_mathematics |
| Basic Calculus | `datasets/basic-calculus` | 112 | 2 | JEROME STEM Question Bank: question_bank, cais/mmlu: college_mathematics |
| General Biology 1 | `datasets/general-biology-1` | 132 | 2 | JEROME STEM Question Bank: question_bank, cais/mmlu: college_biology |
| General Biology 2 | `datasets/general-biology-2` | 150 | 2 | cais/mmlu: high_school_biology |
| General Chemistry 1 | `datasets/general-chemistry-1` | 110 | 2 | JEROME STEM Question Bank: question_bank, cais/mmlu: college_chemistry |
| General Chemistry 2 | `datasets/general-chemistry-2` | 150 | 2 | cais/mmlu: high_school_chemistry |
| General Physics 1 | `datasets/general-physics-1` | 95 | 2 | JEROME STEM Question Bank: question_bank, cais/mmlu: college_physics |
| General Physics 2 | `datasets/general-physics-2` | 149 | 2 | cais/mmlu: high_school_physics |
| Earth and Life Science | `datasets/earth-and-life-science` | 160 | 2 | cais/mmlu: astronomy, cais/mmlu: conceptual_physics |
| General Mathematics | `datasets/general-mathematics` | 120 | 2 | cais/mmlu: elementary_mathematics |
| Statistics and Probability | `datasets/statistics-and-probability` | 120 | 2 | cais/mmlu: high_school_statistics |

**Total:** 11 subjects · 1430 questions · 22 topics.

## Method

- The teacher-provided question bank is loaded first, keeping its original topic and difficulty labels.
- Remaining slots are filled from the MMLU `test` split for each subject's mapped config.
- Duplicate questions are removed globally, and every row is validated for four options and an A-D answer.
- MMLU topics are assigned with keyword heuristics against the existing JEROME topic names, so their topic alignment is approximate.
- Difficulty is derived from the source level: elementary = Easy, high school / conceptual = Medium, college / astronomy = Hard.
- CSVs are UTF-8 with a BOM so Excel renders symbols correctly.

## Data quality checks

Run `npm run datasets:validate`. It verifies that:

- every question has exactly four non-empty options and an A-D answer;
- no question text is duplicated across any subject;
- topic counts and CSV row counts match each `metadata.json` and the manifest;
- all files are valid UTF-8 with no replacement characters.

## Columns

`questions.csv`: `id, subject_id, subject, topic_id, topic, difficulty, difficulty_label, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, est_time_sec, source_dataset, source_config, source_url, license`

`topics.csv`: `topic_id, topic, subject_id, subject, question_count`

## Source and license

- MMLU: [cais/mmlu](https://huggingface.co/datasets/cais/mmlu) (test split), licensed **MIT**.
  Citation: Hendrycks, D., Burns, C., Basart, S., Zou, A., Mazeika, M., Song, D., & Steinhardt, J. (2021). Measuring Massive Multitask Language Understanding. ICLR 2021.
- JEROME STEM Question Bank: **Teacher-provided**, original CSV kept in `datasets/_sources/curated/`.
- Raw rows are kept in `datasets/_sources/` for provenance and can be re-downloaded with `npm run datasets:fetch`.

## Rebuilding

```bash
npm run datasets:fetch   # download raw source data
npm run datasets:build   # normalize CSVs + regenerate the app knowledge base
```
