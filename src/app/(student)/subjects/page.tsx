"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MessageCircle,
  GraduationCap,
  Beaker,
  Wrench,
  BookOpen,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { SUBJECTS, type Subject } from "@/lib/data";

const categoryIcons = {
  Specialized: GraduationCap,
  "STEM Core": Beaker,
  Applied: Wrench,
  "General Core": BookOpen,
} as const;

type CategoryFilter = "All" | Subject["category"];

const filterOrder: CategoryFilter[] = [
  "All",
  "Specialized",
  "STEM Core",
  "Applied",
  "General Core",
];

export default function SubjectsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("All");

  const counts = useMemo(() => {
    const c: Record<CategoryFilter, number> = {
      All: SUBJECTS.length,
      Specialized: 0,
      "STEM Core": 0,
      Applied: 0,
      "General Core": 0,
    };
    for (const s of SUBJECTS) c[s.category] += 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SUBJECTS.filter((s) => {
      const matchesFilter = filter === "All" || s.category === filter;
      const matchesQuery =
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">DEPED SENIOR HIGH SCHOOL · STEM</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-green-950">
          Explore your curriculum
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-text-muted">
          Every subject in your Senior High School learning plan — specialized
          tracks, core sciences, applied courses, and general education. Pick a
          subject to start or continue your path.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 31 subjects"
          className="input-field pl-11"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filterOrder.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] transition-all duration-150 ${
              filter === f
                ? "border-green-950 bg-green-950 text-cream-50"
                : "border-surface-border bg-surface-white text-text-muted hover:border-green-950/30 hover:text-green-950"
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          <span className="font-mono font-medium text-green-950">
            {filtered.length}
          </span>{" "}
          subjects shown
        </p>
        <span className="badge-lime">
          <span className="h-1.5 w-1.5 rounded-full bg-green-900" />
          In your current learning plan
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <Sparkles className="h-5 w-5 text-text-muted" />
          <p className="font-serif text-lg font-semibold text-green-950">
            No subjects match your search
          </p>
          <p className="text-sm text-text-muted">
            Try a different keyword or clear the category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  const Icon = categoryIcons[subject.category];

  return (
    <article className="card card-hover group flex flex-col p-6">
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${subject.color}14` }}
        >
          <Icon className="h-5 w-5" style={{ color: subject.color }} />
        </div>
        <span
          className="font-mono text-[11px] uppercase tracking-[0.12em]"
          style={{ color: subject.color }}
        >
          {subject.category}
        </span>
      </div>

      <h2 className="mt-4 font-serif text-xl font-semibold leading-snug text-green-950">
        {subject.name}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
        {subject.description}
      </p>

      <div className="mt-5">
        {subject.status === "not-started" ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            Not started
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <div className="progress-bar flex-1">
              <div
                className="progress-bar-fill"
                style={{ width: `${subject.progress}%` }}
              />
            </div>
            <span className="font-mono text-xs font-medium text-green-950">
              {subject.progress}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 pt-1">
        <a
          href={`/subjects/${subject.id}`}
          className="btn-primary flex flex-1 items-center justify-center gap-1.5"
        >
          Open learning path
          <ArrowUpRight className="h-4 w-4" />
        </a>
        <a
          href="/ai-tutor"
          className="btn-secondary flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="h-4 w-4" />
          Ask JEROME
        </a>
      </div>
    </article>
  );
}
