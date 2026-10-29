import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createChatSession, listChatSessions } from "@/lib/chat-store";
import { isTutorSubject } from "@/lib/tutor-subjects";

const createSchema = z.object({
  subject: z.string().trim().min(1).max(100),
});

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Please sign in to view your chats." },
      { status: 401 }
    );
  }

  const sessions = await listChatSessions(session.id);
  return NextResponse.json({ success: true, sessions });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Please sign in to start a chat." },
      { status: 401 }
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Pick a subject for this conversation." },
      { status: 400 }
    );
  }

  if (!isTutorSubject(parsed.data.subject)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "That subject isn't available in the tutor yet. Pick one from the subject selector.",
      },
      { status: 400 }
    );
  }

  const created = await createChatSession(session.id, parsed.data.subject);
  return NextResponse.json(
    {
      success: true,
      session: {
        id: created.id,
        title: created.title,
        subject: created.subject,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        messageCount: 0,
        preview: "",
      },
    },
    { status: 201 }
  );
}
