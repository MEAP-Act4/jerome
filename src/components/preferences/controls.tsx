"use client";

import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SettingRow({
  label,
  description,
  children,
  htmlFor,
}: {
  label: string;
  description?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-surface-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0 sm:min-w-[210px] sm:text-right">{children}</div>
    </div>
  );
}

export interface Option<T extends string> {
  value: T;
  label: string;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
}) {
  return (
    <div
      role="group"
      className="inline-flex flex-wrap gap-1 rounded-lg border border-surface-border bg-surface p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
              active
                ? "bg-accent text-green-950 shadow-card"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 ${
        checked ? "bg-green-900" : "bg-text-primary/15"
      }`}
    >
      <span
        className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-green-900" strokeWidth={3} />}
      </span>
    </button>
  );
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 60,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-surface-border">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease"
        className="h-9 w-9 text-lg text-text-muted transition-colors hover:bg-text-primary/5 hover:text-text-primary"
      >
        −
      </button>
      <span className="w-16 text-center font-mono text-sm font-medium text-text-primary">
        {value}
        {suffix ? ` ${suffix}` : ""}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase"
        className="h-9 w-9 text-lg text-text-muted transition-colors hover:bg-text-primary/5 hover:text-text-primary"
      >
        +
      </button>
    </div>
  );
}

export function SettingsCard({
  title,
  eyebrow,
  icon: Icon,
  children,
}: {
  title: string;
  eyebrow: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-surface-border px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
          <Icon className="h-[18px] w-[18px] text-green-900" />
        </div>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="font-serif text-lg font-semibold text-green-950">
            {title}
          </h2>
        </div>
      </div>
      <div className="px-6 py-2">{children}</div>
    </section>
  );
}
