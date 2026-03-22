import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildIndexes } from "../src/index/build.mjs";
import { retrieveContextGroups, retrieveRankedChunks } from "../src/retrieval/adapter.mjs";
import { searchIndex } from "../src/search/search.mjs";
import { buildContextPack } from "../src/search/context-pack.mjs";
import { createProjectKnowledgeServer } from "../src/server/http.mjs";

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

function createFakeLanceDbModule({ rows = null, failConnect = false } = {}) {
  const state = {
    tables: new Map()
  };

  return {
    state,
    async connect(uri) {
      if (failConnect) throw new Error("connect failed");

      return {
        async createTable(name, records, options = {}) {
          const normalized = records.map((record) => ({ ...record }));
          if (options.mode === "overwrite" || !state.tables.has(name)) {
            state.tables.set(name, normalized);
          } else {
            state.tables.get(name).push(...normalized);
          }

          return {
            async countRows() {
              return state.tables.get(name)?.length ?? 0;
            }
          };
        },
        async openTable(name) {
          const data = rows ?? state.tables.get(name);
          if (!data) throw new Error(`missing table: ${name}`);

          return {
            async toArray() {
              return data.map((row) => ({ ...row }));
            }
          };
        }
      };
    }
  };
}

test("buildIndexes writes project/global indexes and searchIndex returns structured results", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-search-"));
  const vaultRoot = path.join(root, "vault");
  const indexRoot = path.join(root, "index");
  const projectRoot = path.join(vaultRoot, "openclaw-dashboard");

  await writeFile(
    path.join(projectRoot, "02-decisions", "repo-sync.md"),
    [
      "---",
      "project: openclaw-dashboard",
      "doc_type: decision",
      "status: active",
      "updated_at: 2026-03-22",
      "tags: [skills]",
      "aliases: [repo-first]",
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

  const projectResults = await searchIndex({
    indexRoot,
    query: "repo-first skill manager",
    project: "openclaw-dashboard"
  });
  assert.equal(projectResults.retrieval_backend, "json");
  assert.equal(projectResults.results.length, 1);
  assert.equal(projectResults.results[0].project, "openclaw-dashboard");
  assert.equal(projectResults.results[0].doc_type, "decision");
  assert.match(projectResults.results[0].snippet, /repo-first sync/i);

  const globalResults = await searchIndex({
    indexRoot,
    query: "skill manager",
    scope: "global"
  });
  assert.equal(globalResults.results.length, 1);
});

test("buildContextPack returns grouped project context", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-context-pack-"));
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
    path.join(projectRoot, "01-architecture.md"),
    [
      "---",
      "project: openclaw-dashboard",
      "doc_type: architecture",
      "status: active",
      "updated_at: 2026-03-22",
      "---",
      "",
      "# Architecture",
      "",
      "## Runtime",
      "",
      "Runtime files drive the dashboard."
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

  await writeFile(
    path.join(projectRoot, "03-runbooks", "run.md"),
    [
      "---",
      "project: openclaw-dashboard",
      "doc_type: runbook",
      "status: active",
      "updated_at: 2026-03-22",
      "---",
      "",
      "# Runbook",
      "",
      "## Steps",
      "",
      "Run npm run lint before deploy."
    ].join("\n")
  );

  await writeFile(
    path.join(projectRoot, "04-reference", "api.md"),
    [
      "---",
      "project: openclaw-dashboard",
      "doc_type: reference",
      "status: active",
      "updated_at: 2026-03-22",
      "---",
      "",
      "# API",
      "",
      "## Skills",
      "",
      "Skills API exposes assignments."
    ].join("\n")
  );

  await buildIndexes({ vaultRoot, indexRoot });

  const contextPack = await buildContextPack({
    indexRoot,
    project: "openclaw-dashboard",
    query: "skill manager"
  });

  assert.equal(contextPack.project, "openclaw-dashboard");
  assert.equal(contextPack.retrieval_backend, "json");
  assert.equal(contextPack.context.overview.length, 1);
  assert.equal(contextPack.context.architecture.length, 1);
  assert.equal(contextPack.context.decisions.length, 1);
  assert.equal(contextPack.context.runbooks.length, 1);
  assert.equal(contextPack.context.reference.length, 1);
  assert.equal(contextPack.context.decisions[0].doc_type, "decision");
});

test("searchIndex throws a friendly error when indexes have not been built yet", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-missing-index-"));
  const indexRoot = path.join(root, "index");

  await assert.rejects(
    () => searchIndex({
      indexRoot,
      query: "skill manager",
      project: "openclaw-dashboard"
    }),
    (error) => {
      assert.match(error.message, /Run `project-knowledge index` first\./);
      assert.match(error.message, /openclaw-dashboard/);
      return true;
    }
  );
});

test("retrieval adapter returns ranked chunks and grouped context independently of search formatters", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-adapter-"));
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

  const ranked = await retrieveRankedChunks({
    indexRoot,
    project: "openclaw-dashboard",
    query: "skill manager"
  });
  assert.equal(ranked.backend, "json");
  assert.equal(ranked.chunks.length, 1);
  assert.equal(ranked.chunks[0].doc_type, "decision");
  assert.ok(ranked.chunks[0].score > 0);

  const groups = await retrieveContextGroups({
    indexRoot,
    project: "openclaw-dashboard",
    query: "skill manager"
  });
  assert.equal(groups.backend, "json");
  assert.equal(groups.groups.overview.length, 1);
  assert.equal(groups.groups.decisions.length, 1);
});

test("buildIndexes writes LanceDB rows and retrieval prefers LanceDB when available", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-lancedb-"));
  const vaultRoot = path.join(root, "vault");
  const indexRoot = path.join(root, "index");
  const lancedbUri = path.join(root, "lancedb");
  const projectRoot = path.join(vaultRoot, "openclaw-dashboard");
  const fakeLanceDb = createFakeLanceDbModule();

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

  await buildIndexes({
    vaultRoot,
    indexRoot,
    retrievalBackend: "lancedb",
    lancedbUri,
    lancedbModule: fakeLanceDb
  });

  assert.equal(fakeLanceDb.state.tables.get("chunks")?.length, 1);
  assert.equal(typeof fakeLanceDb.state.tables.get("chunks")?.[0]?.aliases, "string");

  const ranked = await retrieveRankedChunks({
    indexRoot,
    project: "openclaw-dashboard",
    query: "skill manager",
    retrievalBackend: "lancedb",
    lancedbUri,
    lancedbModule: fakeLanceDb
  });

  assert.equal(ranked.backend, "lancedb");
  assert.equal(ranked.chunks.length, 1);
  assert.equal(ranked.chunks[0].doc_type, "decision");

  const searchResults = await searchIndex({
    indexRoot,
    project: "openclaw-dashboard",
    query: "skill manager",
    retrievalBackend: "lancedb",
    lancedbUri,
    lancedbModule: fakeLanceDb
  });
  assert.equal(searchResults.retrieval_backend, "lancedb");
});

test("retrieval falls back to JSON when LanceDB is unavailable", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-lancedb-fallback-"));
  const vaultRoot = path.join(root, "vault");
  const indexRoot = path.join(root, "index");
  const projectRoot = path.join(vaultRoot, "openclaw-dashboard");

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

  const ranked = await retrieveRankedChunks({
    indexRoot,
    project: "openclaw-dashboard",
    query: "skill manager",
    retrievalBackend: "auto",
    lancedbUri: path.join(root, "missing-lancedb"),
    lancedbModule: createFakeLanceDbModule({ failConnect: true })
  });

  assert.equal(ranked.backend, "json-fallback");
  assert.equal(ranked.chunks.length, 1);
  assert.equal(ranked.chunks[0].doc_type, "decision");

  const searchResults = await searchIndex({
    indexRoot,
    project: "openclaw-dashboard",
    query: "skill manager",
    retrievalBackend: "auto",
    lancedbUri: path.join(root, "missing-lancedb"),
    lancedbModule: createFakeLanceDbModule({ failConnect: true })
  });
  assert.equal(searchResults.retrieval_backend, "json-fallback");
});

test("searchIndex and buildContextPack can proxy to a remote project-knowledge server", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-remote-"));
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

  const server = createProjectKnowledgeServer({
    config: {
      vaultRoot,
      indexRoot,
      retrievalBackend: "json",
      lancedbUri: path.join(root, "lancedb"),
      remoteBaseUrl: null
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const address = server.address();
    const remoteBaseUrl = `http://127.0.0.1:${address.port}`;

    const search = await searchIndex({
      indexRoot: path.join(root, "missing-index"),
      query: "skill manager",
      project: "openclaw-dashboard",
      remoteBaseUrl
    });
    assert.equal(search.retrieval_backend, "json");
    assert.equal(search.transport_backend, "remote-primary");
    assert.equal(search.results.length, 1);

    const contextPack = await buildContextPack({
      indexRoot: path.join(root, "missing-index"),
      project: "openclaw-dashboard",
      query: "skill manager",
      remoteBaseUrl
    });
    assert.equal(contextPack.retrieval_backend, "json");
    assert.equal(contextPack.transport_backend, "remote-primary");
    assert.equal(contextPack.context.decisions.length, 1);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("remote search can fall back from primary to backup before using local indexes", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-remote-backup-"));
  const vaultRoot = path.join(root, "vault");
  const indexRoot = path.join(root, "index");
  const projectRoot = path.join(vaultRoot, "openclaw-dashboard");

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

  const server = createProjectKnowledgeServer({
    config: {
      vaultRoot,
      indexRoot,
      retrievalBackend: "json",
      lancedbUri: path.join(root, "lancedb"),
      remoteBaseUrl: null
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const address = server.address();
    const remoteBackupUrl = `http://127.0.0.1:${address.port}`;

    const search = await searchIndex({
      indexRoot,
      query: "skill manager",
      project: "openclaw-dashboard",
      remotePrimaryUrl: "http://127.0.0.1:9",
      remoteBackupUrl
    });
    assert.equal(search.transport_backend, "remote-backup");
    assert.equal(search.results.length, 1);

    const contextPack = await buildContextPack({
      indexRoot,
      project: "openclaw-dashboard",
      query: "skill manager",
      remotePrimaryUrl: "http://127.0.0.1:9",
      remoteBackupUrl
    });
    assert.equal(contextPack.transport_backend, "remote-backup");
    assert.equal(contextPack.context.decisions.length, 1);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("remote search can fall back to local retrieval after both remote URLs fail", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-remote-local-fallback-"));
  const vaultRoot = path.join(root, "vault");
  const indexRoot = path.join(root, "index");
  const projectRoot = path.join(vaultRoot, "openclaw-dashboard");

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

  const search = await searchIndex({
    indexRoot,
    query: "skill manager",
    project: "openclaw-dashboard",
    remotePrimaryUrl: "http://127.0.0.1:9",
    remoteBackupUrl: "http://127.0.0.1:8"
  });
  assert.equal(search.retrieval_backend, "json");
  assert.equal(search.transport_backend, "local");
  assert.equal(search.results.length, 1);

  const contextPack = await buildContextPack({
    indexRoot,
    project: "openclaw-dashboard",
    query: "skill manager",
    remotePrimaryUrl: "http://127.0.0.1:9",
    remoteBackupUrl: "http://127.0.0.1:8"
  });
  assert.equal(contextPack.retrieval_backend, "json");
  assert.equal(contextPack.transport_backend, "local");
  assert.equal(contextPack.context.decisions.length, 1);
});
