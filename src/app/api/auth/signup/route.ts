import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, normalizeEmail, startEmailVerification } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/mailer";
import { rateLimit, requestKey } from "@/lib/rate-limit";

const signupSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(200),
  grade: z.string().trim().min(1).max(30),
  strand: z.string().trim().min(1).max(30),
});

export async function POST(req: NextRequest) {
  const limit = rateLimit(requestKey(req, "signup"), 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many sign-up attempts. Please try again later.",
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

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Please check your details. Passwords need at least 8 characters.",
      },
      { status: 400 }
    );
  }

  const email = normalizeEmail(parsed.data.email);

  try {
    const created = await createUser({ ...parsed.data, email });
    if (!created.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const issued = await startEmailVerification(email);
    if (!issued.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "We couldn't start verification. Please try again.",
        },
        { status: 500 }
      );
    }

    const sent = await sendVerificationCode(email, issued.code);
    if (!sent) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your account was created, but we couldn't send the verification email. Please try resending the code later.",
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
      message: "Account created. Check your email for the verification code.",
      email,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("[auth] Signup failed", error);
    return NextResponse.json(
      { success: false, message: "We couldn't create your account right now." },
      { status: 500 }
    );
  }
}
