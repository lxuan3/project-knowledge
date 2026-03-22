import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { lintProject } from "../src/lint/lint.mjs";
import { writeProjectNote } from "../src/commands/write.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

test("lintProject reports missing required frontmatter fields", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-lint-"));
  const projectRoot = path.join(root, "openclaw-dashboard");

  await writeFile(
    path.join(projectRoot, "00-overview.md"),
    [
      "---",
      "project: openclaw-dashboard",
      "status: active",
      "---",
      "",
      "# Overview"
    ].join("\n")
  );

  const result = await lintProject(projectRoot);
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /doc_type/);
});

test("writeProjectNote creates a note from template and lintProject accepts it", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-write-"));
  const projectRoot = path.join(root, "openclaw-dashboard");

  await fs.mkdir(projectRoot, { recursive: true });
  const createdPath = await writeProjectNote({
    repoRoot,
    projectRoot,
    project: "openclaw-dashboard",
    docType: "decision",
    slug: "skill-manager"
  });

  const content = await fs.readFile(createdPath, "utf8");
  assert.match(content, /project: openclaw-dashboard/);
  assert.match(content, /doc_type: decision/);

  const lintResult = await lintProject(projectRoot);
  assert.equal(lintResult.ok, true);
});

test("writeProjectNote derives slug from title when slug is omitted", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-write-title-"));
  const projectRoot = path.join(root, "openclaw-dashboard");

  await fs.mkdir(projectRoot, { recursive: true });
  const createdPath = await writeProjectNote({
    repoRoot,
    projectRoot,
    project: "openclaw-dashboard",
    docType: "decision",
    title: "Skill Manager Repo First"
  });

  assert.equal(path.basename(createdPath), "skill-manager-repo-first.md");
  const content = await fs.readFile(createdPath, "utf8");
  assert.match(content, /doc_type: decision/);
});
