import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const ALLOWED_CONFIG_KEYS = new Set([
  "vaultRoot",
  "indexRoot",
  "retrievalBackend",
  "lancedbUri",
  "remoteBaseUrl",
  "remotePrimaryUrl",
  "remoteBackupUrl"
]);

function resolveHomeDir(homeDir = null) {
  return homeDir ?? process.env.HOME ?? process.env.USERPROFILE ?? os.homedir();
}

function configPathFor(homeDir = null) {
  return path.join(resolveHomeDir(homeDir), ".project-knowledge", "config.json");
}

async function readExistingConfig(configPath) {
  try {
    const raw = await fs.readFile(configPath, "utf8");
    const data = JSON.parse(raw);
    return typeof data === "object" && data ? data : {};
  } catch {
    return {};
  }
}

export function isAllowedConfigKey(key) {
  return ALLOWED_CONFIG_KEYS.has(key);
}

export async function setConfigValue({ key, value, homeDir = null }) {
  if (!isAllowedConfigKey(key)) {
    throw new Error(`Unsupported config key: ${key}`);
  }

  const configPath = configPathFor(homeDir);
  const current = await readExistingConfig(configPath);
  const next = {
    ...current,
    [key]: value
  };

  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(next, null, 2), "utf8");
  return next;
}
