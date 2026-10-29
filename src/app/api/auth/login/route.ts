import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE,
  authenticateDevUser,
  authenticateUser,
  createSessionToken,
  normalizeEmail,
  sessionCookieOptions,
  toPublicUser,
  toSessionUser,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Enter a valid email and password." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const limit = rateLimit(`login:${email}`, 10, 5 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many sign-in attempts. Please try again in a few minutes.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  try {
    const devUser = await authenticateDevUser(email, parsed.data.password);
    const result = devUser
      ? ({ ok: true as const, user: devUser })
      : await authenticateUser(email, parsed.data.password);
    if (!result.ok) {
      if (result.reason === "unverified") {
        return NextResponse.json(
          {
            success: false,
            needsVerification: true,
            email,
            message:
              "Verify your email first. We can send you a new code if needed.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Incorrect email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: toPublicUser(result.user),
    });
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken(toSessionUser(result.user)),
      sessionCookieOptions()
    );
    return response;
  } catch (error) {
    console.error("[auth] Login failed", error);
    return NextResponse.json(
      { success: false, message: "We couldn't sign you in right now." },
      { status: 500 }
    );
  }
}
