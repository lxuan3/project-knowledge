import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import os from "node:os";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliEntry = path.join(repoRoot, "bin", "project-knowledge");

test("CLI help lists core commands", async () => {
  const { stdout } = await execFileAsync("node", [cliEntry, "--help"], {
    cwd: repoRoot
  });

  assert.match(stdout, /write/);
  assert.match(stdout, /index/);
  assert.match(stdout, /list-projects/);
  assert.match(stdout, /search/);
  assert.match(stdout, /config/);
  assert.match(stdout, /serve/);
  assert.match(stdout, /lint/);
});

test("list-projects lists projects from configured vault root", async () => {
  const { stdout } = await execFileAsync("node", [cliEntry, "list-projects"], {
    cwd: repoRoot
  });

  assert.match(stdout, /openclaw-dashboard/);
  assert.match(stdout, /openclaw-feishu-minutes/);
});

test("config get prints effective config and config set updates allowed keys", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-config-"));
  const configDir = path.join(homeDir, ".project-knowledge");
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(
    path.join(configDir, "config.json"),
    JSON.stringify({
      vaultRoot: "/tmp/vault",
      indexRoot: "/tmp/index",
      retrievalBackend: "auto",
      lancedbUri: "/tmp/lancedb"
    }),
    "utf8"
  );

  const env = {
    ...process.env,
    HOME: homeDir,
    USERPROFILE: homeDir
  };

  const { stdout: before } = await execFileAsync("node", [cliEntry, "config", "get"], {
    cwd: repoRoot,
    env
  });
  const parsedBefore = JSON.parse(before);
  assert.equal(parsedBefore.lancedbUri, "/tmp/lancedb");

  await execFileAsync("node", [cliEntry, "config", "set", "lancedbUri", "/tmp/lancedb-next"], {
    cwd: repoRoot,
    env
  });

  const { stdout: after } = await execFileAsync("node", [cliEntry, "config", "get"], {
    cwd: repoRoot,
    env
  });
  const parsedAfter = JSON.parse(after);
  assert.equal(parsedAfter.lancedbUri, "/tmp/lancedb-next");
});
