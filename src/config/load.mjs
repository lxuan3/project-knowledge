import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function defaultConfig(homeDir) {
  return {
    vaultRoot: path.join(homeDir, "obsidian", "Openclaw"),
    indexRoot: path.join(homeDir, ".project-knowledge", "index"),
    retrievalBackend: "auto",
    lancedbUri: path.join(homeDir, ".project-knowledge", "lancedb"),
    remoteBaseUrl: null,
    remotePrimaryUrl: null,
    remoteBackupUrl: null
  };
}

export async function loadConfig({ homeDir = process.env.HOME ?? process.env.USERPROFILE ?? os.homedir() } = {}) {
  const defaults = defaultConfig(homeDir);
  const configPath = path.join(homeDir, ".project-knowledge", "config.json");

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
  return path.join(config.vaultRoot, project);
}
