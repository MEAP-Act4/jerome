export type ThemeChoice = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
export type FontScale = "default" | "large" | "xlarge";
export type Difficulty = "supportive" | "adaptive" | "challenging";
export type AgentTone = "encouraging" | "direct" | "socratic" | "playful";
export type AgentDepth = "concise" | "balanced" | "detailed";
export type AgentLength = "short" | "medium" | "long";
export type AgentLanguage = "english" | "filipino" | "mixed";
export type AgentEmoji = "none" | "rare" | "frequent";

export interface ProfilePreferences {
  firstName: string;
  lastName: string;
  grade: string;
  strand: string;
  school: string;
  avatarColor: string;
  avatarInitials: string;
}

export interface AppearancePreferences {
  theme: ThemeChoice;
  accent: string;
  density: Density;
  fontScale: FontScale;
  reduceMotion: boolean;
  highContrast: boolean;
}

export interface LearningPreferences {
  dailyGoal: number;
  weeklyGoal: number;
  sessionLength: number;
  difficulty: Difficulty;
  autoAdvance: boolean;
  showTimer: boolean;
}

export interface NotificationPreferences {
  emailReminders: boolean;
  streakAlerts: boolean;
  insightAlerts: boolean;
  weeklyReport: boolean;
  reminderTime: string;
  quietHours: boolean;
}

export interface AgentPreferences {
  tone: AgentTone;
  depth: AgentDepth;
  length: AgentLength;
  language: AgentLanguage;
  emojis: AgentEmoji;
  socratic: boolean;
  showStepsFirst: boolean;
}

export interface Preferences {
  profile: ProfilePreferences;
  appearance: AppearancePreferences;
  learning: LearningPreferences;
  notifications: NotificationPreferences;
  agent: AgentPreferences;
}

export const STORAGE_KEY = "jerome.preferences.v1";

export const DEFAULT_PREFERENCES: Preferences = {
  profile: {
    firstName: "Ethan",
    lastName: "Manlapaz",
    grade: "Grade 10",
    strand: "STEM",
    school: "Philippine Science High School",
    avatarColor: "#F2C9A4",
    avatarInitials: "EM",
  },
  appearance: {
    theme: "light",
    accent: "lime",
    density: "comfortable",
    fontScale: "default",
    reduceMotion: false,
    highContrast: false,
  },
  learning: {
    dailyGoal: 3,
    weeklyGoal: 5,
    sessionLength: 15,
    difficulty: "adaptive",
    autoAdvance: true,
    showTimer: true,
  },
  notifications: {
    emailReminders: true,
    streakAlerts: true,
    insightAlerts: true,
    weeklyReport: false,
    reminderTime: "19:00",
    quietHours: false,
  },
  agent: {
    tone: "encouraging",
    depth: "balanced",
    length: "short",
    language: "english",
    emojis: "rare",
    socratic: true,
    showStepsFirst: false,
  },
};

export interface AccentOption {
  id: string;
  label: string;
  hex: string;
  strong: string;
}

export const ACCENTS: AccentOption[] = [
  { id: "lime", label: "Lime", hex: "#CFEB89", strong: "#A9CE5B" },
  { id: "green", label: "Emerald", hex: "#66C7A0", strong: "#3A9470" },
  { id: "blue", label: "Ocean", hex: "#6FA8CF", strong: "#4A7FA5" },
  { id: "violet", label: "Violet", hex: "#9C8BC4", strong: "#7C6BAE" },
  { id: "orange", label: "Amber", hex: "#E0A86A", strong: "#D4884A" },
  { id: "rose", label: "Rose", hex: "#D98585", strong: "#C05050" },
];

export const AVATAR_COLORS = [
  "#F2C9A4",
  "#CFEB89",
  "#9CCFBF",
  "#A9BFE0",
  "#C7B3E0",
  "#E8B4B4",
  "#E0C98A",
];

export const GRADE_OPTIONS = [
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

export const STRAND_OPTIONS = ["STEM", "ABM", "HUMSS", "GAS", "TVL", "Sports", "Arts"];

export function mergePreferences(stored: unknown): Preferences {
  if (!stored || typeof stored !== "object") return DEFAULT_PREFERENCES;
  const s = stored as Partial<Preferences>;
  return {
    profile: { ...DEFAULT_PREFERENCES.profile, ...(s.profile ?? {}) },
    appearance: { ...DEFAULT_PREFERENCES.appearance, ...(s.appearance ?? {}) },
    learning: { ...DEFAULT_PREFERENCES.learning, ...(s.learning ?? {}) },
    notifications: {
      ...DEFAULT_PREFERENCES.notifications,
      ...(s.notifications ?? {}),
    },
    agent: { ...DEFAULT_PREFERENCES.agent, ...(s.agent ?? {}) },
  };
}

export function accentById(id: string): AccentOption {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r} ${g} ${b}`;
}
