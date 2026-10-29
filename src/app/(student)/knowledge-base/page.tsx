import {
  Database,
  FolderTree,
  Layers3,
  ListChecks,
} from "lucide-react";
import {
  KNOWLEDGE_BASE,
  KNOWLEDGE_BASE_TOTALS,
  type KnowledgeBaseSubject,
} from "@/lib/knowledge-base";

export const metadata = {
  title: "Knowledge base · JEROME",
};

const letters = ["A", "B", "C", "D"] as const;

export default function KnowledgeBasePage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">STEM DATASET LIBRARY · KNOWLEDGE BASE</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-green-950">
          Subject datasets
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted">
          Every STEM subject has its own dataset folder on disk, with normalized
          CSV files and a metadata record. The app reads the same questions from
          its generated knowledge base.
        </p>
        <p className="font-mono text-xs text-text-muted">
          jerome/datasets/&lt;subject&gt;/questions.csv
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Database}
          label="Subjects"
          value={KNOWLEDGE_BASE_TOTALS.subjects}
        />
        <StatCard
          icon={ListChecks}
          label="Questions"
          value={KNOWLEDGE_BASE_TOTALS.questions}
        />
        <StatCard
          icon={Layers3}
          label="Topics"
          value={KNOWLEDGE_BASE_TOTALS.topics}
        />
      </section>

      <section className="space-y-4">
        {KNOWLEDGE_BASE.subjects.map((subject) => (
          <SubjectDataset key={subject.id} subject={subject} />
        ))}
      </section>

      <footer className="card flex flex-wrap items-center justify-between gap-3 p-5 text-xs text-text-muted">
        <span className="inline-flex items-center gap-2">
          <FolderTree className="h-4 w-4" />
          Sources: {KNOWLEDGE_BASE.source.dataset} ({KNOWLEDGE_BASE.source.license})
          {KNOWLEDGE_BASE.additionalSources.map((source) => (
            <span key={source.dataset}>
              + {source.dataset} ({source.license})
            </span>
          ))}
        </span>
        <a
          href={KNOWLEDGE_BASE.source.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-green-900 hover:underline"
        >
          View dataset card
        </a>
      </footer>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: number;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
        <Icon className="h-5 w-5 text-green-900" />
      </div>
      <div>
        <p className="font-serif text-2xl font-semibold text-green-950">
          {value.toLocaleString()}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}

function SubjectDataset({ subject }: { subject: KnowledgeBaseSubject }) {
  const difficulties = Object.entries(subject.difficultyCounts);

  return (
    <article className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{subject.category}</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-green-950">
            {subject.name}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-muted">
            {subject.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge-lime">
            {subject.questionCount.toLocaleString()} questions
          </span>
          <span className="badge bg-green-100 text-green-950">
            {subject.topicCount} topics
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {subject.topics.map((topic) => (
          <span
            key={topic.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-cream-50 px-3 py-1 text-xs text-text-muted"
          >
            {topic.name}
            <span className="font-mono text-[10px] text-green-900">
              {topic.questionCount}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-surface-border p-4">
          <p className="eyebrow">Dataset folder</p>
          <p className="mt-1.5 font-mono text-xs text-green-950">
            {subject.folder}/
          </p>
          <p className="mt-1 text-xs text-text-muted">
            questions.csv · topics.csv · metadata.json
          </p>
        </div>
        <div className="rounded-lg border border-surface-border p-4">
          <p className="eyebrow">Sources</p>
          {subject.sources.map((source) => (
            <p key={source.config} className="mt-1.5 text-xs text-text-muted">
              {source.dataset} · {source.config} · {source.license} ·{" "}
              {source.questionCount} rows
            </p>
          ))}
          <p className="mt-2 text-xs text-text-muted">
            {difficulties
              .map(([label, count]) => `${label} ${count}`)
              .join(" · ")}
          </p>
        </div>
      </div>

      <details className="group mt-4">
        <summary className="cursor-pointer text-sm font-medium text-green-900">
          Preview questions
        </summary>
        <ol className="mt-3 space-y-3">
          {subject.questions.slice(0, 3).map((question) => (
            <li
              key={question.id}
              className="rounded-lg border border-surface-border p-4"
            >
              <p className="text-sm font-medium leading-relaxed text-green-950">
                {question.questionText}
              </p>
              <ul className="mt-2 grid gap-1 text-xs text-text-muted sm:grid-cols-2">
                {letters.map((letter) => (
                  <li
                    key={letter}
                    className={
                      letter === question.correctAnswer
                        ? "font-semibold text-green-900"
                        : undefined
                    }
                  >
                    {letter}. {question.options[letter]}
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">
                {question.id} · {question.difficultyLabel} ·{" "}
                {question.source.config}
              </p>
            </li>
          ))}
        </ol>
      </details>
    </article>
  );
}
