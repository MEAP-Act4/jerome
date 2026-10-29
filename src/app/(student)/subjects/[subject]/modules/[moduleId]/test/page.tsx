"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  PartyPopper,
  AlertCircle,
} from "lucide-react";
import { SUBJECTS, getModulesForSubject, QUESTIONS } from "@/lib/data";

const QUESTIONS_PER_TEST = 3;
const PASSING_SCORE = 2;

const letters = ["A", "B", "C", "D"] as const;

export default function ModuleTestPage({
  params,
}: {
  params: { subject: string; moduleId: string };
}) {
  const subject = SUBJECTS.find((s) => s.id === params.subject);
  const modules = subject ? getModulesForSubject(subject.name) : [];
  const mod = modules.find((m) => m.id === params.moduleId);
  const moduleQuestions = QUESTIONS.filter((q) => q.topicId === mod?.topicId);
  const questions = moduleQuestions.slice(0, QUESTIONS_PER_TEST);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  if (!subject || !mod) {
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
  const passed = score >= PASSING_SCORE;
  const moduleIndex = modules.findIndex((m) => m.id === mod.id);
  const nextModule = modules[moduleIndex + 1];

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card flex flex-col items-center p-10 text-center lg:p-14">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              passed ? "bg-green-950" : "bg-orange-100"
            }`}
          >
            {passed ? (
              <PartyPopper className="h-8 w-8 text-lime-400" />
            ) : (
              <AlertCircle className="h-8 w-8 text-orange-500" />
            )}
          </div>

          <p className="eyebrow mt-6 text-green-900">
            {passed ? "Test passed" : "Test not passed"}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-green-950">
            {passed
              ? "You unlocked the next module"
              : "Almost there — review and try again"}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
            {passed
              ? `You scored ${score} out of ${questions.length}. Great work on ${mod.title}.`
              : `You scored ${score} out of ${questions.length}. You need ${PASSING_SCORE} correct answers to pass. Review the lesson and try again.`}
          </p>

          <div className="mt-8 grid w-full grid-cols-3 gap-4">
            <div className="rounded-xl bg-surface p-4">
              <p className="font-serif text-2xl font-semibold text-green-950">
                {score}/{questions.length}
              </p>
              <p className="mt-1 text-xs text-text-muted">Score</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="font-serif text-2xl font-semibold text-green-950">
                {Math.round((score / questions.length) * 100)}%
              </p>
              <p className="mt-1 text-xs text-text-muted">Accuracy</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="font-serif text-2xl font-semibold text-green-950">
                {mod.passingThreshold}%
              </p>
              <p className="mt-1 text-xs text-text-muted">Required</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {passed ? (
              <>
                {nextModule ? (
                  <Link
                    href={`/subjects/${subject.id}/modules/${nextModule.id}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Continue learning path
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href={`/subjects/${subject.id}/modules`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Back to modules
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href={`/subjects/${subject.id}/modules/${mod.id}`}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Review module
                </Link>
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setSelectedAnswer(null);
                    setAnswers([]);
                    setIsComplete(false);
                  }}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake test
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href={`/subjects/${subject.id}/modules/${module.id}`}
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
          <p className="eyebrow">Module test</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            {mod.title}
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
          <Link
          href={`/subjects/${subject.id}/modules/${mod.id}`}
            className="btn-ghost inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to lesson
          </Link>
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
