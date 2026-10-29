"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Mail } from "lucide-react";

const RESEND_COOLDOWN = 60;

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("jerome.verify.email");
    const fromQuery = new URLSearchParams(window.location.search).get("email");
    const resolved = fromQuery || stored || "";
    if (resolved) setEmail(resolved);
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = digits[i] ?? "";
    }
    setOtp(next);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const isComplete = otp.every((d) => d !== "");

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete || submitting) return;

    if (!email) {
      setError("We don't know which account to verify. Start again from sign up.");
      return;
    }

    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setError(payload?.message ?? "We couldn't verify that code.");
        return;
      }

      window.sessionStorage.removeItem("jerome.verify.email");
      router.push("/");
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;

    if (!email) {
      setError("We don't know which account to verify. Start again from sign up.");
      return;
    }

    setError(null);
    setNotice(null);
    setResending(true);

    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setError(payload?.message ?? "We couldn't send a new code.");
        return;
      }

      setOtp(["", "", "", "", "", ""]);
      setCooldown(RESEND_COOLDOWN);
      setNotice("A new code is on its way. Check your inbox.");
      inputRefs.current[0]?.focus();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="card p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400">
              <GraduationCap className="h-6 w-6 text-green-950" />
            </div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-green-950">
              Check your email
            </h2>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-sm text-text-muted">
              We sent a 6-digit code to
              <span className="font-medium text-text-primary">
                {email || "your school email"}
              </span>
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <div className="mb-6 flex justify-center gap-2.5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${index + 1}`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="h-12 w-11 rounded-lg border border-surface-border bg-surface-white text-center font-mono text-lg font-medium text-text-primary transition-all duration-150 focus:border-green-900/40 focus:outline-none focus:ring-2 focus:ring-green-900/20"
                />
              ))}
            </div>

            {error && (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-red-500/30 bg-red-100 px-3.5 py-2.5 text-sm text-red-500"
              >
                {error}
              </p>
            )}
            {notice && (
              <p
                role="status"
                className="mb-4 rounded-lg border border-green-900/20 bg-green-100 px-3.5 py-2.5 text-sm text-green-900"
              >
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={!isComplete || submitting}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Verifying..." : "Verify"}
            </button>
          </form>

          <div className="mt-6 text-center">
            {cooldown > 0 ? (
              <p className="text-sm text-text-muted">
                Resend code in{" "}
                <span className="font-mono font-medium text-text-primary">
                  0:{cooldown.toString().padStart(2, "0")}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-medium text-green-900 transition-colors hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-surface-border pt-5">
            <Mail className="h-4 w-4 shrink-0 text-text-muted" />
            <p className="text-xs leading-relaxed text-text-muted">
              Didn&apos;t receive the code? Check your spam folder or verify
              your email address is correct.
            </p>
          </div>
        </div>

        <a
          href="/signup"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to signup
        </a>
      </div>
    </main>
  );
}
