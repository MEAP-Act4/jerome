"use client";

import { useRef, useState } from "react";
import {
  User,
  Palette,
  GraduationCap,
  Bell,
  Bot,
  ShieldCheck,
  RotateCcw,
  Download,
  Check,
  Sparkles,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import {
  SettingRow,
  Segmented,
  Toggle,
  Stepper,
  SettingsCard,
} from "@/components/preferences/controls";
import {
  ACCENTS,
  AVATAR_COLORS,
  GRADE_OPTIONS,
  STRAND_OPTIONS,
} from "@/lib/preferences/types";

function initialsOf(first: string, last: string) {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  return `${a}${b}`.toUpperCase() || "?";
}

export default function PreferencesPage() {
  const { preferences, hydrated, update, reset } = usePreferences();
  const { profile, appearance, learning, notifications, agent } = preferences;

  const [saved, setSaved] = useState(false);
  const lastChange = useRef(0);

  const flashSaved = () => {
    const now = Date.now();
    if (now - lastChange.current < 1200) return;
    lastChange.current = now;
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  const handleReset = () => {
    if (window.confirm("Reset all preferences to their defaults?")) {
      reset();
      flashSaved();
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(preferences, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jerome-preferences.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const setName = (first: string, last: string) => {
    update("profile", {
      firstName: first,
      lastName: last,
      avatarInitials: initialsOf(first, last),
    });
    flashSaved();
  };

  const toneLabel = {
    encouraging: "warm and encouraging",
    direct: "clear and direct",
    socratic: "Socratic — guiding with questions",
    playful: "light and playful",
  }[agent.tone];

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Account</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-green-950">
            Preferences
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Personalize how JEROME looks, teaches, and keeps you on track. Changes
            save automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 text-xs font-medium transition-opacity duration-300 ${
              saved ? "text-green-900 opacity-100" : "opacity-0"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
          <button onClick={handleReset} className="btn-secondary py-2 text-sm">
            <RotateCcw className="mr-1.5 inline h-4 w-4" />
            Reset
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SettingsCard eyebrow="Identity" title="Profile" icon={User}>
            <SettingRow label="First name">
              <input
                className="input-field py-2"
                value={profile.firstName}
                onChange={(e) => setName(e.target.value, profile.lastName)}
              />
            </SettingRow>
            <SettingRow label="Last name">
              <input
                className="input-field py-2"
                value={profile.lastName}
                onChange={(e) => setName(profile.firstName, e.target.value)}
              />
            </SettingRow>
            <SettingRow label="Grade level">
              <select
                className="input-field py-2"
                value={profile.grade}
                onChange={(e) => {
                  update("profile", { grade: e.target.value });
                  flashSaved();
                }}
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </SettingRow>
            <SettingRow label="Strand / Track">
              <select
                className="input-field py-2"
                value={profile.strand}
                onChange={(e) => {
                  update("profile", { strand: e.target.value });
                  flashSaved();
                }}
              >
                {STRAND_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </SettingRow>
            <SettingRow label="School">
              <input
                className="input-field py-2"
                value={profile.school}
                onChange={(e) => {
                  update("profile", { school: e.target.value });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow label="Avatar color">
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Avatar color ${color}`}
                    onClick={() => {
                      update("profile", { avatarColor: color });
                      flashSaved();
                    }}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${
                      profile.avatarColor === color
                        ? "border-green-950"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </SettingRow>
          </SettingsCard>

          <SettingsCard eyebrow="Personalization" title="Appearance" icon={Palette}>
            <SettingRow
              label="Theme"
              description="Choose light, dark, or match your device."
            >
              <Segmented
                value={appearance.theme}
                onChange={(v) => {
                  update("appearance", { theme: v });
                  flashSaved();
                }}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "system", label: "System" },
                ]}
              />
            </SettingRow>
            <SettingRow label="Accent color">
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent.id}
                    type="button"
                    aria-label={accent.label}
                    title={accent.label}
                    onClick={() => {
                      update("appearance", { accent: accent.id });
                      flashSaved();
                    }}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${
                      appearance.accent === accent.id
                        ? "border-green-950"
                        : "border-surface-border"
                    }`}
                    style={{ backgroundColor: accent.hex }}
                  />
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Density">
              <Segmented
                value={appearance.density}
                onChange={(v) => {
                  update("appearance", { density: v });
                  flashSaved();
                }}
                options={[
                  { value: "comfortable", label: "Comfortable" },
                  { value: "compact", label: "Compact" },
                ]}
              />
            </SettingRow>
            <SettingRow label="Text size">
              <Segmented
                value={appearance.fontScale}
                onChange={(v) => {
                  update("appearance", { fontScale: v });
                  flashSaved();
                }}
                options={[
                  { value: "default", label: "Default" },
                  { value: "large", label: "Large" },
                  { value: "xlarge", label: "XL" },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Reduce motion"
              description="Minimize animations and transitions."
            >
              <Toggle
                label="Reduce motion"
                checked={appearance.reduceMotion}
                onChange={(v) => {
                  update("appearance", { reduceMotion: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow
              label="High contrast"
              description="Stronger borders and text for readability."
            >
              <Toggle
                label="High contrast"
                checked={appearance.highContrast}
                onChange={(v) => {
                  update("appearance", { highContrast: v });
                  flashSaved();
                }}
              />
            </SettingRow>
          </SettingsCard>

          <SettingsCard eyebrow="Goals" title="Learning" icon={GraduationCap}>
            <SettingRow label="Daily goal" description="Topics to complete each day.">
              <Stepper
                value={learning.dailyGoal}
                min={1}
                max={12}
                onChange={(v) => {
                  update("learning", { dailyGoal: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow label="Weekly goal" description="Topics to master this week.">
              <Stepper
                value={learning.weeklyGoal}
                min={1}
                max={30}
                onChange={(v) => {
                  update("learning", { weeklyGoal: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow
              label="Preferred session length"
              description="Used to size your study blocks."
            >
              <Stepper
                value={learning.sessionLength}
                min={5}
                max={90}
                suffix="min"
                onChange={(v) => {
                  update("learning", { sessionLength: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow label="Difficulty">
              <Segmented
                value={learning.difficulty}
                onChange={(v) => {
                  update("learning", { difficulty: v });
                  flashSaved();
                }}
                options={[
                  { value: "supportive", label: "Supportive" },
                  { value: "adaptive", label: "Adaptive" },
                  { value: "challenging", label: "Challenging" },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Auto-advance"
              description="Move to the next lesson automatically after completion."
            >
              <Toggle
                label="Auto-advance"
                checked={learning.autoAdvance}
                onChange={(v) => {
                  update("learning", { autoAdvance: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow
              label="Show session timer"
              description="Display remaining time during a lesson."
            >
              <Toggle
                label="Show session timer"
                checked={learning.showTimer}
                onChange={(v) => {
                  update("learning", { showTimer: v });
                  flashSaved();
                }}
              />
            </SettingRow>
          </SettingsCard>

          <SettingsCard eyebrow="Reminders" title="Notifications" icon={Bell}>
            <SettingRow label="Email reminders">
              <Toggle
                label="Email reminders"
                checked={notifications.emailReminders}
                onChange={(v) => {
                  update("notifications", { emailReminders: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow
              label="Streak alerts"
              description="Nudge me before I break a daily streak."
            >
              <Toggle
                label="Streak alerts"
                checked={notifications.streakAlerts}
                onChange={(v) => {
                  update("notifications", { streakAlerts: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow
              label="AI insight alerts"
              description="Notify me when JEROME has a new recommendation."
            >
              <Toggle
                label="AI insight alerts"
                checked={notifications.insightAlerts}
                onChange={(v) => {
                  update("notifications", { insightAlerts: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow
              label="Weekly report"
              description="A Sunday summary of mastery and momentum."
            >
              <Toggle
                label="Weekly report"
                checked={notifications.weeklyReport}
                onChange={(v) => {
                  update("notifications", { weeklyReport: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow label="Reminder time">
              <input
                type="time"
                className="input-field py-2"
                value={notifications.reminderTime}
                onChange={(e) => {
                  update("notifications", { reminderTime: e.target.value });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow
              label="Quiet hours"
              description="Pause all reminders after 9pm."
            >
              <Toggle
                label="Quiet hours"
                checked={notifications.quietHours}
                onChange={(v) => {
                  update("notifications", { quietHours: v });
                  flashSaved();
                }}
              />
            </SettingRow>
          </SettingsCard>

          <SettingsCard eyebrow="Customization" title="JEROME agent" icon={Bot}>
            <SettingRow
              label="Persona / tone"
              description="How JEROME sounds when it tutors you."
            >
              <Segmented
                value={agent.tone}
                onChange={(v) => {
                  update("agent", { tone: v });
                  flashSaved();
                }}
                options={[
                  { value: "encouraging", label: "Encouraging" },
                  { value: "direct", label: "Direct" },
                  { value: "socratic", label: "Socratic" },
                  { value: "playful", label: "Playful" },
                ]}
              />
            </SettingRow>
            <SettingRow label="Explanation depth">
              <Segmented
                value={agent.depth}
                onChange={(v) => {
                  update("agent", { depth: v });
                  flashSaved();
                }}
                options={[
                  { value: "concise", label: "Concise" },
                  { value: "balanced", label: "Balanced" },
                  { value: "detailed", label: "Detailed" },
                ]}
              />
            </SettingRow>
            <SettingRow label="Response length">
              <Segmented
                value={agent.length}
                onChange={(v) => {
                  update("agent", { length: v });
                  flashSaved();
                }}
                options={[
                  { value: "short", label: "Short" },
                  { value: "medium", label: "Medium" },
                  { value: "long", label: "Long" },
                ]}
              />
            </SettingRow>
            <SettingRow label="Language">
              <Segmented
                value={agent.language}
                onChange={(v) => {
                  update("agent", { language: v });
                  flashSaved();
                }}
                options={[
                  { value: "english", label: "English" },
                  { value: "filipino", label: "Filipino" },
                  { value: "mixed", label: "Taglish" },
                ]}
              />
            </SettingRow>
            <SettingRow label="Emoji use">
              <Segmented
                value={agent.emojis}
                onChange={(v) => {
                  update("agent", { emojis: v });
                  flashSaved();
                }}
                options={[
                  { value: "none", label: "None" },
                  { value: "rare", label: "Rare" },
                  { value: "frequent", label: "Frequent" },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Guide with hints first"
              description="Make JEROME ask and hint before giving answers."
            >
              <Toggle
                label="Guide with hints first"
                checked={agent.socratic}
                onChange={(v) => {
                  update("agent", { socratic: v });
                  flashSaved();
                }}
              />
            </SettingRow>
            <SettingRow
              label="Show steps before answer"
              description="Always show the reasoning, then the final answer."
            >
              <Toggle
                label="Show steps before answer"
                checked={agent.showStepsFirst}
                onChange={(v) => {
                  update("agent", { showStepsFirst: v });
                  flashSaved();
                }}
              />
            </SettingRow>
          </SettingsCard>

          <SettingsCard eyebrow="Your data" title="Data & privacy" icon={ShieldCheck}>
            <SettingRow
              label="Export my preferences"
              description="Download a JSON copy of all settings."
            >
              <button onClick={handleExport} className="btn-secondary py-2 text-sm">
                <Download className="mr-1.5 inline h-4 w-4" />
                Export
              </button>
            </SettingRow>
            <SettingRow
              label="Reset everything"
              description="Restore all preferences to their defaults."
            >
              <button onClick={handleReset} className="btn-secondary py-2 text-sm">
                <RotateCcw className="mr-1.5 inline h-4 w-4" />
                Reset all
              </button>
            </SettingRow>
            <div className="py-4 text-xs leading-relaxed text-text-muted">
              Preferences are stored locally on this device only. Nothing is sent to
              a server.
            </div>
          </SettingsCard>
        </div>

        <aside className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <div className="flex items-center gap-3">
              <Bot className="h-4 w-4 text-green-900" />
              <p className="eyebrow">Live preview</p>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-surface p-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-green-950"
                style={{ backgroundColor: profile.avatarColor }}
              >
                {(profile.avatarInitials || initialsOf(profile.firstName, profile.lastName)).slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {profile.grade} · {profile.strand}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Theme</span>
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  {appearance.theme === "dark" && <Moon className="h-3.5 w-3.5" />}
                  {appearance.theme === "light" && <Sun className="h-3.5 w-3.5" />}
                  {appearance.theme === "system" && <Monitor className="h-3.5 w-3.5" />}
                  {appearance.theme}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Accent</span>
                <span className="flex items-center gap-2 font-medium text-text-primary">
                  {ACCENTS.find((a) => a.id === appearance.accent)?.label}
                  <span
                    className="h-4 w-4 rounded-full border border-surface-border"
                    style={{
                      backgroundColor:
                        ACCENTS.find((a) => a.id === appearance.accent)?.hex ??
                        "#CFEB89",
                    }}
                  />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Goals</span>
                <span className="font-medium text-text-primary">
                  {learning.dailyGoal}/day · {learning.weeklyGoal}/week
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-surface-border bg-surface p-4">
              <p className="eyebrow mb-2">JEROME will be</p>
              <p className="text-sm leading-relaxed text-text-primary">
                <Sparkles className="mr-1 inline h-3.5 w-3.5 text-green-900" />
                {toneLabel}, giving{" "}
                <span className="font-medium">{agent.depth}</span> explanations as{" "}
                <span className="font-medium">{agent.length}</span> replies in{" "}
                <span className="font-medium">
                  {agent.language === "mixed"
                    ? "Taglish"
                    : agent.language[0].toUpperCase() + agent.language.slice(1)}
                </span>
                {agent.socratic
                  ? ", guiding you with hints before the answer."
                  : ", answering directly."}
              </p>
            </div>

            {hydrated && (
              <button
                onClick={() => {
                  reset();
                }}
                className="btn-ghost mt-4 w-full text-xs"
              >
                Restore defaults
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
