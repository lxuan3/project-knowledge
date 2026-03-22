import fs from "node:fs/promises";
import path from "node:path";

async function directoryHasMarkdownFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      return true;
    }
  }
  return false;
}

export async function listProjects(vaultRoot) {
  const entries = await fs.readdir(vaultRoot, { withFileTypes: true });
  const projects = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const fullPath = path.join(vaultRoot, entry.name);
    if (await directoryHasMarkdownFiles(fullPath)) {
      projects.push({
        project: entry.name,
        path: fullPath
      });
    }
  }

  return projects.sort((left, right) => left.project.localeCompare(right.project));
}
