"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_PREFERENCES,
  STORAGE_KEY,
  accentById,
  hexToRgbTriplet,
  mergePreferences,
  type Preferences,
} from "@/lib/preferences/types";

interface PreferencesContextValue {
  preferences: Preferences;
  hydrated: boolean;
  update: <K extends keyof Preferences>(
    section: K,
    patch: Partial<Preferences[K]>
  ) => void;
  setAll: (next: Preferences) => void;
  reset: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function applyAppearance(preferences: Preferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const { appearance } = preferences;

  const dark =
    appearance.theme === "dark" ||
    (appearance.theme === "system" && systemPrefersDark());

  root.classList.toggle("dark", dark);
  root.dataset.density = appearance.density;
  root.dataset.font = appearance.fontScale;
  root.dataset.motion = appearance.reduceMotion ? "reduced" : "full";
  root.classList.toggle("high-contrast", appearance.highContrast);

  const accent = accentById(appearance.accent);
  root.style.setProperty("--accent", hexToRgbTriplet(accent.hex));
  root.style.setProperty("--accent-strong", hexToRgbTriplet(accent.strong));
}

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let loaded = DEFAULT_PREFERENCES;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = mergePreferences(JSON.parse(raw));
    } catch {
      loaded = DEFAULT_PREFERENCES;
    }
    setPreferences(loaded);
    setHydrated(true);
    applyAppearance(loaded);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      /* storage unavailable */
    }
    applyAppearance(preferences);
  }, [preferences, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (preferences.appearance.theme === "system") {
        applyAppearance(preferences);
      }
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [preferences]);

  const update = useCallback(
    <K extends keyof Preferences>(section: K, patch: Partial<Preferences[K]>) => {
      setPreferences((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...patch },
      }));
    },
    []
  );

  const setAll = useCallback((next: Preferences) => {
    setPreferences(mergePreferences(next));
  }, []);

  const reset = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ preferences, hydrated, update, setAll, reset }),
    [preferences, hydrated, update, setAll, reset]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}
