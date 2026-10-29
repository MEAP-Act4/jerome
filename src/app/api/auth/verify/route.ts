import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE,
  confirmEmailCode,
  createSessionToken,
  normalizeEmail,
  sessionCookieOptions,
  toPublicUser,
  toSessionUser,
} from "@/lib/auth";
import { rateLimit, requestKey } from "@/lib/rate-limit";

const verifySchema = z.object({
  email: z.string().trim().email().max(254),
  otp: z.string().regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  const limit = rateLimit(requestKey(req, "verify"), 15, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Please try again later." },
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

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Enter the 6-digit code from your email." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(parsed.data.email);

  try {
    const result = await confirmEmailCode(email, parsed.data.otp);
    if (!result.ok) {
      const messages: Record<typeof result.reason, string> = {
        not_found: "We couldn't find an account for that email. Please sign up.",
        already_verified: "That email is already verified. You can sign in.",
        invalid: "That code doesn't match. Check the email and try again.",
        expired: "That code has expired. Request a new one.",
        too_many_attempts:
          "Too many incorrect attempts. Request a new code to continue.",
      };

      const status = result.reason === "not_found" ? 404 : 400;
      return NextResponse.json(
        { success: false, message: messages[result.reason] },
        { status }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: toPublicUser(result.user),
    });
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken(toSessionUser(result.user)),
      sessionCookieOptions()
    );
    return response;
  } catch (error) {
    console.error("[auth] Verification failed", error);
    return NextResponse.json(
      { success: false, message: "We couldn't verify that code right now." },
      { status: 500 }
    );
  }
}
