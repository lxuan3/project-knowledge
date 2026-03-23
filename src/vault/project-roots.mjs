import fs from "node:fs/promises";
import path from "node:path";

async function directoryHasMarkdownFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      return true;
    }
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      if (await directoryHasMarkdownFiles(path.join(dirPath, entry.name))) {
        return true;
      }
    }
  }
  return false;
}

async function existingDirectories(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => path.join(dirPath, entry.name));
  } catch {
    return [];
  }
}

export async function discoverProjectRoots(vaultRoot, projectSpaces = []) {
  const discovered = new Map();
  const collisions = [];
  const excludedRootDirs = new Set(projectSpaces ?? []);

  for (const rootPath of [
    vaultRoot,
    ...(projectSpaces ?? []).map((space) => path.join(vaultRoot, space))
  ]) {
    const candidateDirs = await existingDirectories(rootPath);
    for (const candidate of candidateDirs) {
      if (rootPath === vaultRoot && excludedRootDirs.has(path.basename(candidate))) {
        continue;
      }
      if (!(await directoryHasMarkdownFiles(candidate))) continue;
      const project = path.basename(candidate);
      const existing = discovered.get(project);
      if (existing) {
        collisions.push({ project, kept: existing, ignored: candidate });
        continue;
      }
      discovered.set(project, candidate);
    }
  }

  const projects = [...discovered.entries()]
    .map(([project, projectRoot]) => ({ project, path: projectRoot }))
    .sort((left, right) => left.project.localeCompare(right.project));

  return { projects, collisions };
}
