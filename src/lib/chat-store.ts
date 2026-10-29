import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { DATA_DIR, dataFilePath } from "./storage";

const DB_FILE = dataFilePath("chats.json");

const MAX_SESSIONS_PER_USER = 50;
const MAX_MESSAGES_PER_SESSION = 300;
const MAX_TITLE_LENGTH = 70;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_IMAGES_PER_MESSAGE = 3;
const MAX_IMAGE_DATA_URL_LENGTH = 5_500_000;

export type ChatRole = "student" | "jerome";

export interface StoredChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** Data URLs for photos the student attached to this turn. */
  images?: string[];
  createdAt: string;
}

export interface StoredChatSession {
  id: string;
  userId: string;
  title: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredChatMessage[];
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
}

interface ChatDatabase {
  sessions: StoredChatSession[];
}

export const DEFAULT_SESSION_TITLE = "New conversation";
export const PHOTO_SESSION_TITLE = "Photo upload";

let writeQueue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function loadDatabase(): Promise<ChatDatabase> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<ChatDatabase>;
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { sessions: [] };
    }
    throw error;
  }
}

async function saveDatabase(database: ChatDatabase): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const payload = JSON.stringify(database, null, 2);
  const tempFile = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempFile, payload, {
    encoding: "utf8",
    mode: 0o600,
  });

  // On Windows another process (or an indexer/antivirus scan) can briefly hold
  // the destination open, which makes rename fail with EPERM/EBUSY. Retry a
  // few times instead of turning a successful chat into a 500.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await fs.rename(tempFile, DB_FILE);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EPERM" && code !== "EBUSY" && code !== "EACCES") {
        await fs.rm(tempFile, { force: true }).catch(() => undefined);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    }
  }

  await fs.rm(tempFile, { force: true }).catch(() => undefined);
  throw new Error(`Could not save chat database at ${DB_FILE}`);
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

function titleFromMessage(content: string): string {
  const clean = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$?([^$]*)\$\$?/g, " $1 ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}^_#>*`$]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return truncate(clean || DEFAULT_SESSION_TITLE, MAX_TITLE_LENGTH);
}

function summarize(session: StoredChatSession): ChatSessionSummary {
  const last = session.messages[session.messages.length - 1];
  const lastText = last ? last.content.replace(/\s+/g, " ").trim() : "";
  const lastImages = last?.images?.length ?? 0;
  const preview = lastText
    ? truncate(lastText, 90)
    : lastImages > 0
      ? `${lastImages} photo${lastImages === 1 ? "" : "s"} attached`
      : "";

  return {
    id: session.id,
    title: session.title,
    subject: session.subject,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messageCount: session.messages.length,
    preview,
  };
}

export async function listChatSessions(
  userId: string
): Promise<ChatSessionSummary[]> {
  const database = await loadDatabase();
  return database.sessions
    .filter((session) => session.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(summarize);
}

export async function getChatSession(
  userId: string,
  sessionId: string
): Promise<StoredChatSession | null> {
  const database = await loadDatabase();
  return (
    database.sessions.find(
      (session) => session.id === sessionId && session.userId === userId
    ) ?? null
  );
}

export async function createChatSession(
  userId: string,
  subject: string
): Promise<StoredChatSession> {
  return withLock(async () => {
    const database = await loadDatabase();
    const now = new Date().toISOString();

    const session: StoredChatSession = {
      id: randomUUID(),
      userId,
      title: DEFAULT_SESSION_TITLE,
      subject,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    database.sessions.push(session);

    // Keep only the newest sessions for this user.
    const mine = database.sessions
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const overflow = mine.slice(MAX_SESSIONS_PER_USER);
    if (overflow.length > 0) {
      const stale = new Set(overflow.map((entry) => entry.id));
      database.sessions = database.sessions.filter(
        (entry) => !stale.has(entry.id)
      );
    }

    await saveDatabase(database);
    return session;
  });
}

export async function renameChatSession(
  userId: string,
  sessionId: string,
  title: string
): Promise<ChatSessionSummary | null> {
  return withLock(async () => {
    const database = await loadDatabase();
    const session = database.sessions.find(
      (entry) => entry.id === sessionId && entry.userId === userId
    );
    if (!session) return null;

    session.title = truncate(title.trim(), MAX_TITLE_LENGTH) || DEFAULT_SESSION_TITLE;
    session.updatedAt = new Date().toISOString();
    await saveDatabase(database);
    return summarize(session);
  });
}

export async function deleteChatSession(
  userId: string,
  sessionId: string
): Promise<boolean> {
  return withLock(async () => {
    const database = await loadDatabase();
    const before = database.sessions.length;
    database.sessions = database.sessions.filter(
      (entry) => !(entry.id === sessionId && entry.userId === userId)
    );
    if (database.sessions.length === before) return false;

    await saveDatabase(database);
    return true;
  });
}

export async function appendChatMessages(
  userId: string,
  sessionId: string,
  entries: { role: ChatRole; content: string; images?: string[] }[]
): Promise<ChatSessionSummary | null> {
  const cleaned = entries
    .map((entry) => {
      const images = (entry.images ?? [])
        .filter(
          (image) =>
            typeof image === "string" &&
            image.length > 0 &&
            image.length <= MAX_IMAGE_DATA_URL_LENGTH
        )
        .slice(0, MAX_IMAGES_PER_MESSAGE);

      return {
        role: entry.role,
        content: entry.content.trim().slice(0, MAX_MESSAGE_LENGTH),
        images: images.length > 0 ? images : undefined,
      };
    })
    .filter(
      (entry) => entry.content.length > 0 || (entry.images?.length ?? 0) > 0
    );

  if (cleaned.length === 0) return null;

  return withLock(async () => {
    const database = await loadDatabase();
    const session = database.sessions.find(
      (entry) => entry.id === sessionId && entry.userId === userId
    );
    if (!session) return null;

    const now = new Date().toISOString();

    for (const entry of cleaned) {
      session.messages.push({
        id: randomUUID(),
        role: entry.role,
        content: entry.content,
        ...(entry.images ? { images: entry.images } : {}),
        createdAt: now,
      });

      if (entry.role === "student" && entry.content) {
        // An image-only first turn gets a placeholder title; replace it with
        // the first real text the student sends afterwards.
        if (
          session.title === DEFAULT_SESSION_TITLE ||
          session.title === PHOTO_SESSION_TITLE
        ) {
          session.title = titleFromMessage(entry.content);
        }
      } else if (
        entry.role === "student" &&
        session.title === DEFAULT_SESSION_TITLE
      ) {
        session.title = PHOTO_SESSION_TITLE;
      }
    }

    if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
      session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
    }

    session.updatedAt = now;
    await saveDatabase(database);
    return summarize(session);
  });
}
