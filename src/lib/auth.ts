import {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promises as fs } from "node:fs";
import { promisify } from "node:util";
import { DATA_DIR, dataFilePath } from "./storage";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

export const SESSION_COOKIE = "jerome_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MIN_SECRET_LENGTH = 16;

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  grade: string;
  strand: string;
  verified: boolean;
  createdAt: string;
}

export type PublicUser = Omit<StoredUser, "passwordHash" | "verified">;

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  grade: string;
  strand: string;
  exp: number;
}

interface OtpRecord {
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

interface Database {
  users: StoredUser[];
  otps: OtpRecord[];
}

const DB_FILE = dataFilePath("auth.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function loadDatabase(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      otps: Array.isArray(parsed.otps) ? parsed.otps : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { users: [], otps: [] };
    }
    throw error;
  }
}

async function saveDatabase(database: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(database, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
  await fs.rename(tempFile, DB_FILE);
}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters`
    );
  }
  return secret;
}

function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sign(value: string): string {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

function hashOtp(email: string, code: string): string {
  return createHmac("sha256", authSecret())
    .update(`${email}:${code}`)
    .digest("base64url");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    grade: user.grade,
    strand: user.strand,
    createdAt: user.createdAt,
  };
}

export function toSessionUser(
  user: StoredUser | PublicUser
): Omit<SessionUser, "exp"> {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    grade: user.grade,
    strand: user.strand,
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [scheme, saltPart, hashPart] = storedHash.split("$");
  if (scheme !== "scrypt" || !saltPart || !hashPart) return false;

  const expected = Buffer.from(hashPart, "base64url");
  if (expected.length === 0) return false;

  const derived = await scrypt(
    password,
    Buffer.from(saltPart, "base64url"),
    expected.length
  );
  return (
    derived.length === expected.length && timingSafeEqual(derived, expected)
  );
}

export async function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  grade: string;
  strand: string;
}): Promise<{ ok: true; user: StoredUser } | { ok: false; reason: "exists" }> {
  return withLock(async () => {
    const database = await loadDatabase();
    const email = normalizeEmail(input.email);

    if (database.users.some((user) => user.email === email)) {
      return { ok: false, reason: "exists" };
    }

    const user: StoredUser = {
      id: randomUUID(),
      email,
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      grade: input.grade.trim(),
      strand: input.strand.trim(),
      verified: false,
      createdAt: new Date().toISOString(),
    };

    database.users.push(user);
    await saveDatabase(database);
    return { ok: true, user };
  });
}

export async function startEmailVerification(emailInput: string): Promise<
  | { ok: true; code: string }
  | { ok: false; reason: "not_found" | "already_verified" | "cooldown" }
> {
  return withLock(async () => {
    const database = await loadDatabase();
    const email = normalizeEmail(emailInput);
    const user = database.users.find((entry) => entry.email === email);

    if (!user) return { ok: false, reason: "not_found" };
    if (user.verified) return { ok: false, reason: "already_verified" };

    const now = Date.now();
    const existing = database.otps.find((otp) => otp.email === email);
    if (existing && now - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
      return { ok: false, reason: "cooldown" };
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const record: OtpRecord = {
      email,
      codeHash: hashOtp(email, code),
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      lastSentAt: now,
    };

    database.otps = database.otps.filter((otp) => otp.email !== email);
    database.otps.push(record);
    await saveDatabase(database);

    return { ok: true, code };
  });
}

export async function confirmEmailCode(
  emailInput: string,
  code: string
): Promise<
  | { ok: true; user: StoredUser }
  | {
      ok: false;
      reason:
        | "not_found"
        | "already_verified"
        | "invalid"
        | "expired"
        | "too_many_attempts";
    }
> {
  return withLock(async () => {
    const database = await loadDatabase();
    const email = normalizeEmail(emailInput);
    const user = database.users.find((entry) => entry.email === email);

    if (!user) return { ok: false, reason: "not_found" };
    if (user.verified) return { ok: false, reason: "already_verified" };

    const record = database.otps.find((otp) => otp.email === email);
    if (!record) return { ok: false, reason: "invalid" };
    if (record.expiresAt < Date.now()) {
      database.otps = database.otps.filter((otp) => otp.email !== email);
      await saveDatabase(database);
      return { ok: false, reason: "expired" };
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return { ok: false, reason: "too_many_attempts" };
    }

    if (!constantTimeEqual(record.codeHash, hashOtp(email, code))) {
      record.attempts += 1;
      await saveDatabase(database);
      return { ok: false, reason: "invalid" };
    }

    user.verified = true;
    database.otps = database.otps.filter((otp) => otp.email !== email);
    await saveDatabase(database);
    return { ok: true, user };
  });
}

export async function authenticateUser(
  emailInput: string,
  password: string
): Promise<
  | { ok: true; user: StoredUser }
  | { ok: false; reason: "invalid" | "unverified" }
> {
  const database = await loadDatabase();
  const email = normalizeEmail(emailInput);
  const user = database.users.find((entry) => entry.email === email);

  if (!user) return { ok: false, reason: "invalid" };
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, reason: "invalid" };
  }
  if (!user.verified) return { ok: false, reason: "unverified" };

  return { ok: true, user };
}

export interface DevLoginConfig {
  email: string;
  password: string;
}

export function devLoginConfig(): DevLoginConfig | null {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.ALLOW_DEV_LOGIN === "false") return null;

  return {
    email: normalizeEmail(process.env.DEV_LOGIN_EMAIL ?? "dev@jerome.local"),
    password: process.env.DEV_LOGIN_PASSWORD ?? "JeromeDev123!",
  };
}

export async function authenticateDevUser(
  emailInput: string,
  password: string
): Promise<StoredUser | null> {
  const config = devLoginConfig();
  if (!config) return null;
  if (normalizeEmail(emailInput) !== config.email) return null;
  if (!constantTimeEqual(password, config.password)) return null;

  return withLock(async () => {
    const database = await loadDatabase();
    const email = config.email;
    const existing = database.users.find((user) => user.email === email);

    if (existing) {
      if (!existing.verified) {
        existing.verified = true;
        await saveDatabase(database);
      }
      return existing;
    }

    const user: StoredUser = {
      id: randomUUID(),
      email,
      passwordHash: await hashPassword(password),
      firstName: "Dev",
      lastName: "User",
      grade: "Grade 10",
      strand: "STEM",
      verified: true,
      createdAt: new Date().toISOString(),
    };

    database.users.push(user);
    await saveDatabase(database);
    return user;
  });
}

export function createSessionToken(user: Omit<SessionUser, "exp">): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      grade: user.grade,
      strand: user.strand,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token?: string | null): SessionUser | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!constantTimeEqual(signature, sign(payload))) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<SessionUser> & { sub?: string };

    if (!data.sub || typeof data.exp !== "number") return null;
    if (data.exp * 1000 <= Date.now()) return null;

    return {
      id: data.sub,
      email: data.email ?? "",
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      grade: data.grade ?? "",
      strand: data.strand ?? "",
      exp: data.exp,
    };
  } catch {
    return null;
  }
}

export function getSession(request: {
  cookies: { get(name: string): { value: string } | undefined };
}): SessionUser | null {
  return readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
