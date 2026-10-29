import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  ExternalLink,
  FileQuestion,
  ShieldCheck,
  Target,
} from "lucide-react";
import { SUBJECTS, getModulesForSubject, getLessonsForModule } from "@/lib/data";

export default function LessonPage({
  params,
}: {
  params: { subject: string; moduleId: string };
}) {
  const subject = SUBJECTS.find((s) => s.id === params.subject);
  const modules = subject ? getModulesForSubject(subject.name) : [];
  const mod = modules.find((m) => m.id === params.moduleId);
  const lessons = getLessonsForModule(params.moduleId);
  const lesson = lessons[0];

  if (!subject || !mod || !lesson) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-serif text-2xl font-semibold text-green-950">
          Module not found
        </p>
        <Link href="/subjects" className="btn-primary">
          Back to subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href={`/subjects/${subject.id}/modules`}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-green-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to modules
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="space-y-8">
          <header className="rounded-card bg-green-950 p-8 text-cream-50 lg:p-10">
            <p className="eyebrow text-lime-400">
              Module {mod.order} · Lesson {lesson.order}
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight lg:text-4xl">
              {lesson.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-cream-50/60">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {lesson.duration}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {lessons.length} lessons in this module
              </span>
            </div>
          </header>

          <section className="card p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-950">
                <Target className="h-4.5 w-4.5 text-lime-400" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-green-950">
                Learning objectives
              </h2>
            </div>
            <ul className="mt-5 space-y-3">
              {lesson.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-100">
                    <Check className="h-3 w-3 text-green-900" />
                  </span>
                  <span className="text-sm leading-relaxed text-text-primary">
                    {objective}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6 lg:p-8">
            <h2 className="font-serif text-xl font-semibold text-green-950">
              Core concept
            </h2>
            <p className="mt-4 text-sm leading-[1.8] text-text-primary">
              {lesson.content}
            </p>
          </section>

          <section className="rounded-card border border-lime-400/40 bg-lime-100 p-6 lg:p-8">
            <p className="eyebrow text-green-900">Worked example</p>
            <p className="mt-3 text-sm leading-[1.8] text-green-950/80">
              {lesson.content}
            </p>
          </section>

          <section className="card p-6 lg:p-8">
            <h2 className="font-serif text-xl font-semibold text-green-950">
              Understanding check
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Before moving on, make sure you can explain the core concept in
              your own words and apply it to a new problem. If anything feels
              unclear, review the lesson or ask JEROME for help.
            </p>
          </section>

          <div className="flex items-center justify-between pt-2">
            <Link
              href={`/subjects/${subject.id}/modules`}
              className="btn-ghost inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Modules
            </Link>
            <Link
              href={`/subjects/${subject.id}/modules/${mod.id}/test`}
              className="btn-primary inline-flex items-center gap-2"
            >
              <FileQuestion className="h-4 w-4" />
              Take module test
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="card space-y-5 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-900" />
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
                Verified learning source
              </p>
            </div>

            <div>
              <p className="font-serif text-lg font-semibold text-green-950">
                {lesson.source}
              </p>
              <a
                href={lesson.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-800 transition-colors hover:text-green-950"
              >
                Visit source
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="border-t border-surface-border pt-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                <p className="text-xs font-medium text-green-900">
                  Source-reviewed content
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                This lesson has been reviewed for accuracy against the cited
                source material.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
