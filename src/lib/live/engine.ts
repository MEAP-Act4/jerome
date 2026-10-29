import type {
  ActivityEvent,
  ActivityKind,
  AiInsight,
  LiveAction,
  LiveSession,
  LiveState,
  LiveTopic,
  TopicStatus,
} from "./types";

const MASTERED_AT = 85;
const ON_TRACK_AT = 70;
const MAX_ACTIVITY = 24;

export function statusFor(progress: number): TopicStatus {
  if (progress >= MASTERED_AT) return "mastered";
  if (progress >= ON_TRACK_AT) return "on-track";
  return "needs-work";
}

export const STATUS_LABEL: Record<TopicStatus, string> = {
  mastered: "Mastered",
  "on-track": "On Track",
  "needs-work": "Needs Work",
};

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

interface SessionPlan {
  category: string;
  subject: string;
  topicId: string;
  title: string;
  description: string;
  questionsTotal: number;
  minutesPerQuestion: number;
}

export const SESSION_PLAN: SessionPlan[] = [
  {
    category: "Specialized",
    subject: "Pre-Calculus",
    topicId: "trig-identities",
    title: "Understanding trigonometric identities",
    description:
      "Connect unit-circle relationships to identities through visual, adaptive practice.",
    questionsTotal: 8,
    minutesPerQuestion: 1.7,
  },
  {
    category: "Specialized",
    subject: "Pre-Calculus",
    topicId: "functions-graphs",
    title: "Reading functions and their graphs",
    description:
      "Lock in domain, range, composition, and inverses with instant, adaptive feedback.",
    questionsTotal: 6,
    minutesPerQuestion: 1.9,
  },
  {
    category: "Specialized",
    subject: "General Biology 1",
    topicId: "cellular-energetics",
    title: "Cellular energetics under the microscope",
    description:
      "Trace energy through glycolysis and the Krebs cycle in small, guided steps.",
    questionsTotal: 7,
    minutesPerQuestion: 1.6,
  },
];

function makeSession(plan: SessionPlan, now: number): LiveSession {
  return {
    category: plan.category,
    subject: plan.subject,
    topicId: plan.topicId,
    title: plan.title,
    description: plan.description,
    questionsTotal: plan.questionsTotal,
    questionsDone: 0,
    answeredCorrect: 0,
    minutesPerQuestion: plan.minutesPerQuestion,
    paused: false,
    completed: false,
    startedAt: now,
    updatedAt: now,
  };
}

export function createInitialState(): LiveState {
  const seededTopics: LiveTopic[] = [
    {
      id: "trig-identities",
      name: "Trigonometric identities",
      subject: "Pre-Calculus",
      progress: 61,
      attempted: 18,
      correct: 11,
    },
    {
      id: "functions-graphs",
      name: "Functions and graphs",
      subject: "Pre-Calculus",
      progress: 78,
      attempted: 26,
      correct: 20,
    },
    {
      id: "cellular-energetics",
      name: "Cellular energetics",
      subject: "General Biology 1",
      progress: 54,
      attempted: 14,
      correct: 7,
    },
    {
      id: "vectors-motion",
      name: "Vectors and motion",
      subject: "General Physics 1",
      progress: 92,
      attempted: 24,
      correct: 22,
    },
  ];

  const first = SESSION_PLAN[0];
  const session = makeSession(first, 0);
  session.questionsDone = 3;
  session.answeredCorrect = 3;

  return {
    studentName: "Ethan",
    dateLabel: "",
    streak: 7,
    streakExtendedToday: false,
    session,
    topics: seededTopics,
    mastery: { overall: 74, weeklyChange: 6 },
    weeklyGoal: { current: 4, target: 5 },
    aiInsight: {
      tone: "coach",
      topicId: "trig-identities",
      text: "You understand identities faster when they're linked to the unit circle. I can walk you through a visual proof.",
      cta: "Start a guided explanation",
    },
    activity: [],
    seq: 0,
    lastUpdated: 0,
    now: 0,
  };
}

function pushActivity(
  state: LiveState,
  kind: ActivityKind,
  text: string,
  detail?: string
): LiveState {
  const seq = state.seq + 1;
  const event: ActivityEvent = { id: seq, at: state.now, kind, text, detail };
  return {
    ...state,
    seq,
    activity: [event, ...state.activity].slice(0, MAX_ACTIVITY),
  };
}

function remainingMinutes(session: LiveSession) {
  const left = Math.max(0, session.questionsTotal - session.questionsDone);
  return left * session.minutesPerQuestion;
}

function derivedInsight(state: LiveState, trigger: InsightTrigger): AiInsight {
  const struggling = [...state.topics].sort((a, b) => a.progress - b.progress)[0];
  const active = state.topics.find((t) => t.id === state.session.topicId);

  switch (trigger.type) {
    case "miss": {
      const topicName = (active ?? struggling)?.name ?? "this topic";
      return {
        tone: "nudge",
        topicId: (active ?? struggling)?.id,
        text: `You just missed one on ${topicName.toLowerCase()}. There's a specific step you're rushing — I can show it on the unit circle so the reasoning sticks.`,
        cta: "Start a guided explanation",
      };
    }
    case "lesson-complete": {
      const streak = state.streak;
      return {
        tone: "celebrate",
        topicId: undefined,
        text: `Lesson complete — that's ${streak} days in a row. Your ${
          state.session.subject
        } mastery just ticked up. Want to push into ${nextTopicName(
          state
        )} while the momentum is hot?`,
        cta: "Recommend my next topic",
      };
    }
    case "extend-streak": {
      return {
        tone: "celebrate",
        topicId: undefined,
        text: `${state.streak}-day streak locked in for today. Consistency like this is exactly what moves mastery — nice work.`,
        cta: "See my weekly goal",
      };
    }
    case "pause": {
      const mins = Math.max(1, Math.round(remainingMinutes(state.session)));
      return {
        tone: "coach",
        topicId: state.session.topicId,
        text: `Paused at ${state.session.questionsDone} of ${
          state.session.questionsTotal
        } — I saved your spot in ${state.session.title.toLowerCase()} (~${mins} min to go). Pick up exactly where you stopped.`,
        cta: "Resume this lesson",
      };
    }
    case "struggle": {
      const target = struggling;
      return {
        tone: "nudge",
        topicId: target?.id,
        text: `${target?.name} is your least secure topic right now at ${Math.round(
          target?.progress ?? 0
        )}%. A short, focused set there would lift your overall mastery fastest.`,
        cta: "Practice this weak spot",
      };
    }
    case "correct":
    default: {
      const correct = state.session.answeredCorrect;
      const variants = [
        `${correct} correct and climbing — you're reading ${
          active?.name?.toLowerCase() ?? "these problems"
        } faster each round. Keep the streak alive.`,
        `Clean answer. Mastery is now ${Math.round(
          state.mastery.overall
        )}% — ${
          state.weeklyGoal.current
        } of ${state.weeklyGoal.target} weekly goals met.`,
        `That's the pattern I wanted to see. Let's stretch it with a harder one in ${
          active?.name?.toLowerCase() ?? "this topic"
        }.`,
      ];
      const pick = variants[state.seq % variants.length];
      return {
        tone: "coach",
        topicId: state.session.topicId,
        text: pick,
        cta: "Keep going",
      };
    }
  }
}

type InsightTrigger =
  | { type: "correct" }
  | { type: "miss" }
  | { type: "lesson-complete" }
  | { type: "extend-streak" }
  | { type: "pause" }
  | { type: "struggle" };

function nextTopicName(state: LiveState): string {
  const plan = SESSION_PLAN.find((p) => p.topicId === state.session.topicId);
  const idx = plan ? SESSION_PLAN.indexOf(plan) : 0;
  return SESSION_PLAN[(idx + 1) % SESSION_PLAN.length].title.toLowerCase();
}

export function liveReducer(state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case "HYDRATE": {
      const next: LiveState = {
        ...state,
        dateLabel: action.dateLabel,
        now: action.now,
        lastUpdated: action.now,
        session: {
          ...state.session,
          startedAt: action.now,
          updatedAt: action.now,
        },
      };
      return next;
    }

    case "TICK": {
      return { ...state, now: action.now };
    }

    case "ANSWER": {
      const { correct } = action;
      const session = state.session;

      if (session.completed) {
        return state;
      }

      const questionsDone = Math.min(
        session.questionsTotal,
        session.questionsDone + 1
      );
      const answeredCorrect = session.answeredCorrect + (correct ? 1 : 0);
      const isFinal = questionsDone >= session.questionsTotal;
      const justCompleted = isFinal && !session.completed;

      const topics = state.topics.map((t) => {
        if (t.id !== session.topicId) return t;
        return {
          ...t,
          progress: round1(clamp(t.progress + (correct ? 4.2 : 1.1))),
          attempted: t.attempted + 1,
          correct: t.correct + (correct ? 1 : 0),
        };
      });

      let masteryOverall = clamp(
        state.mastery.overall + (correct ? 0.4 : 0.15),
        0,
        100
      );
      let streak = state.streak;
      let streakExtendedToday = state.streakExtendedToday;
      let weeklyGoal = state.weeklyGoal;

      if (justCompleted) {
        masteryOverall = clamp(masteryOverall + 1.2, 0, 100);
        weeklyGoal = {
          ...state.weeklyGoal,
          current: Math.min(state.weeklyGoal.target, state.weeklyGoal.current + 1),
        };
        if (!streakExtendedToday) {
          streak = state.streak + 1;
          streakExtendedToday = true;
        }
      }

      let next: LiveState = {
        ...state,
        now: action.now,
        lastUpdated: action.now,
        streak,
        streakExtendedToday,
        topics,
        mastery: { ...state.mastery, overall: round1(masteryOverall) },
        weeklyGoal,
        session: {
          ...session,
          questionsDone,
          answeredCorrect,
          completed: justCompleted,
          updatedAt: action.now,
        },
      };

      const topicLabel = activeTopicName(next, session.topicId);
      next = pushActivity(
        next,
        "answer",
        correct ? `Answered correctly` : `Missed one`,
        `${topicLabel} · Q${questionsDone}/${session.questionsTotal}`
      );

      if (justCompleted) {
        next = pushActivity(
          next,
          "lesson",
          `Completed ${session.title}`,
          `+1 competency · ${next.streak}-day streak`
        );
        if (streak !== state.streak) {
          next = pushActivity(
            next,
            "streak",
            `Streak extended to ${next.streak} days`,
            "Daily lesson finished"
          );
        }
      }

      const trigger: InsightTrigger = justCompleted
        ? { type: "lesson-complete" }
        : correct
          ? { type: "correct" }
          : { type: "miss" };

      next = { ...next, aiInsight: derivedInsight(next, trigger) };
      return next;
    }

    case "COMPLETE_LESSON": {
      const session = { ...state.session, completed: true, updatedAt: action.now };
      let next: LiveState = {
        ...state,
        now: action.now,
        lastUpdated: action.now,
        session,
        mastery: {
          ...state.mastery,
          overall: round1(clamp(state.mastery.overall + 1.2, 0, 100)),
        },
        weeklyGoal: {
          ...state.weeklyGoal,
          current: Math.min(state.weeklyGoal.target, state.weeklyGoal.current + 1),
        },
      };

      next = pushActivity(
        next,
        "lesson",
        `Completed ${session.title}`,
        `+1 competency`
      );

      if (!state.streakExtendedToday) {
        next = {
          ...next,
          streak: state.streak + 1,
          streakExtendedToday: true,
        };
        next = pushActivity(
          next,
          "streak",
          `Streak extended to ${next.streak} days`,
          "Daily lesson finished"
        );
        next = { ...next, aiInsight: derivedInsight(next, { type: "extend-streak" }) };
      } else {
        next = {
          ...next,
          aiInsight: derivedInsight(next, { type: "lesson-complete" }),
        };
      }
      return next;
    }

    case "PAUSE": {
      if (state.session.paused || state.session.completed) return state;
      let next: LiveState = {
        ...state,
        now: action.now,
        lastUpdated: action.now,
        session: { ...state.session, paused: true, updatedAt: action.now },
      };
      next = pushActivity(
        next,
        "pause",
        "Session paused",
        `${next.session.questionsDone}/${next.session.questionsTotal} questions`
      );
      next = { ...next, aiInsight: derivedInsight(next, { type: "pause" }) };
      return next;
    }

    case "RESUME": {
      if (!state.session.paused) return state;
      let next: LiveState = {
        ...state,
        now: action.now,
        lastUpdated: action.now,
        session: { ...state.session, paused: false, updatedAt: action.now },
      };
      next = pushActivity(next, "resume", "Resumed session", next.session.title);
      return next;
    }

    case "ADVANCE_SESSION": {
      const currentPlan = SESSION_PLAN.find(
        (p) => p.topicId === state.session.topicId
      );
      const idx = currentPlan ? SESSION_PLAN.indexOf(currentPlan) : -1;
      const plan = SESSION_PLAN[(idx + 1) % SESSION_PLAN.length];
      let next: LiveState = {
        ...state,
        now: action.now,
        lastUpdated: action.now,
        session: makeSession(plan, action.now),
      };
      next = pushActivity(
        next,
        "insight",
        `Queued ${plan.title}`,
        `${plan.questionsTotal} adaptive questions`
      );
      next = { ...next, aiInsight: derivedInsight(next, { type: "correct" }) };
      return next;
    }

    case "NUDGE": {
      let next: LiveState = {
        ...state,
        now: action.now,
        lastUpdated: action.now,
      };
      next = { ...next, aiInsight: derivedInsight(next, { type: "struggle" }) };
      next = pushActivity(next, "insight", "AI insight refreshed", "Based on live mastery");
      return next;
    }

    default:
      return state;
  }
}

function activeTopicName(state: LiveState, topicId: string) {
  return (
    state.topics.find((t) => t.id === topicId)?.name ??
    state.session.title
  );
}

export { remainingMinutes };
