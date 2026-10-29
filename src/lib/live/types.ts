export type TopicStatus = "mastered" | "on-track" | "needs-work";

export type ActivityKind =
  | "answer"
  | "lesson"
  | "pause"
  | "resume"
  | "streak"
  | "mastery"
  | "insight";

export type InsightTone = "coach" | "celebrate" | "nudge";

export interface LiveTopic {
  id: string;
  name: string;
  subject: string;
  progress: number;
  attempted: number;
  correct: number;
}

export interface LiveSession {
  category: string;
  subject: string;
  topicId: string;
  title: string;
  description: string;
  questionsTotal: number;
  questionsDone: number;
  answeredCorrect: number;
  minutesPerQuestion: number;
  paused: boolean;
  completed: boolean;
  startedAt: number;
  updatedAt: number;
}

export interface ActivityEvent {
  id: number;
  at: number;
  kind: ActivityKind;
  text: string;
  detail?: string;
}

export interface AiInsight {
  tone: InsightTone;
  text: string;
  cta: string;
  topicId?: string;
}

export interface LiveState {
  studentName: string;
  dateLabel: string;
  streak: number;
  streakExtendedToday: boolean;
  session: LiveSession;
  topics: LiveTopic[];
  mastery: {
    overall: number;
    weeklyChange: number;
  };
  weeklyGoal: {
    current: number;
    target: number;
  };
  aiInsight: AiInsight;
  activity: ActivityEvent[];
  seq: number;
  lastUpdated: number;
  now: number;
}

export type LiveAction =
  | { type: "HYDRATE"; now: number; dateLabel: string }
  | { type: "ANSWER"; correct: boolean; now: number }
  | { type: "COMPLETE_LESSON"; now: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "ADVANCE_SESSION"; now: number }
  | { type: "NUDGE"; now: number }
  | { type: "TICK"; now: number };
