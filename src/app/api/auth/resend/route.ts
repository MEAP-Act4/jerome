import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeEmail, startEmailVerification } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/mailer";
import { rateLimit, requestKey } from "@/lib/rate-limit";

const resendSchema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(req: NextRequest) {
  const limit = rateLimit(requestKey(req, "resend"), 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many requests. Please wait before trying again.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 }
    );
  }

  const parsed = resendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(parsed.data.email);

  try {
    const issued = await startEmailVerification(email);
    if (!issued.ok) {
      if (issued.reason === "cooldown") {
        return NextResponse.json(
          {
            success: false,
            message: "Please wait a minute before requesting another code.",
          },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
      if (issued.reason === "already_verified") {
        return NextResponse.json(
          { success: false, message: "That email is already verified. Sign in instead." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: "We couldn't find an account for that email." },
        { status: 404 }
      );
    }

    const sent = await sendVerificationCode(email, issued.code);
    if (!sent) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            success: false,
            message: "We couldn't send the email right now. Please try again later.",
          },
          { status: 503 }
        );
      }
      console.info(
        `[auth] Email delivery unavailable. Verification code for ${email}: ${issued.code}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "A new verification code is on its way.",
    });
  } catch (error) {
    console.error("[auth] Resend failed", error);
    return NextResponse.json(
      { success: false, message: "We couldn't send a new code right now." },
      { status: 500 }
    );
  }
}
