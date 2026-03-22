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
  assert.match(stdout, /print-agent-guidance/);
});

test("print-agent-guidance outputs standard AGENTS.md snippet", async () => {
  const { stdout } = await execFileAsync("node", [cliEntry, "print-agent-guidance"], {
    cwd: repoRoot
  });

  assert.match(stdout, /### Project Knowledge/);
  assert.match(stdout, /use `project-knowledge` before assuming history/i);
  assert.match(stdout, /Do not assume project history before running either `search` or `context-pack`/);
  assert.match(stdout, /Use `search` for simple, targeted questions/);
  assert.match(stdout, /Use `context-pack` for complex or unfamiliar tasks/);
  assert.match(stdout, /Obsidian markdown is the source of truth/);
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
      lancedbUri: "/tmp/lancedb",
      remoteBaseUrl: null,
      remotePrimaryUrl: null,
      remoteBackupUrl: null
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
  await execFileAsync("node", [cliEntry, "config", "set", "remoteBaseUrl", "http://192.168.0.148:7357"], {
    cwd: repoRoot,
    env
  });
  await execFileAsync("node", [cliEntry, "config", "set", "remotePrimaryUrl", "http://192.168.0.148:7357"], {
    cwd: repoRoot,
    env
  });
  await execFileAsync("node", [cliEntry, "config", "set", "remoteBackupUrl", "http://100.112.159.108:7357"], {
    cwd: repoRoot,
    env
  });

  const { stdout: after } = await execFileAsync("node", [cliEntry, "config", "get"], {
    cwd: repoRoot,
    env
  });
  const parsedAfter = JSON.parse(after);
  assert.equal(parsedAfter.lancedbUri, "/tmp/lancedb-next");
  assert.equal(parsedAfter.remoteBaseUrl, "http://192.168.0.148:7357");
  assert.equal(parsedAfter.remotePrimaryUrl, "http://192.168.0.148:7357");
  assert.equal(parsedAfter.remoteBackupUrl, "http://100.112.159.108:7357");
});

test("search prints a friendly message when indexes have not been built yet", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-missing-index-"));
  const configDir = path.join(homeDir, ".project-knowledge");
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(
    path.join(configDir, "config.json"),
    JSON.stringify({
      vaultRoot: "/tmp/vault",
      indexRoot: path.join(homeDir, "index"),
      retrievalBackend: "json",
      lancedbUri: path.join(homeDir, "lancedb")
    }),
    "utf8"
  );

  const env = {
    ...process.env,
    HOME: homeDir,
    USERPROFILE: homeDir
  };

  await assert.rejects(
    () => execFileAsync("node", [cliEntry, "search", "--project", "openclaw-dashboard", "--query", "skill manager"], {
      cwd: repoRoot,
      env
    }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /Run `project-knowledge index` first\./);
      return true;
    }
  );
});
