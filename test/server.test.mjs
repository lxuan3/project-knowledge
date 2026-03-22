import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildIndexes } from "../src/index/build.mjs";
import { createProjectKnowledgeServer } from "../src/server/http.mjs";

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

test("HTTP server exposes health, search, and context-pack endpoints", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-server-"));
  const vaultRoot = path.join(root, "vault");
  const indexRoot = path.join(root, "index");
  const projectRoot = path.join(vaultRoot, "openclaw-dashboard");

  await writeFile(
    path.join(projectRoot, "00-overview.md"),
    [
      "---",
      "project: openclaw-dashboard",
      "doc_type: overview",
      "status: active",
      "updated_at: 2026-03-22",
      "---",
      "",
      "# Overview",
      "",
      "## Summary",
      "",
      "Dashboard overview."
    ].join("\n")
  );

  await writeFile(
    path.join(projectRoot, "02-decisions", "repo-sync.md"),
    [
      "---",
      "project: openclaw-dashboard",
      "doc_type: decision",
      "status: active",
      "updated_at: 2026-03-22",
      "aliases: [skill manager]",
      "---",
      "",
      "# Repo Sync",
      "",
      "## Decision",
      "",
      "Use repo-first sync for skill manager."
    ].join("\n")
  );

  await buildIndexes({ vaultRoot, indexRoot });

  const config = {
    vaultRoot,
    indexRoot,
    retrievalBackend: "json",
    lancedbUri: path.join(root, "lancedb")
  };

  const server = createProjectKnowledgeServer({ config });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const healthResponse = await fetch(`${baseUrl}/health`);
    const health = await healthResponse.json();
    assert.equal(health.ok, true);
    assert.equal(health.retrieval_backend, "json");

    const searchResponse = await fetch(`${baseUrl}/search?project=openclaw-dashboard&query=skill%20manager`);
    const search = await searchResponse.json();
    assert.equal(search.retrieval_backend, "json");
    assert.equal(search.results.length, 1);

    const contextResponse = await fetch(`${baseUrl}/context-pack?project=openclaw-dashboard&query=skill%20manager`);
    const contextPack = await contextResponse.json();
    assert.equal(contextPack.retrieval_backend, "json");
    assert.equal(contextPack.context.overview.length, 1);
    assert.equal(contextPack.context.decisions.length, 1);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
