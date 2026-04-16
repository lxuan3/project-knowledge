import fs from "node:fs/promises";
import path from "node:path";

import { parseFrontmatter } from "./frontmatter.mjs";

function extractTitle(body, fallback) {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? fallback;
}

export async function discoverProjectDocument(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  return {
    filePath,
    sourceRelpath: path.basename(filePath),
    project: data.project ?? path.basename(filePath, ".md"),
    projectType: data.project_type ?? "engineering",
    docType: null,
    status: data.status ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    aliases: Array.isArray(data.aliases) ? data.aliases : [],
    updatedAt: data.updated_at ?? null,
    title: extractTitle(body, path.basename(filePath, ".md")),
    body
  };
}
