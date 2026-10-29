"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, GraduationCap } from "lucide-react";

const gradeLevels = ["Grade 11", "Grade 12"];

const strands = [
  "STEM",
  "ABM",
  "HUMSS",
  "GAS",
  "ICT",
  "IA",
  "HE",
];

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [strand, setStrand] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Your passwords don't match yet.");
      return;
    }
    if (!gradeLevel || !strand) {
      setError("Choose your grade level and strand to continue.");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          grade: gradeLevel,
          strand,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setError(
          payload?.message ?? "We couldn't create your account. Please try again."
        );
        return;
      }

      window.sessionStorage.setItem(
        "jerome.verify.email",
        payload.email ?? email
      );
      router.push(`/verify?email=${encodeURIComponent(payload.email ?? email)}`);
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
        <div className="w-full max-w-[440px]">
          <div className="card p-8">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400">
                <GraduationCap className="h-6 w-6 text-green-950" />
              </div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-green-950">
                Create your account
              </h2>
              <p className="mt-1.5 text-sm text-text-muted">
                Start your STEM learning journey with JEROME
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    First name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Maria"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    Last name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Santos"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="signup-email"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="gradeLevel"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    Grade level
                  </label>
                  <select
                    id="gradeLevel"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    required
                    className="input-field appearance-none"
                  >
                    <option value="">Select grade</option>
                    {gradeLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="strand"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    Strand
                  </label>
                  <select
                    id="strand"
                    value={strand}
                    onChange={(e) => setStrand(e.target.value)}
                    required
                    className="input-field appearance-none"
                  >
                    <option value="">Select strand</option>
                    {strands.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-surface-border accent-green-900"
                />
                <span>
                  I agree to the{" "}
                  <a href="#" className="font-medium text-green-900 hover:text-green-800">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-medium text-green-900 hover:text-green-800">
                    Privacy Policy
                  </a>
                </span>
              </label>

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
                {submitting ? "Creating account..." : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-green-900 transition-colors hover:text-green-800"
            >
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
