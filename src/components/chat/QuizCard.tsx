"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Lightbulb,
  RotateCcw,
  Trophy,
} from "lucide-react";
import type { QuizSpec } from "@/lib/chat/quiz";
import { RichText } from "./InlineMath";

function scoreMessage(score: number, total: number): string {
  const ratio = total > 0 ? score / total : 0;
  if (ratio === 1) return "Perfect score — you have this topic locked down.";
  if (ratio >= 0.8) return "Strong work. Review the one or two you missed and you're set.";
  if (ratio >= 0.5) return "Solid start. Read the explanations below, then try the quiz again.";
  return "Keep going — the explanations below show the pattern behind each answer.";
}

export function QuizCard({ spec }: { spec: QuizSpec }) {
  const total = spec.questions.length;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    spec.questions.map(() => null)
  );
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);

  const correctCount = useMemo(
    () =>
      answers.reduce<number>(
        (count, answer, position) =>
          count + (answer === spec.questions[position].answer ? 1 : 0),
        0
      ),
    [answers, spec.questions]
  );

  const reset = () => {
    setIndex(0);
    setSelected(null);
    setAnswers(spec.questions.map(() => null));
    setShowHint(false);
    setFinished(false);
  };

  const choose = (option: number) => {
    if (selected !== null) return;
    setSelected(option);
    setAnswers((previous) => {
      const next = [...previous];
      next[index] = option;
      return next;
    });
  };

  const advance = () => {
    if (selected === null) return;
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setShowHint(false);
  };

  if (finished) {
    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <section
        aria-label={`Quiz results: ${spec.title}`}
        className="my-3 overflow-hidden rounded-2xl border border-[#E2DED6] bg-[#FBFAF7] text-sm text-[#1A1A1A]"
      >
        <div className="border-b border-[#E2DED6] bg-[#F1EEE7] px-4 py-3">
          <span className="rounded bg-[#143D30] px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#8FD6BC]">
            Quiz review
          </span>
          <p className="mt-1 text-xs text-[#6B6B6B]">{spec.title}</p>
        </div>

        <div className="px-4 py-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8FD6BC]/35">
              <Trophy size={22} className="text-[#143D30]" />
            </div>
            <p className="mt-2 text-xs font-mono uppercase tracking-widest text-[#6B6B6B]">
              Final score
            </p>
            <p className="text-3xl font-semibold text-[#143D30]">
              {correctCount} / {total}
            </p>
            <p className="text-xs text-[#6B6B6B]">{percent}% correct</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#3D3D3D]">
              {scoreMessage(correctCount, total)}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {spec.questions.map((question, position) => {
              const chosen = answers[position];
              const isCorrect = chosen === question.answer;
              return (
                <div
                  key={position}
                  className="rounded-xl border border-[#E2DED6] bg-white px-3 py-3"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                        isCorrect
                          ? "bg-[#2D8F72]/15 text-[#1F6E57]"
                          : "bg-[#C05050]/15 text-[#9B3B3B]"
                      }`}
                    >
                      {position + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <RichText
                        content={question.prompt}
                        className="text-[13px] font-medium leading-relaxed"
                      />
                      <p className="mt-1 text-[11px] text-[#6B6B6B]">
                        Your answer:{" "}
                        <span
                          className={
                            isCorrect ? "text-[#1F6E57]" : "text-[#9B3B3B]"
                          }
                        >
                          {chosen === null
                            ? "No answer"
                            : `${String.fromCharCode(65 + chosen)}. `}
                        </span>
                        {chosen !== null && (
                          <RichText
                            content={question.options[chosen]}
                            inline
                            className="inline"
                          />
                        )}
                      </p>
                      {!isCorrect && (
                        <p className="mt-1 text-[11px] text-[#6B6B6B]">
                          Correct answer:{" "}
                          <span className="text-[#1F6E57]">
                            {String.fromCharCode(65 + question.answer)}.{" "}
                          </span>
                          <RichText
                            content={question.options[question.answer]}
                            inline
                            className="inline"
                          />
                        </p>
                      )}
                      {question.explanation && (
                        <RichText
                          content={question.explanation}
                          className="mt-1 text-[11px] leading-relaxed text-[#4A4A4A]"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#143D30] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0E2B22]"
          >
            <RotateCcw size={14} />
            Try this quiz again
          </button>
        </div>
      </section>
    );
  }

  const question = spec.questions[index];
  const answered = selected !== null;
  const isCorrect = selected === question.answer;
  const progress = ((index + (answered ? 1 : 0)) / total) * 100;

  return (
    <section
      aria-label={`Quiz: ${spec.title}`}
      className="my-3 overflow-hidden rounded-2xl border border-[#E2DED6] bg-[#FBFAF7] text-sm text-[#1A1A1A]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#E2DED6] bg-[#F1EEE7] px-4 py-3">
        <div className="min-w-0">
          <span className="rounded bg-[#143D30] px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#8FD6BC]">
            Quiz
          </span>
          <p className="mt-1 truncate text-xs font-semibold text-[#143D30]">
            {spec.title}
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-[#D8D4CA] bg-white px-2 py-1 text-[11px] font-mono text-[#6B6B6B]">
          {index + 1} / {total}
        </span>
      </div>

      <div className="px-4 py-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-[#E2DED6]">
          <div
            className="h-full rounded-full bg-[#2D8F72] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B6B6B]">
          <span>
            Question {index + 1} of {total}
          </span>
          <span>Score: {correctCount}</span>
        </div>

        <RichText
          content={question.prompt}
          className="mt-3 text-sm font-medium leading-relaxed text-[#1A1A1A]"
        />

        <div className="mt-3 space-y-2" role="group" aria-label="Answer choices">
          {question.options.map((option, optionIndex) => {
            const isChosen = selected === optionIndex;
            const isAnswer = question.answer === optionIndex;

            let tone =
              "border-[#D8D4CA] bg-white hover:border-[#2D8F72] hover:bg-[#F3FAF6]";
            if (answered) {
              if (isAnswer) {
                tone = "border-[#2D8F72] bg-[#E8F5EE]";
              } else if (isChosen) {
                tone = "border-[#C05050] bg-[#FBEDED]";
              } else {
                tone = "border-[#E2DED6] bg-white opacity-60";
              }
            }

            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() => choose(optionIndex)}
                disabled={answered}
                aria-pressed={isChosen}
                className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-default ${tone}`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ${
                    answered && isAnswer
                      ? "bg-[#2D8F72] text-white"
                      : answered && isChosen
                        ? "bg-[#C05050] text-white"
                        : "bg-[#EDEAE2] text-[#3D3D3D]"
                  }`}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <RichText
                  content={option}
                  inline
                  className="min-w-0 flex-1 text-[13px] leading-relaxed"
                />
                {answered && isAnswer && (
                  <CircleCheck size={15} className="mt-0.5 shrink-0 text-[#2D8F72]" />
                )}
                {answered && isChosen && !isAnswer && (
                  <CircleX size={15} className="mt-0.5 shrink-0 text-[#C05050]" />
                )}
              </button>
            );
          })}
        </div>

        {showHint && question.hint && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#C08A2E]/30 bg-[#F3E3C3]/45 px-3 py-2.5 text-[12px] leading-relaxed text-[#6B4A10]">
            <Lightbulb size={14} className="mt-0.5 shrink-0 text-[#C08A2E]" />
            <RichText content={question.hint} inline className="inline" />
          </div>
        )}

        {answered && (
          <div
            className={`mt-3 rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed ${
              isCorrect
                ? "border-[#2D8F72]/30 bg-[#E8F5EE] text-[#1F5B48]"
                : "border-[#C05050]/30 bg-[#FBEDED] text-[#8F3535]"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              {isCorrect ? <CircleCheck size={14} /> : <CircleX size={14} />}
              {isCorrect ? "Correct!" : "Not quite."}
            </div>
            {question.explanation && (
              <RichText
                content={question.explanation}
                className="mt-1 text-[#4A4A4A]"
              />
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowHint((current) => !current)}
            disabled={!question.hint}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-[#6B6B6B] transition-colors hover:bg-[#143D30]/10 hover:text-[#143D30] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Lightbulb size={13} />
            {showHint ? "Hide hint" : "Need a hint?"}
          </button>

          <button
            type="button"
            onClick={advance}
            disabled={!answered}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#143D30] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#0E2B22] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {index + 1 >= total ? "See my score" : "Next question"}
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </section>
  );
}
