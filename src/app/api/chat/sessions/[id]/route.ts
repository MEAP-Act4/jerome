import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import {
  deleteChatSession,
  getChatSession,
  renameChatSession,
} from "@/lib/chat-store";

const renameSchema = z.object({
  title: z.string().trim().min(1).max(70),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Please sign in to view this chat." },
      { status: 401 }
    );
  }

  const chat = await getChatSession(session.id, params.id);
  if (!chat) {
    return NextResponse.json(
      { success: false, message: "That conversation no longer exists." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    session: {
      id: chat.id,
      title: chat.title,
      subject: chat.subject,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        ...(message.images && message.images.length > 0
          ? { images: message.images }
          : {}),
        createdAt: message.createdAt,
      })),
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Please sign in to rename this chat." },
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

  const parsed = renameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Keep titles between 1 and 70 characters." },
      { status: 400 }
    );
  }

  const updated = await renameChatSession(
    session.id,
    params.id,
    parsed.data.title
  );
  if (!updated) {
    return NextResponse.json(
      { success: false, message: "That conversation no longer exists." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, session: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Please sign in to delete this chat." },
      { status: 401 }
    );
  }

  const removed = await deleteChatSession(session.id, params.id);
  if (!removed) {
    return NextResponse.json(
      { success: false, message: "That conversation no longer exists." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
