import fs from "node:fs/promises";
import path from "node:path";

export class MissingIndexError extends Error {
  constructor(filePath) {
    const scopeHint = filePath.includes(`${path.sep}projects${path.sep}`)
      ? ` for project ${JSON.stringify(path.basename(path.dirname(filePath)))}`
      : "";
    super(`Index not found${scopeHint}. Run \`project-knowledge index\` first.`);
    this.name = "MissingIndexError";
    this.code = "MISSING_INDEX";
    this.filePath = filePath;
  }
}

export async function writeChunks(filePath, chunks) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify({ chunks }, null, 2), "utf8");
}

export async function readChunks(filePath) {
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new MissingIndexError(filePath);
    }
    throw error;
  }
  const data = JSON.parse(raw);
  return Array.isArray(data.chunks) ? data.chunks : [];
}
