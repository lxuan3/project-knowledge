import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { discoverProjectDocuments } from "../src/vault/discover.mjs";
import { chunkMarkdownDocument } from "../src/vault/chunk.mjs";

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

test("discoverProjectDocuments parses project notes and chunkMarkdownDocument creates heading-aware chunks", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-vault-"));
  const projectRoot = path.join(root, "openclaw-dashboard");

  await writeFile(
    path.join(projectRoot, "02-decisions", "repo-sync.md"),
    [
      "---",
      "project: openclaw-dashboard",
      "doc_type: decision",
      "status: active",
      "tags: [skills, architecture]",
      "updated_at: 2026-03-22",
      "aliases: [skill manager repo sync]",
      "---",
      "",
      "# Repo Sync",
      "",
      "## Context",
      "",
      "Skill manager should use repo-first sync.",
      "",
      "## Decision",
      "",
      "Workspace-only skills must sync back into the repository."
    ].join("\n")
  );

  const documents = await discoverProjectDocuments(projectRoot);
  assert.equal(documents.length, 1);
  assert.equal(documents[0].project, "openclaw-dashboard");
  assert.equal(documents[0].docType, "decision");

  const chunks = chunkMarkdownDocument(documents[0]);
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].project, "openclaw-dashboard");
  assert.equal(chunks[0].doc_type, "decision");
  assert.equal(chunks[0].heading_path, "Repo Sync > Context");
  assert.match(chunks[1].content, /Workspace-only skills/);
});
