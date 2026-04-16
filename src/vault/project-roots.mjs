import fs from "node:fs/promises";
import path from "node:path";

async function markdownFilesInDir(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("."))
      .map((entry) => path.join(dirPath, entry.name));
  } catch {
    return [];
  }
}

export async function discoverProjectRoots(vaultRoot, projectSpaces = []) {
  const discovered = new Map();
  const collisions = [];

  const searchDirs = [
    vaultRoot,
    ...(projectSpaces ?? []).map((space) => path.join(vaultRoot, space))
  ];

  for (const dir of searchDirs) {
    const files = await markdownFilesInDir(dir);
    for (const filePath of files) {
      const project = path.basename(filePath, ".md");
      const existing = discovered.get(project);
      if (existing) {
        collisions.push({ project, kept: existing, ignored: filePath });
        continue;
      }
      discovered.set(project, filePath);
    }
  }

  const projects = [...discovered.entries()]
    .map(([project, filePath]) => ({ project, filePath }))
    .sort((a, b) => a.project.localeCompare(b.project));

  return { projects, collisions };
}
