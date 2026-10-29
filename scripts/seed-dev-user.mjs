import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.JEROME_DATA_DIR ?? path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "auth.json");

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL ?? "admin@jerome.test").toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "JeromeAdmin123!";
const DEV_EMAIL = "dev@jerome.local";
const DEV_PASSWORD = process.env.DEV_LOGIN_PASSWORD ?? "JeromeDev123!";

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

async function loadDatabase() {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      otps: Array.isArray(parsed.otps) ? parsed.otps : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") return { users: [], otps: [] };
    throw error;
  }
}

function upsertUser(users, { email, password, firstName, lastName }) {
  const existing = users.find((user) => user.email === email);
  if (existing) {
    existing.passwordHash = hashPassword(password);
    existing.verified = true;
    return "updated";
  }

  users.push({
    id: randomUUID(),
    email,
    passwordHash: hashPassword(password),
    firstName,
    lastName,
    grade: "Grade 10",
    strand: "STEM",
    verified: true,
    createdAt: new Date().toISOString(),
  });
  return "created";
}

const database = await loadDatabase();

const adminStatus = upsertUser(database.users, {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  firstName: "Admin",
  lastName: "User",
});

const devStatus = upsertUser(database.users, {
  email: DEV_EMAIL,
  password: DEV_PASSWORD,
  firstName: "Dev",
  lastName: "User",
});

await fs.mkdir(DATA_DIR, { recursive: true });
await fs.writeFile(DB_FILE, JSON.stringify(database, null, 2), {
  encoding: "utf8",
  mode: 0o600,
});

console.log(`Seeded users in ${DB_FILE}`);
console.log(`  admin  ${adminStatus.padEnd(8)} ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
console.log(`  dev    ${devStatus.padEnd(8)} ${DEV_EMAIL} / ${DEV_PASSWORD}`);
