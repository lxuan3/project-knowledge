import fs from "node:fs/promises";
import path from "node:path";

import { parseFrontmatter } from "./frontmatter.mjs";

async function walkMarkdownFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkMarkdownFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractTitle(body, fallback) {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? fallback;
}

export async function discoverProjectDocuments(projectRoot) {
  const markdownFiles = await walkMarkdownFiles(projectRoot);
  const documents = [];

  for (const filePath of markdownFiles) {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, body } = parseFrontmatter(raw);
    documents.push({
      filePath,
      sourceRelpath: path.relative(projectRoot, filePath),
      project: data.project ?? path.basename(projectRoot),
      docType: data.doc_type ?? null,
      status: data.status ?? null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      aliases: Array.isArray(data.aliases) ? data.aliases : [],
      updatedAt: data.updated_at ?? null,
      title: extractTitle(body, path.basename(filePath, ".md")),
      body
    });
  }

  return documents.sort((left, right) => left.sourceRelpath.localeCompare(right.sourceRelpath));
}
