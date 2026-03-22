import fs from "node:fs/promises";
import path from "node:path";

export async function writeChunks(filePath, chunks) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify({ chunks }, null, 2), "utf8");
}

export async function readChunks(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw);
  return Array.isArray(data.chunks) ? data.chunks : [];
}
