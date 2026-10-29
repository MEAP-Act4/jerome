"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  ArrowRight,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { SUBJECTS, QUESTIONS } from "@/lib/data";

const QUESTIONS_PER_DIAGNOSTIC = 5;

const letters = ["A", "B", "C", "D"] as const;

export default function DiagnosticPage({
  params,
}: {
  params: { subject: string };
}) {
  const subject = SUBJECTS.find((s) => s.id === params.subject);
  const subjectQuestions = QUESTIONS.filter(
    (q) => q.subjectName === subject?.name
  );
  const questions = subjectQuestions.slice(0, QUESTIONS_PER_DIAGNOSTIC);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

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

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card flex flex-col items-center p-10 text-center lg:p-14">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-950">
            <Sparkles className="h-8 w-8 text-lime-400" />
          </div>

          <p className="eyebrow mt-6 text-green-900">Pretest coming soon</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-green-950">
            We&apos;re still building {subject.name}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
            Practice questions for this subject aren&apos;t available yet. You
            can still study it with JEROME in the AI tutor.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/subjects/${subject.id}`}
              className="btn-secondary inline-flex items-center gap-2"
            >
              Back to subject
            </Link>
            <Link
              href="/ai-tutor"
              className="btn-primary inline-flex items-center gap-2"
            >
              Study with JEROME
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (isComplete ? 1 : 0)) / questions.length) * 100;

  const handleNext = () => {
    if (!selectedAnswer) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      setIsComplete(true);
    }
  };

  const score = answers.reduce(
    (acc, answer, i) => acc + (answer === questions[i].correctAnswer ? 1 : 0),
    0
  );
  const percentage = Math.round((score / questions.length) * 100);
  const foundationLevel =
    percentage >= 80 ? "Strong" : percentage >= 50 ? "Developing" : "Foundational";

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card flex flex-col items-center p-10 text-center lg:p-14">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-950">
            <Sparkles className="h-8 w-8 text-lime-400" />
          </div>

          <p className="eyebrow mt-6 text-green-900">Pretest complete</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-green-950">
            Your learning path is ready
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
            Based on your results, JEROME has personalized your{" "}
            {subject.name} modules to focus on what matters most for you.
          </p>

          <div className="mt-8 grid w-full grid-cols-2 gap-4">
            <div className="rounded-xl bg-surface p-5">
              <p className="font-serif text-3xl font-semibold text-green-950">
                {percentage}%
              </p>
              <p className="mt-1 text-xs text-text-muted">Score</p>
            </div>
            <div className="rounded-xl bg-surface p-5">
              <p className="font-serif text-3xl font-semibold text-green-950">
                {foundationLevel}
              </p>
              <p className="mt-1 text-xs text-text-muted">Foundation level</p>
            </div>
          </div>

          <Link
            href={`/subjects/${subject.id}/modules`}
            className="btn-primary mt-8 inline-flex items-center gap-2"
          >
            View my modules
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href={`/subjects/${subject.id}`}
          className="btn-ghost inline-flex items-center gap-1.5"
        >
          <X className="h-4 w-4" />
          Exit
        </Link>
        <span className="font-mono text-xs text-text-muted">
          {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Diagnostic pretest</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            {subject.name}
          </p>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill bg-lime-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-10 space-y-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            Question {currentIndex + 1}
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug text-green-950 lg:text-3xl">
            {currentQuestion.questionText}
          </h2>
        </div>

        <div className="space-y-3">
          {letters.map((letter) => {
            const optionKey = `option${letter}` as keyof typeof currentQuestion;
            const optionText = currentQuestion[optionKey] as string;
            const isSelected = selectedAnswer === letter;

            return (
              <button
                key={letter}
                onClick={() => setSelectedAnswer(letter)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                  isSelected
                    ? "border-green-950 bg-green-950 text-cream-50"
                    : "border-surface-border bg-surface-white hover:border-green-950/30"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-medium ${
                    isSelected
                      ? "bg-lime-400 text-green-950"
                      : "bg-surface text-text-muted"
                  }`}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : letter}
                </span>
                <span className="text-sm font-medium leading-relaxed">
                  {optionText}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-text-muted">
            {selectedAnswer
              ? "Answer selected"
              : "Select an answer to continue"}
          </p>
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentIndex === questions.length - 1 ? "See results" : "Next question"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
