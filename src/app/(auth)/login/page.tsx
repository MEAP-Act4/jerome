"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        if (payload?.needsVerification && payload?.email) {
          router.push(`/verify?email=${encodeURIComponent(payload.email)}`);
          return;
        }
        setError(payload?.message ?? "We couldn't sign you in. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[46%] overflow-hidden bg-green-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <svg
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] opacity-60"
          viewBox="0 0 560 560"
          fill="none"
        >
          <circle cx="280" cy="280" r="270" stroke="rgba(207,235,137,0.14)" strokeWidth="1" />
          <circle cx="280" cy="280" r="210" stroke="rgba(207,235,137,0.12)" strokeWidth="1" />
          <circle cx="280" cy="280" r="150" stroke="rgba(207,235,137,0.10)" strokeWidth="1" />
          <circle cx="280" cy="280" r="90" stroke="rgba(207,235,137,0.08)" strokeWidth="1" />
        </svg>
        <svg
          className="pointer-events-none absolute -bottom-48 -left-48 h-[480px] w-[480px] opacity-40"
          viewBox="0 0 480 480"
          fill="none"
        >
          <circle cx="240" cy="240" r="230" stroke="rgba(207,235,137,0.12)" strokeWidth="1" />
          <circle cx="240" cy="240" r="170" stroke="rgba(207,235,137,0.10)" strokeWidth="1" />
          <circle cx="240" cy="240" r="110" stroke="rgba(207,235,137,0.08)" strokeWidth="1" />
        </svg>

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-400">
            <GraduationCap className="h-5 w-5 text-green-950" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight text-cream-50">
            JEROME
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="eyebrow mb-5 text-lime-400">
            Your intelligent STEM partner
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-cream-50 xl:text-[44px]">
            Learn with clarity. Grow with confidence.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-cream-50/70">
            JEROME is built for Filipino STEM learners — adapting lessons to
            your pace, tracking mastery across topics, and giving you the
            confidence to excel in every subject.
          </p>
          <blockquote className="mt-8 border-l-2 border-lime-400/60 pl-5">
            <p className="font-serif text-lg italic leading-relaxed text-cream-50/85">
              &ldquo;The expert in anything was once a beginner who refused to
              give up.&rdquo;
            </p>
          </blockquote>
        </div>

        <p className="relative font-mono text-[11px] uppercase tracking-[0.12em] text-cream-50/40">
          Jerome Learning Systems
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="card p-8">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400">
                <GraduationCap className="h-6 w-6 text-green-950" />
              </div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-green-950">
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-text-muted">
                Sign in to continue your learning journey
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@school.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pl-10 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition-colors hover:text-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-surface-border accent-green-900"
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-green-900 transition-colors hover:text-green-800"
                >
                  Forgot password?
                </a>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-100 px-3.5 py-2.5 text-sm text-red-500"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary mt-2 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pt-2">
                <span className="h-px flex-1 bg-surface-border" />
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
                  or
                </span>
                <span className="h-px flex-1 bg-surface-border" />
              </div>

              <button type="button" className="btn-secondary flex w-full items-center justify-center gap-2">
                <GraduationCap className="h-4 w-4" />
                School account
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-text-muted">
            Need help?{" "}
            <a
              href="#"
              className="font-medium text-green-900 transition-colors hover:text-green-800"
            >
              School administrator support
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
