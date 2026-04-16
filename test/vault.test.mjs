import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { discoverProjectDocument } from "../src/vault/discover.mjs";
import { discoverProjectRoots } from "../src/vault/project-roots.mjs";
import { chunkMarkdownDocument } from "../src/vault/chunk.mjs";

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

test("discoverProjectRoots finds .md files in vault root", async () => {
  const vaultRoot = await fs.mkdtemp(path.join(os.tmpdir(), "pk-roots-"));
  await fs.writeFile(path.join(vaultRoot, "openclaw-dashboard.md"), "---\nproject: openclaw-dashboard\n---\n# X\n", "utf8");
  await fs.writeFile(path.join(vaultRoot, "brand-strategy.md"), "---\nproject: brand-strategy\n---\n# Y\n", "utf8");

  const { projects, collisions } = await discoverProjectRoots(vaultRoot);
  assert.equal(projects.length, 2);
  assert.equal(collisions.length, 0);
  assert.ok(projects.some((p) => p.project === "openclaw-dashboard"));
  assert.ok(projects.some((p) => p.project === "brand-strategy"));
  assert.ok(projects.every((p) => p.filePath.endsWith(".md")));
});

test("discoverProjectRoots finds .md files in project spaces", async () => {
  const vaultRoot = await fs.mkdtemp(path.join(os.tmpdir(), "pk-roots-spaces-"));
  const spacePath = path.join(vaultRoot, "Openclaw");
  await fs.mkdir(spacePath, { recursive: true });
  await fs.writeFile(path.join(vaultRoot, "alpha.md"), "---\nproject: alpha\n---\n# Alpha\n", "utf8");
  await fs.writeFile(path.join(spacePath, "beta.md"), "---\nproject: beta\n---\n# Beta\n", "utf8");

  const { projects } = await discoverProjectRoots(vaultRoot, ["Openclaw"]);
  assert.ok(projects.some((p) => p.project === "alpha"));
  assert.ok(projects.some((p) => p.project === "beta"));
});

test("discoverProjectDocument reads a single project file", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pk-discover-"));
  const filePath = path.join(dir, "openclaw-dashboard.md");
  await fs.writeFile(filePath, [
    "---",
    "project: openclaw-dashboard",
    "project_type: engineering",
    "status: active",
    "---",
    "",
    "# Openclaw Dashboard",
    "",
    "What this project does.",
    "",
    "## Architecture",
    "",
    "It uses Node.js.",
    "",
    "## Decisions",
    "",
    "### 2026-04-15: Use LanceDB",
    "",
    "**Decision:** Use LanceDB for local indexing."
  ].join("\n"), "utf8");

  const document = await discoverProjectDocument(filePath);
  assert.equal(document.project, "openclaw-dashboard");
  assert.equal(document.projectType, "engineering");
  assert.equal(document.docType, null);
  assert.equal(document.title, "Openclaw Dashboard");
  assert.ok(document.body.includes("## Architecture"));
});

test("chunkMarkdownDocument derives doc_type from section headings", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pk-chunk-"));
  const filePath = path.join(dir, "openclaw-dashboard.md");
  await fs.writeFile(filePath, [
    "---",
    "project: openclaw-dashboard",
    "project_type: engineering",
    "status: active",
    "---",
    "",
    "# Openclaw Dashboard",
    "",
    "What this project does.",
    "",
    "## Architecture",
    "",
    "Uses Node.js.",
    "",
    "## Decisions",
    "",
    "### 2026-04-15: Use LanceDB",
    "",
    "**Decision:** Use LanceDB."
  ].join("\n"), "utf8");

  const document = await discoverProjectDocument(filePath);
  const chunks = chunkMarkdownDocument(document);

  const overviewChunk = chunks.find((c) => c.doc_type === "overview");
  assert.ok(overviewChunk, "should have an overview chunk for intro content");
  assert.match(overviewChunk.content, /What this project does/);

  const archChunk = chunks.find((c) => c.doc_type === "architecture");
  assert.ok(archChunk, "should have an architecture chunk");
  assert.match(archChunk.content, /Uses Node\.js/);

  const decisionChunk = chunks.find((c) => c.doc_type === "decision");
  assert.ok(decisionChunk, "should have a decision chunk");
  assert.match(decisionChunk.content, /Use LanceDB/);
});
