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
      "project_type: engineering",
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
  assert.match(content, /project_type: engineering/);
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
  assert.match(content, /project_type: engineering/);
});

test("writeProjectNote supports knowledge and content doc types with project_type", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-write-types-"));

  const knowledgeRoot = path.join(root, "brand-strategy");
  await fs.mkdir(knowledgeRoot, { recursive: true });
  const hypothesisPath = await writeProjectNote({
    repoRoot,
    projectRoot: knowledgeRoot,
    project: "brand-strategy",
    projectType: "knowledge",
    docType: "hypothesis",
    title: "Core Assumption"
  });

  assert.equal(path.relative(knowledgeRoot, hypothesisPath), path.join("02-hypotheses", "core-assumption.md"));
  const hypothesisContent = await fs.readFile(hypothesisPath, "utf8");
  assert.match(hypothesisContent, /project_type: knowledge/);
  assert.match(hypothesisContent, /doc_type: hypothesis/);

  const contentRoot = path.join(root, "content-studio");
  await fs.mkdir(contentRoot, { recursive: true });
  const topicPath = await writeProjectNote({
    repoRoot,
    projectRoot: contentRoot,
    project: "content-studio",
    projectType: "content",
    docType: "topic",
    title: "Episode Angle"
  });

  assert.equal(path.relative(contentRoot, topicPath), path.join("02-topics", "episode-angle.md"));
  const topicContent = await fs.readFile(topicPath, "utf8");
  assert.match(topicContent, /project_type: content/);
  assert.match(topicContent, /doc_type: topic/);
});

test("lintProject accepts valid knowledge and content project types and rejects invalid ones", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-lint-types-"));

  const knowledgeRoot = path.join(root, "brand-strategy");
  await writeFile(
    path.join(knowledgeRoot, "00-overview.md"),
    [
      "---",
      "project: brand-strategy",
      "project_type: knowledge",
      "doc_type: overview",
      "status: active",
      "---",
      "",
      "# Overview"
    ].join("\n")
  );

  const validResult = await lintProject(knowledgeRoot);
  assert.equal(validResult.ok, true);

  const invalidRoot = path.join(root, "bad-project");
  await writeFile(
    path.join(invalidRoot, "00-overview.md"),
    [
      "---",
      "project: bad-project",
      "project_type: weird",
      "doc_type: overview",
      "status: active",
      "---",
      "",
      "# Overview"
    ].join("\n")
  );

  const invalidResult = await lintProject(invalidRoot);
  assert.equal(invalidResult.ok, false);
  assert.match(invalidResult.errors[0], /project_type/);
});
