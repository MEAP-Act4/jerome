"use client";

import {
  Flame,
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Beaker,
  Wrench,
  BookOpen,
  Pause,
  Play,
  Activity,
  Radio,
  Zap,
} from "lucide-react";
import { useLiveProgress } from "./LiveProgressProvider";
import AnimatedNumber from "./AnimatedNumber";
import { usePreferences } from "../preferences/PreferencesProvider";
import { statusFor, STATUS_LABEL } from "@/lib/live/engine";
import type { ActivityKind, TopicStatus } from "@/lib/live/types";

const subjectIcons = {
  Specialized: GraduationCap,
  "STEM Core": Beaker,
  Applied: Wrench,
  "General Core": BookOpen,
};

const statusConfig: Record<
  TopicStatus,
  { icon: typeof CheckCircle2; className: string }
> = {
  mastered: { icon: CheckCircle2, className: "bg-green-100 text-green-900" },
  "on-track": { icon: TrendingUp, className: "bg-blue-100 text-blue-500" },
  "needs-work": { icon: AlertCircle, className: "bg-orange-100 text-orange-500" },
};

const toneStyles = {
  coach: "border-cream-200 bg-cream-50",
  celebrate: "border-green-100 bg-green-50",
  nudge: "border-orange-100 bg-orange-100/40",
};

const activityIcons: Record<ActivityKind, typeof Flame> = {
  answer: CheckCircle2,
  lesson: GraduationCap,
  pause: Pause,
  resume: Play,
  streak: Flame,
  mastery: TrendingUp,
  insight: Sparkles,
};

function ago(seconds: number) {
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-700" />
    </span>
  );
}

export default function Dashboard() {
  const {
    state,
    hydrated,
    remaining,
    lastEventAgoSec,
    isBusy,
    recordAnswer,
    completeLesson,
    pauseSession,
    resumeSession,
    advanceSession,
    nudge,
  } = useLiveProgress();
  const { preferences } = usePreferences();

  const { session, topics, mastery, weeklyGoal, streak, aiInsight, activity } = state;
  const remainingQuestions = Math.max(0, session.questionsTotal - session.questionsDone);
  const circumference = 2 * Math.PI * 45;
  const masteryDashOffset = circumference - (mastery.overall / 100) * circumference;
  const weeklyTarget = preferences.learning.weeklyGoal;
  const weeklyCurrent = Math.min(weeklyGoal.current, weeklyTarget);
  const goalPct = Math.min(100, (weeklyCurrent / weeklyTarget) * 100);
  const goalMet = weeklyCurrent >= weeklyTarget;
  const weakest = [...topics].sort((a, b) => a.progress - b.progress)[0];
  const recommendation = goalMet
    ? `Weekly goal hit — momentum is on your side. Keep stretching ${weakest.subject} while it feels easy.`
    : `You're making steady progress. Keep practicing ${weakest.subject} to reach your weekly goal.`;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{state.dateLabel || "Today"}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-green-950">
            Good morning, {preferences.profile.firstName || state.studentName}.
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            You&apos;re on a {streak}-day streak. Let&apos;s keep the momentum going.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-surface-border bg-surface-white px-3.5 py-2 shadow-card">
          <LiveDot />
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-green-900">
            Live
          </span>
          <span className="h-3 w-px bg-surface-border" />
          <span className="text-xs text-text-muted">
            {isBusy ? "tracking your session" : "listening"} · updated {ago(lastEventAgoSec)}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-card bg-cream-50 p-6 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow mb-1">Daily Streak</p>
              <p className="font-serif text-4xl font-semibold text-green-950">
                <AnimatedNumber value={streak} /> days
              </p>
            </div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-cream-200">
              <Flame
                className={`h-6 w-6 text-orange-500 ${
                  state.streakExtendedToday ? "animate-bounce-slow" : ""
                }`}
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-text-muted">
            {state.streakExtendedToday
              ? "Streak secured today — every lesson now compounds."
              : "Study any lesson to extend your streak today."}
          </p>
          {state.streakExtendedToday && (
            <span className="badge-green mt-3 inline-flex animate-fade-up">
              <CheckCircle2 className="h-3 w-3" />
              Extended today
            </span>
          )}
        </section>

        <section className="card lg:col-span-2">
          <div className="flex h-full items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <GraduationCap className="h-6 w-6 text-green-900" />
              </div>
              <div>
                <p className="eyebrow mb-0.5">Curriculum Coverage</p>
                <p className="font-serif text-xl font-semibold text-green-950">
                  31 topics across 4 tracks
                </p>
              </div>
            </div>
            <a href="/subjects" className="btn-ghost flex items-center gap-1.5">
              Explore all
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-card bg-green-950 text-cream-50">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-between p-8 lg:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-lime-400 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-green-950">
                  {session.category} · {session.subject}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-50/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-cream-50/70">
                  {session.completed ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-lime-400" />
                      Complete
                    </>
                  ) : session.paused ? (
                    <>
                      <Pause className="h-3 w-3 text-orange-500" />
                      Paused
                    </>
                  ) : (
                    <>
                      <LiveDot className="scale-90" />
                      In session
                    </>
                  )}
                </span>
              </div>
              <h2 className="mt-5 font-serif text-2xl font-semibold leading-snug tracking-tight lg:text-[28px]">
                Continue where you left off
              </h2>
              <p className="mt-2 font-serif text-lg leading-relaxed text-cream-50/90">
                {session.title}
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-cream-50/70">
                {session.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-cream-50/60">
                <span>{Math.max(1, Math.round(remaining))} min left</span>
                <span className="h-1 w-1 rounded-full bg-cream-50/30" />
                <span>
                  {session.questionsDone} of {session.questionsTotal} questions
                </span>
                <span className="h-1 w-1 rounded-full bg-cream-50/30" />
                <span>
                  {session.answeredCorrect} correct
                </span>
              </div>
              <div className="mt-4 max-w-md">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-50/10">
                  <div
                    className="h-full rounded-full bg-lime-400 transition-all duration-700 ease-out"
                    style={{
                      width: `${(session.questionsDone / session.questionsTotal) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-cream-50/50">
                  {session.completed
                    ? "Ready for the next lesson"
                    : `${remainingQuestions} questions remaining`}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                {session.completed ? (
                  <button onClick={advanceSession} className="btn-primary">
                    Start next lesson
                    <ArrowRight className="ml-1.5 inline h-4 w-4" />
                  </button>
                ) : session.paused ? (
                  <button onClick={resumeSession} className="btn-primary">
                    <Play className="mr-1.5 inline h-4 w-4" />
                    Resume lesson
                  </button>
                ) : (
                  <button onClick={pauseSession} className="btn-primary">
                    Continue lesson
                  </button>
                )}
                <a
                  href="/ai-tutor"
                  className="btn-secondary border-cream-50/20 text-cream-50 hover:bg-cream-50/5"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask JEROME
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-cream-50/10 pt-4">
                <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cream-50/40">
                  Log activity
                </span>
                <button
                  onClick={() => recordAnswer(true)}
                  disabled={session.completed}
                  className="rounded-md border border-cream-50/15 px-2.5 py-1.5 text-xs text-cream-50/80 transition-colors hover:bg-cream-50/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                  Correct
                </button>
                <button
                  onClick={() => recordAnswer(false)}
                  disabled={session.completed}
                  className="rounded-md border border-cream-50/15 px-2.5 py-1.5 text-xs text-cream-50/80 transition-colors hover:bg-cream-50/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
                  Missed
                </button>
                <button
                  onClick={completeLesson}
                  disabled={session.completed}
                  className="rounded-md border border-cream-50/15 px-2.5 py-1.5 text-xs text-cream-50/80 transition-colors hover:bg-cream-50/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Zap className="mr-1 inline h-3.5 w-3.5" />
                  Finish lesson
                </button>
              </div>
            </div>
          </div>

          <div className="relative hidden min-h-[320px] border-l border-cream-50/10 lg:block">
            <svg
              className="absolute inset-0 h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path
                    d="M 24 0 L 0 0 0 24"
                    fill="none"
                    stroke="rgba(253,248,240,0.06)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="280" height="200" viewBox="0 0 280 200" fill="none">
                <circle cx="140" cy="100" r="70" stroke="rgba(253,248,240,0.2)" strokeWidth="1" />
                <circle cx="140" cy="100" r="50" stroke="rgba(253,248,240,0.1)" strokeWidth="1" />
                <line x1="50" y1="100" x2="230" y2="100" stroke="rgba(253,248,240,0.3)" strokeWidth="1" />
                <line x1="140" y1="10" x2="140" y2="190" stroke="rgba(253,248,240,0.3)" strokeWidth="1" />
                <path d="M 140 30 A 70 70 0 0 1 210 100" stroke="rgba(207,235,137,0.5)" strokeWidth="2" fill="none" />
                <path d="M 140 30 A 70 70 0 0 1 140 100" stroke="rgba(207,235,137,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
                <circle cx="210" cy="100" r="3" fill="rgba(207,235,137,0.8)" className="animate-pulse" />
                <text x="218" y="104" fill="rgba(253,248,240,0.6)" fontSize="10" fontFamily="DM Mono, monospace">
                  θ
                </text>
                <text x="100" y="95" fill="rgba(253,248,240,0.4)" fontSize="9" fontFamily="DM Mono, monospace">
                  cos θ
                </text>
                <text x="148" y="45" fill="rgba(253,248,240,0.4)" fontSize="9" fontFamily="DM Mono, monospace">
                  sin θ
                </text>
              </svg>
            </div>
            <div className="absolute bottom-6 right-6 flex gap-2">
              <span className="rounded-md border border-cream-50/15 bg-cream-50/5 px-2.5 py-1.5 font-mono text-xs text-cream-50/70">
                y = sin(x)
              </span>
              <span className="rounded-md border border-cream-50/15 bg-cream-50/5 px-2.5 py-1.5 font-mono text-xs text-cream-50/70">
                y = cos(x)
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-0.5">Curriculum Coverage</p>
            <h3 className="font-serif text-lg font-semibold text-green-950">
              Topics by track
            </h3>
          </div>
          <a href="/subjects" className="btn-ghost flex items-center gap-1.5">
            Explore all subjects
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { name: "Specialized", count: 9 },
            { name: "STEM Core", count: 2 },
            { name: "Applied", count: 7 },
            { name: "General Core", count: 13 },
          ].map((item) => {
            const Icon = subjectIcons[item.name as keyof typeof subjectIcons];
            return (
              <div
                key={item.name}
                className="card-hover rounded-xl border border-surface-border bg-surface p-5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                    <Icon className="h-[18px] w-[18px] text-green-900" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {item.name}
                  </span>
                </div>
                <p className="mt-4 font-serif text-3xl font-semibold text-green-950">
                  {item.count}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">topics</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="eyebrow mb-0.5">Topic Mastery</p>
              <h3 className="font-serif text-lg font-semibold text-green-950">
                Your progress by topic
              </h3>
            </div>
            <span className="hidden items-center gap-2 text-xs text-text-muted sm:flex">
              <LiveDot />
              updating live
            </span>
          </div>
          <div className="overflow-x-auto border-t border-surface-border">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="px-6 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                    Topic
                  </th>
                  <th className="hidden px-6 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted sm:table-cell">
                    Subject
                  </th>
                  <th className="w-[30%] px-6 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => {
                  const status = statusFor(topic.progress);
                  const cfg = statusConfig[status];
                  const isActive = topic.id === session.topicId;
                  return (
                    <tr
                      key={topic.id}
                      className={`border-b border-surface-border last:border-0 transition-colors ${
                        isActive ? "bg-green-50/60" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
                          {isActive && <LiveDot />}
                          {topic.name}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <span className="text-sm text-text-muted">{topic.subject}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${topic.progress}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`badge transition-colors duration-500 ${cfg.className}`}
                        >
                          <cfg.icon className="h-3 w-3" />
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-sm font-medium text-green-950">
                          <AnimatedNumber value={topic.progress} />%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card flex flex-col p-6">
          <p className="eyebrow mb-0.5">Overall Mastery</p>
          <h3 className="font-serif text-lg font-semibold text-green-950">
            Your learning profile
          </h3>
          <div className="mt-6 flex justify-center">
            <div className="relative">
              <svg width="140" height="140" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(20,61,48,0.08)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1E6047"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={masteryDashOffset}
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-3xl font-semibold text-green-950">
                  <AnimatedNumber value={mastery.overall} />%
                </span>
                <span className="text-xs text-text-muted">mastered</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-green-900" />
            <span className="text-sm font-medium text-green-900">
              +{mastery.weeklyChange}% this week
            </span>
          </div>
          <div className="mt-6 rounded-xl bg-surface p-4">
            <p className="eyebrow mb-2">Recommendation</p>
            <p className="text-sm leading-relaxed text-text-primary">{recommendation}</p>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">Weekly goal</span>
              <span className="font-mono text-text-muted">
                {weeklyCurrent}/{weeklyTarget} topics
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${goalPct}%` }} />
            </div>
            {goalMet && (
              <p className="mt-2 animate-fade-up text-xs font-medium text-green-900">
                Goal reached — keep stacking competencies.
              </p>
            )}
          </div>
        </section>
      </div>

      <section
        className={`flex flex-col gap-4 rounded-card border p-6 transition-colors duration-500 sm:flex-row sm:items-start ${toneStyles[aiInsight.tone]}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-200">
          <Sparkles className="h-5 w-5 animate-pulse-slow text-green-900" />
        </div>
        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <p className="eyebrow">AI Insight</p>
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-green-900">
              <LiveDot />
              live
            </span>
          </div>
          <p key={aiInsight.text} className="animate-fade-up text-sm leading-relaxed text-text-primary">
            {aiInsight.text}
          </p>
        </div>
        <button onClick={nudge} className="btn-primary shrink-0">
          {aiInsight.cta}
        </button>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-900" />
            <p className="eyebrow">Live activity</p>
          </div>
          <span className="flex items-center gap-2 text-xs text-text-muted">
            <Radio className="h-3.5 w-3.5 text-green-700" />
            {hydrated ? "listening to your session" : "connecting"}
          </span>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {activity.length === 0 ? (
            <span className="text-sm text-text-muted">
              Waiting for your next move — start a lesson and I&apos;ll track it in real time.
            </span>
          ) : (
            activity.slice(0, 8).map((ev) => {
              const Icon = activityIcons[ev.kind];
              return (
                <div
                  key={ev.id}
                  className="animate-fade-up flex min-w-[200px] shrink-0 items-start gap-2.5 rounded-lg border border-surface-border bg-surface px-3.5 py-2.5"
                >
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-900" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-text-primary">
                      {ev.text}
                    </p>
                    {ev.detail && (
                      <p className="truncate text-[11px] text-text-muted">{ev.detail}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
