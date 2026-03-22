import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { loadConfig, resolveProjectRoot } from "../src/config/load.mjs";

test("loadConfig returns default Obsidian and local index roots when config file is missing", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-config-"));
  const config = await loadConfig({ homeDir });

  assert.equal(config.vaultRoot, path.join(homeDir, "obsidian", "Openclaw"));
  assert.equal(config.indexRoot, path.join(homeDir, ".project-knowledge", "index"));
  assert.equal(config.retrievalBackend, "auto");
  assert.equal(config.lancedbUri, path.join(homeDir, ".project-knowledge", "lancedb"));
});

test("loadConfig merges values from ~/.project-knowledge/config.json", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-config-file-"));
  const configDir = path.join(homeDir, ".project-knowledge");
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(
    path.join(configDir, "config.json"),
    JSON.stringify({
      vaultRoot: "/tmp/custom-vault",
      indexRoot: "/tmp/custom-index",
      retrievalBackend: "lancedb",
      lancedbUri: "/tmp/custom-lancedb"
    }),
    "utf8"
  );

  const config = await loadConfig({ homeDir });
  assert.equal(config.vaultRoot, "/tmp/custom-vault");
  assert.equal(config.indexRoot, "/tmp/custom-index");
  assert.equal(config.retrievalBackend, "lancedb");
  assert.equal(config.lancedbUri, "/tmp/custom-lancedb");
});

test("resolveProjectRoot uses explicit path or derives it from project name", async () => {
  const config = {
    vaultRoot: path.join("C:", "Users", "tester", "obsidian", "Openclaw"),
    indexRoot: path.join("C:", "Users", "tester", ".project-knowledge", "index")
  };

  assert.equal(
    resolveProjectRoot({ config, project: "openclaw-dashboard" }),
    path.join(config.vaultRoot, "openclaw-dashboard")
  );
  assert.equal(
    resolveProjectRoot({ config, projectRoot: path.join("D:", "tmp", "project-root"), project: "openclaw-dashboard" }),
    path.join("D:", "tmp", "project-root")
  );
});
