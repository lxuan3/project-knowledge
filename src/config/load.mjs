import fs from "node:fs/promises";
import syncFs from "node:fs";
import os from "node:os";
import path from "node:path";

export function resolveHomeDir(homeDir = process.env.HOME ?? process.env.USERPROFILE ?? os.homedir()) {
  return homeDir;
}

export function resolveConfigPath(homeDir = resolveHomeDir()) {
  return path.join(homeDir, ".project-knowledge", "config.json");
}

function defaultConfig(homeDir) {
  return {
    vaultRoot: path.join(homeDir, "obsidian", "Openclaw"),
    projectSpaces: [],
    indexRoot: path.join(homeDir, ".project-knowledge", "index"),
    retrievalBackend: "auto",
    lancedbUri: path.join(homeDir, ".project-knowledge", "lancedb"),
    remoteBaseUrl: null,
    remotePrimaryUrl: null,
    remoteBackupUrl: null
  };
}

export async function loadConfig({ homeDir = resolveHomeDir() } = {}) {
  const defaults = defaultConfig(homeDir);
  const configPath = resolveConfigPath(homeDir);

  try {
    const raw = await fs.readFile(configPath, "utf8");
    const userConfig = JSON.parse(raw);
    return {
      ...defaults,
      ...userConfig
    };
  } catch {
    return defaults;
  }
}

export function resolveProjectRoot({ config, projectRoot = null, project = null }) {
  if (projectRoot) return projectRoot;
  if (!project) return null;

  const rootPath = path.join(config.vaultRoot, project);
  if (syncFs.existsSync(rootPath)) return rootPath;

  for (const space of config.projectSpaces ?? []) {
    const nestedPath = path.join(config.vaultRoot, space, project);
    if (syncFs.existsSync(nestedPath)) return nestedPath;
  }

  return rootPath;
}

export function resolveProjectFile({ config, project }) {
  return path.join(config.vaultRoot, `${project}.md`);
}
