import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  assert.match(stdout, /lint/);
});

test("list-projects lists projects from configured vault root", async () => {
  const { stdout } = await execFileAsync("node", [cliEntry, "list-projects"], {
    cwd: repoRoot
  });

  assert.match(stdout, /openclaw-dashboard/);
  assert.match(stdout, /openclaw-feishu-minutes/);
});
