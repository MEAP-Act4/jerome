import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  FileQuestion,
  GraduationCap,
  Beaker,
  Wrench,
  BookOpen,
} from "lucide-react";
import { SUBJECTS, QUESTIONS, getTopicsForSubject } from "@/lib/data";

const categoryIcons = {
  Specialized: GraduationCap,
  "STEM Core": Beaker,
  Applied: Wrench,
  "General Core": BookOpen,
} as const;

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

export default function SubjectPage({
  params,
}: {
  params: { subject: string };
}) {
  const subject = SUBJECTS.find((s) => s.id === params.subject);

  if (!subject) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-serif text-2xl font-semibold text-green-950">
          Subject not found
        </p>
        <Link href="/subjects" className="btn-primary">
          Back to subjects
        </Link>
      </div>
    );
  }

  const Icon = categoryIcons[subject.category];
  const topics = getTopicsForSubject(subject.name);
  const questionCount = QUESTIONS.filter(
    (question) => question.subjectName === subject.name
  ).length;
  const hasPretest = questionCount > 0;
  const pretestMinutes = Math.max(5, topics.length * 3);

  return (
    <div className="space-y-8">
      <Link
        href="/subjects"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-green-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to subjects
      </Link>

      <div className="grid overflow-hidden rounded-card border border-surface-border lg:grid-cols-2">
        <div className="bg-green-950 p-8 text-cream-50 lg:p-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-lime-400/15 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-lime-400">
            <Icon className="h-3.5 w-3.5" />
            {subject.category}
          </span>

          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight lg:text-5xl">
            {subject.name}
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream-50/70">
            {subject.description}
          </p>

          {hasPretest && (
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-cream-50/60">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {pretestMinutes} min pretest
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileQuestion className="h-4 w-4" />
                {questionCount} questions
              </span>
            </div>
          )}

          <div className="mt-10">
            {hasPretest ? (
              <Link
                href={`/subjects/${subject.id}/diagnostic`}
                className="btn-primary inline-flex items-center gap-2"
              >
                Start pretest
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/ai-tutor"
                className="btn-secondary inline-flex items-center gap-2 border-cream-50/30 text-cream-50 hover:bg-cream-50/10"
              >
                Study with JEROME
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="bg-lime-100 p-8 lg:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400">
            <Icon className="h-7 w-7 text-green-950" />
          </div>

          <p className="eyebrow mt-8 text-green-900">Before you begin</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-green-950">
            Let&apos;s find your starting point
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-green-950/70">
            A short diagnostic pretest helps JEROME understand what you
            already know, so your learning path starts at exactly the right
            place — not too easy, not too hard.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Answer honestly — there are no grades or penalties",
              "Skip nothing; every answer shapes your path",
              "You will see your results and modules immediately after",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-950">
                  <Check className="h-3 w-3 text-lime-400" />
                </span>
                <span className="text-sm leading-relaxed text-green-950/80">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
