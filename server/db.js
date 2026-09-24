import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "db.json");

let writeQueue = Promise.resolve();

/** Read the whole database file. */
export async function readDB() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

/**
 * Write the whole database file. Writes are queued so concurrent
 * requests never interleave and corrupt the file.
 */
export function writeDB(data) {
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
  );
  return writeQueue;
}

/** Generate a short, prefixed id, e.g. id("c") -> "c-a1b2c3d4". */
export function id(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
