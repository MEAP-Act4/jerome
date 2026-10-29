"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { createInitialState, liveReducer, remainingMinutes } from "@/lib/live/engine";
import type { LiveState } from "@/lib/live/types";

const BRAIN_INTERVAL_MS = 3000;
const CLOCK_INTERVAL_MS = 1000;

interface LiveContextValue {
  state: LiveState;
  hydrated: boolean;
  remaining: number;
  lastEventAgoSec: number;
  isBusy: boolean;
  recordAnswer: (correct: boolean) => void;
  completeLesson: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  advanceSession: () => void;
  nudge: () => void;
}

const LiveProgressContext = createContext<LiveContextValue | null>(null);

function dateLabelNow() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function LiveProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, rawDispatch] = useReducer(liveReducer, undefined, createInitialState);
  const stateRef = useRef(state);
  const hydratedRef = useRef(false);
  const answerStreakRef = useRef(0);

  stateRef.current = state;

  const recordAnswer = useCallback(
    (correct: boolean) => rawDispatch({ type: "ANSWER", correct, now: Date.now() }),
    []
  );
  const completeLesson = useCallback(
    () => rawDispatch({ type: "COMPLETE_LESSON", now: Date.now() }),
    []
  );
  const pauseSession = useCallback(
    () => rawDispatch({ type: "PAUSE", now: Date.now() }),
    []
  );
  const resumeSession = useCallback(
    () => rawDispatch({ type: "RESUME", now: Date.now() }),
    []
  );
  const advanceSession = useCallback(
    () => rawDispatch({ type: "ADVANCE_SESSION", now: Date.now() }),
    []
  );
  const nudge = useCallback(
    () => rawDispatch({ type: "NUDGE", now: Date.now() }),
    []
  );

  useEffect(() => {
    const now = Date.now();
    rawDispatch({ type: "HYDRATE", now, dateLabel: dateLabelNow() });
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    const clock = window.setInterval(() => {
      rawDispatch({ type: "TICK", now: Date.now() });
    }, CLOCK_INTERVAL_MS);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    const brain = window.setInterval(() => {
      if (!hydratedRef.current) return;
      const s = stateRef.current;

      if (s.session.completed) {
        if (Math.random() < 0.72) {
          rawDispatch({ type: "ADVANCE_SESSION", now: Date.now() });
        }
        return;
      }

      if (s.session.paused) {
        if (Math.random() < 0.55) {
          rawDispatch({ type: "RESUME", now: Date.now() });
        }
        return;
      }

      if (Math.random() < 0.9) {
        const correct = Math.random() < 0.78;
        rawDispatch({ type: "ANSWER", correct, now: Date.now() });
        answerStreakRef.current = correct ? answerStreakRef.current + 1 : 0;
      }

      if (answerStreakRef.current >= 6 && Math.random() < 0.5) {
        answerStreakRef.current = 0;
        rawDispatch({ type: "PAUSE", now: Date.now() });
      }
    }, BRAIN_INTERVAL_MS);
    return () => window.clearInterval(brain);
  }, []);

  const value = useMemo<LiveContextValue>(() => {
    const remaining = remainingMinutes(state.session);
    const lastEventAgoSec =
      state.now > 0 && state.lastUpdated > 0
        ? Math.max(0, Math.round((state.now - state.lastUpdated) / 1000))
        : 0;
    return {
      state,
      hydrated: state.now > 0,
      remaining,
      lastEventAgoSec,
      isBusy: !state.session.paused && !state.session.completed,
      recordAnswer,
      completeLesson,
      pauseSession,
      resumeSession,
      advanceSession,
      nudge,
    };
  }, [
    state,
    recordAnswer,
    completeLesson,
    pauseSession,
    resumeSession,
    advanceSession,
    nudge,
  ]);

  return (
    <LiveProgressContext.Provider value={value}>
      {children}
    </LiveProgressContext.Provider>
  );
}

export function useLiveProgress() {
  const ctx = useContext(LiveProgressContext);
  if (!ctx) {
    throw new Error("useLiveProgress must be used inside LiveProgressProvider");
  }
  return ctx;
}
