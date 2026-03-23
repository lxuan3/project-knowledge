import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import os from "node:os";

import { buildIndexes } from "../src/index/build.mjs";
import { createProjectKnowledgeServer } from "../src/server/http.mjs";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliEntry = path.join(repoRoot, "bin", "project-knowledge");

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

test("CLI help lists core commands", async () => {
  const { stdout } = await execFileAsync("node", [cliEntry, "--help"], {
    cwd: repoRoot
  });

  assert.match(stdout, /Usage:/);
  assert.match(stdout, /project-knowledge <command> \[options\]/);
  assert.match(stdout, /write/);
  assert.match(stdout, /where/);
  assert.match(stdout, /index/);
  assert.match(stdout, /list-projects/);
  assert.match(stdout, /search/);
  assert.match(stdout, /config/);
  assert.match(stdout, /serve/);
  assert.match(stdout, /lint/);
  assert.match(stdout, /print-agent-guidance/);
  assert.match(stdout, /Examples:/);
  assert.match(stdout, /project-knowledge where --project openclaw-dashboard/);
  assert.match(stdout, /project-knowledge write --project openclaw-dashboard --doc-type decision --title "Repo First Sync"/);
});

test("CLI help command prints command-specific usage and examples", async () => {
  const { stdout } = await execFileAsync("node", [cliEntry, "help", "write"], {
    cwd: repoRoot
  });

  assert.match(stdout, /Command:\s+write/);
  assert.match(stdout, /Create a structured markdown note from a template/);
  assert.match(stdout, /Usage:\s*\n\s*project-knowledge write --project <name> --doc-type <type>/);
  assert.match(stdout, /Options:/);
  assert.match(stdout, /--project-type <type>/);
  assert.match(stdout, /Examples:/);
  assert.match(stdout, /project-knowledge write --project openclaw-dashboard --doc-type decision --title "Repo First Sync"/);
});

test("CLI help command prints doctor usage and examples", async () => {
  const { stdout } = await execFileAsync("node", [cliEntry, "help", "doctor"], {
    cwd: repoRoot
  });

  assert.match(stdout, /Command:\s+doctor/);
  assert.match(stdout, /active probing/i);
  assert.match(stdout, /--json/);
  assert.match(stdout, /project-knowledge doctor --project openclaw-dashboard --json/);
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
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-projects-"));
  const vaultRoot = path.join(homeDir, "vault");
  const configDir = path.join(homeDir, ".project-knowledge");
  await fs.mkdir(path.join(vaultRoot, "alpha"), { recursive: true });
  await fs.mkdir(path.join(vaultRoot, "beta"), { recursive: true });
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(path.join(vaultRoot, "alpha", "00-overview.md"), "# Alpha\n", "utf8");
  await fs.writeFile(path.join(vaultRoot, "beta", "00-overview.md"), "# Beta\n", "utf8");
  await fs.writeFile(
    path.join(configDir, "config.json"),
    JSON.stringify({
      vaultRoot,
      indexRoot: path.join(homeDir, "index"),
      retrievalBackend: "auto",
      lancedbUri: path.join(homeDir, "lancedb"),
      remoteBaseUrl: null,
      remotePrimaryUrl: null,
      remoteBackupUrl: null
    }),
    "utf8"
  );

  const env = { ...process.env, HOME: homeDir, USERPROFILE: homeDir };
  const { stdout } = await execFileAsync("node", [cliEntry, "list-projects"], {
    cwd: repoRoot,
    env
  });

  assert.match(stdout, /"project": "alpha"/);
  assert.match(stdout, /"project": "beta"/);
});

test("list-projects includes configured project spaces and reports root collisions", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-project-spaces-"));
  const vaultRoot = path.join(homeDir, "vault");
  const configDir = path.join(homeDir, ".project-knowledge");

  await writeFile(path.join(vaultRoot, "alpha", "00-overview.md"), "# Alpha\n");
  await writeFile(path.join(vaultRoot, "Openclaw", "beta", "00-overview.md"), "# Beta\n");
  await writeFile(path.join(vaultRoot, "Openclaw", "alpha", "00-overview.md"), "# Alpha Nested\n");
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(
    path.join(configDir, "config.json"),
    JSON.stringify({
      vaultRoot,
      projectSpaces: ["Openclaw"],
      indexRoot: path.join(homeDir, "index"),
      retrievalBackend: "auto",
      lancedbUri: path.join(homeDir, "lancedb"),
      remoteBaseUrl: null,
      remotePrimaryUrl: null,
      remoteBackupUrl: null
    }),
    "utf8"
  );

  const env = { ...process.env, HOME: homeDir, USERPROFILE: homeDir };
  const { stdout } = await execFileAsync("node", [cliEntry, "list-projects"], {
    cwd: repoRoot,
    env
  });

  const parsed = JSON.parse(stdout);
  assert.equal(parsed.projects.length, 2);
  assert.deepEqual(parsed.projects.map((project) => project.project), ["alpha", "beta"]);
  assert.equal(parsed.projects.find((project) => project.project === "alpha").path, path.join(vaultRoot, "alpha"));
  assert.equal(parsed.projects.find((project) => project.project === "beta").path, path.join(vaultRoot, "Openclaw", "beta"));
  assert.match(JSON.stringify(parsed.collisions), /alpha/);
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
  await execFileAsync("node", [cliEntry, "config", "set", "projectSpaces", "Openclaw,Archive"], {
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
  assert.deepEqual(parsedAfter.projectSpaces, ["Openclaw", "Archive"]);
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

test("write supports --project-type for non-engineering projects", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-write-"));
  const projectRoot = path.join(root, "brand-strategy");

  const { stdout } = await execFileAsync("node", [
    cliEntry,
    "write",
    "--project",
    "brand-strategy",
    "--project-root",
    projectRoot,
    "--project-type",
    "knowledge",
    "--doc-type",
    "hypothesis",
    "--title",
    "Core Assumption"
  ], {
    cwd: repoRoot
  });

  assert.match(stdout, /02-hypotheses/);
  const createdPath = stdout.trim();
  const content = await fs.readFile(createdPath, "utf8");
  assert.match(content, /project_type: knowledge/);
  assert.match(content, /doc_type: hypothesis/);
});

test("where prints resolved config and project paths as json", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-where-"));
  const vaultRoot = path.join(homeDir, "obsidian");
  const configDir = path.join(homeDir, ".project-knowledge");
  await fs.mkdir(configDir, { recursive: true });
  await fs.mkdir(path.join(vaultRoot, "Openclaw", "openclaw-dashboard"), { recursive: true });
  await fs.writeFile(
    path.join(configDir, "config.json"),
    JSON.stringify({
      vaultRoot,
      projectSpaces: ["Openclaw"],
      indexRoot: path.join(homeDir, "index"),
      retrievalBackend: "auto",
      lancedbUri: path.join(homeDir, "lancedb"),
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

  const { stdout } = await execFileAsync("node", [
    cliEntry,
    "where",
    "--project",
    "openclaw-dashboard",
    "--doc-type",
    "decision",
    "--title",
    "Repo First Sync"
  ], {
    cwd: repoRoot,
    env
  });

  const parsed = JSON.parse(stdout);
  assert.equal(parsed.configPath, path.join(homeDir, ".project-knowledge", "config.json"));
  assert.equal(parsed.vaultRoot, vaultRoot);
  assert.deepEqual(parsed.projectSpaces, ["Openclaw"]);
  assert.equal(parsed.projectRoot, path.join(vaultRoot, "Openclaw", "openclaw-dashboard"));
  assert.equal(parsed.docType, "decision");
  assert.match(parsed.writePath, /openclaw-dashboard[\\/]+02-decisions[\\/]+repo-first-sync\.md$/);
});

test("doctor --json reports config, local retrieval, remote health, and project checks", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-doctor-"));
  const vaultRoot = path.join(homeDir, "obsidian", "Openclaw");
  const indexRoot = path.join(homeDir, "index");
  const lancedbUri = path.join(homeDir, "lancedb");
  const projectRoot = path.join(vaultRoot, "openclaw-dashboard");
  const configDir = path.join(homeDir, ".project-knowledge");

  await writeFile(
    path.join(projectRoot, "00-overview.md"),
    [
      "---",
      "project: openclaw-dashboard",
      "doc_type: overview",
      "status: active",
      "updated_at: 2026-03-23",
      "---",
      "",
      "# Overview",
      "",
      "## Summary",
      "",
      "Dashboard overview."
    ].join("\n")
  );

  await buildIndexes({ vaultRoot, indexRoot, retrievalBackend: "json", lancedbUri });
  await fs.mkdir(lancedbUri, { recursive: true });
  await fs.mkdir(configDir, { recursive: true });

  const remoteServer = createProjectKnowledgeServer({
    config: {
      vaultRoot,
      indexRoot,
      retrievalBackend: "json",
      lancedbUri
    }
  });
  await new Promise((resolve) => remoteServer.listen(0, "127.0.0.1", resolve));

  try {
    const remoteAddress = remoteServer.address();
    const remotePrimaryUrl = `http://127.0.0.1:${remoteAddress.port}`;

    await fs.writeFile(
      path.join(configDir, "config.json"),
      JSON.stringify({
        vaultRoot,
        indexRoot,
        retrievalBackend: "auto",
        lancedbUri,
        remotePrimaryUrl
      }),
      "utf8"
    );

    const env = {
      ...process.env,
      HOME: homeDir,
      USERPROFILE: homeDir
    };

    const { stdout } = await execFileAsync("node", [
      cliEntry,
      "doctor",
      "--project",
      "openclaw-dashboard",
      "--json"
    ], {
      cwd: repoRoot,
      env
    });

    const parsed = JSON.parse(stdout);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.project, "openclaw-dashboard");
    assert.equal(parsed.summary.fail, 0);
    assert.match(JSON.stringify(parsed.checks), /remotePrimaryUrl/);
    assert.match(JSON.stringify(parsed.checks), /projectRoot/);
    assert.match(JSON.stringify(parsed.checks), /index read/i);
    assert.match(JSON.stringify(parsed.checks), /remote health/i);
  } finally {
    await new Promise((resolve, reject) => remoteServer.close((error) => error ? reject(error) : resolve()));
  }
});

test("doctor prints a readable report and warns on unreachable remote", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-doctor-warn-"));
  const vaultRoot = path.join(homeDir, "obsidian", "Openclaw");
  const indexRoot = path.join(homeDir, "index");
  const configDir = path.join(homeDir, ".project-knowledge");
  await fs.mkdir(vaultRoot, { recursive: true });
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(
    path.join(configDir, "config.json"),
    JSON.stringify({
      vaultRoot,
      indexRoot,
      retrievalBackend: "json",
      lancedbUri: path.join(homeDir, "lancedb"),
      remotePrimaryUrl: "http://127.0.0.1:9"
    }),
    "utf8"
  );

  const env = {
    ...process.env,
    HOME: homeDir,
    USERPROFILE: homeDir
  };

  const { stdout } = await execFileAsync("node", [cliEntry, "doctor"], {
    cwd: repoRoot,
    env
  });

  assert.match(stdout, /Project Knowledge Doctor/);
  assert.match(stdout, /\u001b\[33mWARN\u001b\[0m/);
  assert.match(stdout, /remote health/i);
  assert.match(stdout, /config/i);
});

test("doctor warns when LanceDB is configured but chunks table is missing under auto backend", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-doctor-lancedb-warn-"));
  const vaultRoot = path.join(homeDir, "obsidian", "Openclaw");
  const indexRoot = path.join(homeDir, "index");
  const lancedbUri = path.join(homeDir, "lancedb");
  const configDir = path.join(homeDir, ".project-knowledge");
  await fs.mkdir(vaultRoot, { recursive: true });
  await fs.mkdir(lancedbUri, { recursive: true });
  await fs.mkdir(configDir, { recursive: true });
  await writeFile(path.join(indexRoot, "global", "chunks.json"), JSON.stringify({ chunks: [] }, null, 2));
  await fs.writeFile(
    path.join(configDir, "config.json"),
    JSON.stringify({
      vaultRoot,
      indexRoot,
      retrievalBackend: "auto",
      lancedbUri
    }),
    "utf8"
  );

  const env = {
    ...process.env,
    HOME: homeDir,
    USERPROFILE: homeDir
  };

  const { stdout } = await execFileAsync("node", [cliEntry, "doctor", "--json"], {
    cwd: repoRoot,
    env
  });

  const parsed = JSON.parse(stdout);
  assert.equal(parsed.summary.fail, 0);
  assert.ok(parsed.summary.warn >= 1);
  assert.match(JSON.stringify(parsed.checks), /lancedb table/i);
  assert.match(JSON.stringify(parsed.checks), /missing table|cannot open|chunks/i);
});

test("doctor fails when lancedb backend is required but LanceDB is unavailable", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-knowledge-cli-doctor-lancedb-fail-"));
  const vaultRoot = path.join(homeDir, "obsidian", "Openclaw");
  const indexRoot = path.join(homeDir, "index");
  const configDir = path.join(homeDir, ".project-knowledge");
  await fs.mkdir(vaultRoot, { recursive: true });
  await fs.mkdir(configDir, { recursive: true });
  await writeFile(path.join(indexRoot, "global", "chunks.json"), JSON.stringify({ chunks: [] }, null, 2));
  await fs.writeFile(
    path.join(configDir, "config.json"),
    JSON.stringify({
      vaultRoot,
      indexRoot,
      retrievalBackend: "lancedb",
      lancedbUri: path.join(homeDir, "missing-lancedb")
    }),
    "utf8"
  );

  const env = {
    ...process.env,
    HOME: homeDir,
    USERPROFILE: homeDir,
    NODE_OPTIONS: "--require ./test/support/mock-lancedb-fail.cjs"
  };

  await assert.rejects(
    () => execFileAsync("node", [cliEntry, "doctor", "--json"], {
      cwd: repoRoot,
      env
    }),
    (error) => {
      assert.equal(error.code, 1);
      const parsed = JSON.parse(error.stdout);
      assert.ok(parsed.summary.fail >= 1);
      assert.match(JSON.stringify(parsed.checks), /lancedb connect/i);
      return true;
    }
  );
});
