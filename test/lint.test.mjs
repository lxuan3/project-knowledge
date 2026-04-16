import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { lintProject } from "../src/lint/lint.mjs";
import { writeProjectNote } from "../src/commands/write.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function writeTmpProjectFile(content) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pk-lint-"));
  const filePath = path.join(dir, "openclaw-dashboard.md");
  await fs.writeFile(filePath, content, "utf8");
  return filePath;
}

test("lintProject accepts a valid single-file project", async () => {
  const filePath = await writeTmpProjectFile([
    "---",
    "project: openclaw-dashboard",
    "project_type: engineering",
    "status: active",
    "---",
    "",
    "# Openclaw Dashboard",
    "",
    "## Architecture",
    "",
    "Uses Node.js."
  ].join("\n"));

  const result = await lintProject(filePath);
  assert.equal(result.ok, true, result.errors.join(", "));
});

test("lintProject reports missing project field", async () => {
  const filePath = await writeTmpProjectFile([
    "---",
    "project_type: engineering",
    "status: active",
    "---",
    "",
    "# X"
  ].join("\n"));

  const result = await lintProject(filePath);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("project")));
});

test("lintProject reports missing status field", async () => {
  const filePath = await writeTmpProjectFile([
    "---",
    "project: openclaw-dashboard",
    "project_type: engineering",
    "---",
    "",
    "# X"
  ].join("\n"));

  const result = await lintProject(filePath);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("status")));
});

test("lintProject reports unsupported project_type", async () => {
  const filePath = await writeTmpProjectFile([
    "---",
    "project: openclaw-dashboard",
    "project_type: invalid-type",
    "status: active",
    "---",
    "",
    "# X"
  ].join("\n"));

  const result = await lintProject(filePath);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("project_type")));
});

test("writeProjectNote creates a project file and lintProject accepts it", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pk-write-lint-"));
  const vaultRoot = dir;

  const createdPath = await writeProjectNote({
    repoRoot,
    vaultRoot,
    project: "openclaw-dashboard",
    projectType: "engineering"
  });

  const content = await fs.readFile(createdPath, "utf8");
  assert.match(content, /project: openclaw-dashboard/);
  assert.match(content, /project_type: engineering/);

  const lintResult = await lintProject(createdPath);
  assert.equal(lintResult.ok, true, lintResult.errors.join(", "));
});
