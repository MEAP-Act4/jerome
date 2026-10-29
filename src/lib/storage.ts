import path from "node:path";

/**
 * Directory for the app's local JSON stores (auth users, chat sessions).
 * Override with JEROME_DATA_DIR. On Vercel the filesystem is read-only apart
 * from /tmp, so fall back there.
 */
export const DATA_DIR =
  process.env.JEROME_DATA_DIR ??
  (process.env.VERCEL
    ? path.join("/tmp", "jerome")
    : path.join(process.cwd(), ".data"));

export function dataFilePath(fileName: string): string {
  return path.join(DATA_DIR, fileName);
}
