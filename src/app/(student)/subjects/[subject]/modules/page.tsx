"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Clock,
  BookOpen,
  FileQuestion,
  MessageCircle,
} from "lucide-react";
import { SUBJECTS, getModulesForSubject } from "@/lib/data";

type ModuleState = "completed" | "current" | "locked";

export default function ModulesPage({
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

  const modules = getModulesForSubject(subject.name);
  const completedCount = 1;
  const overallProgress = Math.round((completedCount / modules.length) * 100);

  const getModuleState = (index: number): ModuleState => {
    if (index < completedCount) return "completed";
    if (index === completedCount) return "current";
    return "locked";
  };

  return (
    <div className="space-y-8">
      <Link
        href={`/subjects/${subject.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-green-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {subject.name}
      </Link>

      <header className="space-y-2">
        <p className="eyebrow">Learning path</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-green-950 lg:text-4xl">
          {subject.name} modules
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-text-muted">
          Your personalized sequence of modules. Complete each one to unlock
          the next and build mastery step by step.
        </p>
      </header>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-green-950">Overall progress</p>
          <span className="font-mono text-xs text-text-muted">
            {completedCount} of {modules.length} complete
          </span>
        </div>
        <div className="progress-bar mt-3">
          <div
            className="progress-bar-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="relative space-y-6 pl-8">
        <div className="absolute bottom-4 left-[15px] top-4 w-px bg-surface-border" />

        {modules.map((module, index) => {
          const state = getModuleState(index);
          const isCompleted = state === "completed";
          const isCurrent = state === "current";
          const isLocked = state === "locked";

          return (
            <div key={module.id} className="relative">
              <div
                className={`absolute -left-8 top-6 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? "border-green-950 bg-green-950"
                    : isCurrent
                      ? "border-lime-400 bg-lime-400"
                      : "border-surface-border bg-surface-white"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-lime-400" />
                ) : isLocked ? (
                  <Lock className="h-3.5 w-3.5 text-text-muted" />
                ) : (
                  <span className="font-mono text-xs font-medium text-green-950">
                    {index + 1}
                  </span>
                )}
              </div>

              <div
                className={`card p-6 transition-all ${
                  isCurrent ? "border-lime-400/60 shadow-card-hover" : ""
                } ${isLocked ? "opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif text-xl font-semibold text-green-950">
                        {module.title}
                      </h2>
                      {isCompleted && (
                        <span className="badge-green">Completed</span>
                      )}
                      {isCurrent && (
                        <span className="badge-lime">Current</span>
                      )}
                      {isLocked && (
                        <span className="badge bg-surface text-text-muted">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      {module.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {module.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        {module.lessonCount} lessons
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FileQuestion className="h-3.5 w-3.5" />
                        Test · {module.passingThreshold}% to pass
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isCompleted && (
                      <Link
                        href={`/subjects/${subject.id}/modules/${module.id}`}
                        className="btn-secondary inline-flex items-center gap-1.5"
                      >
                        Review
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                    {isCurrent && (
                      <Link
                        href={`/subjects/${subject.id}/modules/${module.id}`}
                        className="btn-primary inline-flex items-center gap-1.5"
                      >
                        Start module
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                    {isLocked && (
                      <span className="btn-secondary inline-flex cursor-not-allowed items-center gap-1.5 opacity-50">
                        <Lock className="h-4 w-4" />
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Link
          href="/ai-tutor"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Ask JEROME
        </Link>
      </div>
    </div>
  );
}
