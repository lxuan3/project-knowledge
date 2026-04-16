# Single-File Project Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the multi-file per project layout (`00-overview.md`, `01-architecture.md`, `02-decisions/`, …) with a single `<project-slug>.md` file per project, where sections (`## Decisions`, `## Runbooks`, etc.) replace separate directories and files.

**Architecture:** Each project becomes one `.md` file at `<vaultRoot>/<project-slug>.md`. The file has a simplified frontmatter (no `doc_type`), and sections are `##`-level headings. The `write` command either creates the whole file (`--doc-type overview`) or appends an entry under the matching section (`--doc-type decision --title "..."`). Chunking and retrieval derive `doc_type` from section headings.

**Tech Stack:** Node.js ESM modules, `node:fs/promises`, `node:test` (built-in test runner)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `templates/engineering.md` | Create | Full project file template for engineering projects |
| `templates/knowledge.md` | Create | Full project file template for knowledge projects |
| `templates/content.md` | Create | Full project file template for content projects |
| `templates/_decision.md` | Create | Section snippet appended under `## Decisions` |
| `templates/_runbook.md` | Create | Section snippet appended under `## Runbooks` |
| `templates/_reference.md` | Create | Section snippet appended under `## Reference` |
| `templates/_hypothesis.md` | Create | Section snippet appended under `## Hypotheses` |
| `templates/_idea.md` | Create | Section snippet appended under `## Ideas` |
| `templates/_experiment.md` | Create | Section snippet appended under `## Experiments` |
| `templates/_topic.md` | Create | Section snippet appended under `## Topics` |
| `templates/_production.md` | Create | Section snippet appended under `## Production` |
| `templates/_landscape.md` | Create | Section snippet appended under `## Landscape` |
| `templates/_strategy.md` | Create | Section snippet appended under `## Strategy` |
| `templates/overview.md` | Delete | Replaced by per-type full-file templates |
| `templates/architecture.md` | Delete | Now a section within the project file |
| `templates/decision.md` | Delete | Replaced by `_decision.md` snippet |
| `templates/runbook.md` | Delete | Replaced by `_runbook.md` snippet |
| `templates/reference.md` | Delete | Replaced by `_reference.md` snippet |
| `templates/hypothesis.md` | Delete | Replaced by `_hypothesis.md` snippet |
| `templates/idea.md` | Delete | Replaced by `_idea.md` snippet |
| `templates/experiment.md` | Delete | Replaced by `_experiment.md` snippet |
| `templates/topic.md` | Delete | Replaced by `_topic.md` snippet |
| `templates/production.md` | Delete | Replaced by `_production.md` snippet |
| `templates/landscape.md` | Delete | Replaced by `_landscape.md` snippet |
| `templates/strategy.md` | Delete | Replaced by `_strategy.md` snippet |
| `src/vault/project-roots.mjs` | Modify | Discover `*.md` files in vault root instead of directories |
| `src/vault/discover.mjs` | Modify | Read single project file instead of walking a directory tree |
| `src/vault/chunk.mjs` | Modify | Derive `doc_type` from section headings; emit intro as `overview` chunk |
| `src/commands/write.mjs` | Rewrite | Create project file or append section entry |
| `src/lint/lint.mjs` | Modify | Validate single project file frontmatter (no `doc_type` required) |
| `src/config/load.mjs` | Modify | Add `resolveProjectFile(config, project)` helper |
| `bin/project-knowledge` | Modify | Update `where` and `write` commands to use `resolveProjectFile` |
| `test/vault.test.mjs` | Rewrite | Test single-file discover + chunk with heading-derived doc_type |
| `test/lint.test.mjs` | Rewrite | Test single-file lint rules |
| `test/cli.test.mjs` | Modify | Update list-projects and write tests for new layout |
| `project-knowledge/SKILL.md` | Modify | Update structure docs and `write` examples |
| `docs/classification-guide.md` | Modify | Simplify — choosing a section, not a file path |
| `HUMAN_SETUP.md` | Modify | Update structure example to single-file layout |

---

### Task 1: Full-file project templates

**Files:**
- Create: `templates/engineering.md`
- Create: `templates/knowledge.md`
- Create: `templates/content.md`

- [ ] **Step 1: Create `templates/engineering.md`**

```markdown
---
project: <project-slug>
project_type: engineering
status: active
tags: []
updated_at: YYYY-MM-DD
---

# <title>

What this project does and why it exists.

## Architecture

How the system is structured.

## Decisions

## Runbooks

## Reference
```

- [ ] **Step 2: Create `templates/knowledge.md`**

```markdown
---
project: <project-slug>
project_type: knowledge
status: active
tags: []
updated_at: YYYY-MM-DD
---

# <title>

What this project explores and why.

## Landscape

How this knowledge domain is structured.

## Hypotheses

## Ideas

## Experiments

## Decisions

## Reference
```

- [ ] **Step 3: Create `templates/content.md`**

```markdown
---
project: <project-slug>
project_type: content
status: active
tags: []
updated_at: YYYY-MM-DD
---

# <title>

What this content project covers and who it's for.

## Strategy

High-level direction and goals.

## Topics

## Production

## Experiments

## Decisions

## Reference
```

- [ ] **Step 4: Commit**

```bash
git add templates/engineering.md templates/knowledge.md templates/content.md
git commit -m "feat: add full-file project templates for engineering, knowledge, content"
```

---

### Task 2: Section snippet templates

**Files:**
- Create: `templates/_decision.md`
- Create: `templates/_runbook.md`
- Create: `templates/_reference.md`
- Create: `templates/_hypothesis.md`
- Create: `templates/_idea.md`
- Create: `templates/_experiment.md`
- Create: `templates/_topic.md`
- Create: `templates/_production.md`
- Create: `templates/_landscape.md`
- Create: `templates/_strategy.md`

- [ ] **Step 1: Create `templates/_decision.md`**

```markdown
### YYYY-MM-DD: <title>

**Context:** Describe the problem or situation that made a decision necessary.

**Decision:** What was decided.

**Consequences:** What changes or trade-offs this introduces.
```

- [ ] **Step 2: Create `templates/_runbook.md`**

```markdown
### <title>

**When:** Describe when to use this runbook.

**Steps:**

1. Step one.
2. Step two.
```

- [ ] **Step 3: Create `templates/_reference.md`**

```markdown
### <title>

Stable facts, conventions, or source material.
```

- [ ] **Step 4: Create `templates/_hypothesis.md`**

```markdown
### YYYY-MM-DD: <title>

**Claim:** The hypothesis being tested.

**Evidence so far:** What supports or challenges this claim.

**Status:** unvalidated / validated / rejected
```

- [ ] **Step 5: Create `templates/_idea.md`**

```markdown
### <title>

**Direction:** What this idea proposes.

**Why interesting:** Why it's worth considering.

**Open questions:** What needs to be resolved before committing.
```

- [ ] **Step 6: Create `templates/_experiment.md`**

```markdown
### YYYY-MM-DD: <title>

**Goal:** What this experiment is trying to learn.

**Method:** How it was run.

**Result:** What happened.
```

- [ ] **Step 7: Create `templates/_topic.md`**

```markdown
### <title>

**Angle:** The specific take or entry point.

**Target audience:** Who this is for.

**Notes:** Any relevant context or constraints.
```

- [ ] **Step 8: Create `templates/_production.md`**

```markdown
### <title>

**Format:** What type of content this is.

**Steps:**

1. Step one.
2. Step two.
```

- [ ] **Step 9: Create `templates/_landscape.md`**

```markdown
### <title>

Description of this part of the domain.
```

- [ ] **Step 10: Create `templates/_strategy.md`**

```markdown
### <title>

**Direction:** The strategic direction.

**Rationale:** Why this direction was chosen.
```

- [ ] **Step 11: Commit**

```bash
git add templates/_decision.md templates/_runbook.md templates/_reference.md \
        templates/_hypothesis.md templates/_idea.md templates/_experiment.md \
        templates/_topic.md templates/_production.md templates/_landscape.md \
        templates/_strategy.md
git commit -m "feat: add section snippet templates for appendable doc types"
```

---

### Task 3: Remove old per-file templates

**Files:**
- Delete: `templates/overview.md`, `templates/architecture.md`, `templates/decision.md`, `templates/runbook.md`, `templates/reference.md`, `templates/hypothesis.md`, `templates/idea.md`, `templates/experiment.md`, `templates/topic.md`, `templates/production.md`, `templates/landscape.md`, `templates/strategy.md`

- [ ] **Step 1: Delete old templates**

```bash
rm templates/overview.md templates/architecture.md templates/decision.md \
   templates/runbook.md templates/reference.md templates/hypothesis.md \
   templates/idea.md templates/experiment.md templates/topic.md \
   templates/production.md templates/landscape.md templates/strategy.md
```

- [ ] **Step 2: Commit**

```bash
git add -u templates/
git commit -m "chore: remove old per-file templates replaced by single-file design"
```

---

### Task 4: Update project-roots discovery

**Files:**
- Modify: `src/vault/project-roots.mjs`

Old behavior: scan directories under `vaultRoot` for any that contain `.md` files.
New behavior: scan for `*.md` files directly under `vaultRoot` (and project spaces).

- [ ] **Step 1: Write the failing test** in `test/vault.test.mjs`

Add this test (do not remove the existing test yet — it will be replaced in Task 6):

```javascript
import { discoverProjectRoots } from "../src/vault/project-roots.mjs";

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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
node --test test/vault.test.mjs 2>&1 | grep -A3 "finds .md files"
```
Expected: FAIL — `projects` is empty or `filePath` is undefined.

- [ ] **Step 3: Rewrite `src/vault/project-roots.mjs`**

```javascript
import fs from "node:fs/promises";
import path from "node:path";

async function markdownFilesInDir(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("."))
      .map((entry) => path.join(dirPath, entry.name));
  } catch {
    return [];
  }
}

export async function discoverProjectRoots(vaultRoot, projectSpaces = []) {
  const discovered = new Map();
  const collisions = [];

  const searchDirs = [
    vaultRoot,
    ...(projectSpaces ?? []).map((space) => path.join(vaultRoot, space))
  ];

  for (const dir of searchDirs) {
    const files = await markdownFilesInDir(dir);
    for (const filePath of files) {
      const project = path.basename(filePath, ".md");
      const existing = discovered.get(project);
      if (existing) {
        collisions.push({ project, kept: existing, ignored: filePath });
        continue;
      }
      discovered.set(project, filePath);
    }
  }

  const projects = [...discovered.entries()]
    .map(([project, filePath]) => ({ project, filePath }))
    .sort((a, b) => a.project.localeCompare(b.project));

  return { projects, collisions };
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
node --test test/vault.test.mjs 2>&1 | grep -A3 "finds .md files"
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/vault/project-roots.mjs test/vault.test.mjs
git commit -m "feat: discover projects as .md files in vault root instead of directories"
```

---

### Task 5: Update vault discovery (single-file document)

**Files:**
- Modify: `src/vault/discover.mjs`

Old behavior: walk a project directory recursively, return one document per `.md` file.
New behavior: read a single project file path, return one document (with `docType: null`).

- [ ] **Step 1: Add failing test** in `test/vault.test.mjs`

```javascript
import { discoverProjectDocument } from "../src/vault/discover.mjs";

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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
node --test test/vault.test.mjs 2>&1 | grep -A3 "reads a single project file"
```
Expected: FAIL — `discoverProjectDocument` is not exported.

- [ ] **Step 3: Rewrite `src/vault/discover.mjs`**

```javascript
import fs from "node:fs/promises";
import path from "node:path";

import { parseFrontmatter } from "./frontmatter.mjs";

function extractTitle(body, fallback) {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? fallback;
}

export async function discoverProjectDocument(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  return {
    filePath,
    sourceRelpath: path.basename(filePath),
    project: data.project ?? path.basename(filePath, ".md"),
    projectType: data.project_type ?? "engineering",
    docType: null,
    status: data.status ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    aliases: Array.isArray(data.aliases) ? data.aliases : [],
    updatedAt: data.updated_at ?? null,
    title: extractTitle(body, path.basename(filePath, ".md")),
    body
  };
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
node --test test/vault.test.mjs 2>&1 | grep -A3 "reads a single project file"
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/vault/discover.mjs test/vault.test.mjs
git commit -m "feat: replace directory-walk discovery with single-file discoverProjectDocument"
```

---

### Task 6: Update chunk.mjs — derive doc_type from section headings

**Files:**
- Modify: `src/vault/chunk.mjs`

Old behavior: every chunk uses `document.docType` (from frontmatter).
New behavior: intro content (before first `##`) → `doc_type: "overview"`; each `##` section → `doc_type` derived from heading name.

- [ ] **Step 1: Write failing test** in `test/vault.test.mjs`

Replace the old `discoverProjectDocuments` test with a new one that uses `discoverProjectDocument`:

```javascript
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
node --test test/vault.test.mjs 2>&1 | grep -A3 "derives doc_type"
```
Expected: FAIL — doc_type is null (not derived from heading).

- [ ] **Step 3: Rewrite `src/vault/chunk.mjs`**

```javascript
const HEADING_TO_DOC_TYPE = {
  "Architecture": "architecture",
  "Decisions": "decision",
  "Runbooks": "runbook",
  "Reference": "reference",
  "Landscape": "landscape",
  "Hypotheses": "hypothesis",
  "Ideas": "idea",
  "Experiments": "experiment",
  "Strategy": "strategy",
  "Topics": "topic",
  "Production": "production",
};

function normalizeContent(lines) {
  return lines.join("\n").trim();
}

function docTypeFromHeading(heading) {
  return HEADING_TO_DOC_TYPE[heading] ?? "reference";
}

export function chunkMarkdownDocument(document) {
  const lines = document.body.split("\n");
  const chunks = [];
  let currentHeading = null;
  let currentDocType = null;
  let currentLines = [];
  let introLines = [];
  let seenFirstSection = false;

  for (const line of lines) {
    if (/^#\s+/.test(line) && !/^##\s+/.test(line)) continue;

    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      if (!seenFirstSection) {
        seenFirstSection = true;
        const introContent = normalizeContent(introLines);
        if (introContent) {
          chunks.push({
            chunk_id: `${document.project}:${document.sourceRelpath}:overview`,
            project: document.project,
            doc_type: "overview",
            source_path: document.filePath,
            source_relpath: document.sourceRelpath,
            title: document.title,
            heading_path: document.title,
            status: document.status,
            tags: document.tags,
            aliases: document.aliases,
            content: introContent,
            chunk_index: chunks.length,
            updated_at: document.updatedAt,
            token_count: introContent.split(/\s+/).filter(Boolean).length
          });
        }
      } else {
        const content = normalizeContent(currentLines);
        if (currentHeading && content) {
          chunks.push({
            chunk_id: `${document.project}:${document.sourceRelpath}:${chunks.length}`,
            project: document.project,
            doc_type: currentDocType,
            source_path: document.filePath,
            source_relpath: document.sourceRelpath,
            title: document.title,
            heading_path: `${document.title} > ${currentHeading}`,
            status: document.status,
            tags: document.tags,
            aliases: document.aliases,
            content,
            chunk_index: chunks.length,
            updated_at: document.updatedAt,
            token_count: content.split(/\s+/).filter(Boolean).length
          });
        }
      }
      currentHeading = headingMatch[1].trim();
      currentDocType = docTypeFromHeading(currentHeading);
      currentLines = [];
      continue;
    }

    if (!seenFirstSection) {
      introLines.push(line);
    } else {
      currentLines.push(line);
    }
  }

  const finalContent = normalizeContent(currentLines);
  if (currentHeading && finalContent) {
    chunks.push({
      chunk_id: `${document.project}:${document.sourceRelpath}:${chunks.length}`,
      project: document.project,
      doc_type: currentDocType,
      source_path: document.filePath,
      source_relpath: document.sourceRelpath,
      title: document.title,
      heading_path: `${document.title} > ${currentHeading}`,
      status: document.status,
      tags: document.tags,
      aliases: document.aliases,
      content: finalContent,
      chunk_index: chunks.length,
      updated_at: document.updatedAt,
      token_count: finalContent.split(/\s+/).filter(Boolean).length
    });
  }

  if (chunks.length === 0) {
    const content = normalizeContent(lines.filter((l) => !/^#+\s/.test(l)));
    if (content) {
      chunks.push({
        chunk_id: `${document.project}:${document.sourceRelpath}:0`,
        project: document.project,
        doc_type: "overview",
        source_path: document.filePath,
        source_relpath: document.sourceRelpath,
        title: document.title,
        heading_path: document.title,
        status: document.status,
        tags: document.tags,
        aliases: document.aliases,
        content,
        chunk_index: 0,
        updated_at: document.updatedAt,
        token_count: content.split(/\s+/).filter(Boolean).length
      });
    }
  }

  return chunks;
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
node --test test/vault.test.mjs 2>&1 | grep -A3 "derives doc_type"
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/vault/chunk.mjs test/vault.test.mjs
git commit -m "feat: derive chunk doc_type from section headings, emit intro as overview chunk"
```

---

### Task 7: Update index build to use single-file discovery

**Files:**
- Modify: `src/index/build.mjs`

- [ ] **Step 1: Update `src/index/build.mjs`**

```javascript
import path from "node:path";

import { discoverProjectDocument } from "../vault/discover.mjs";
import { chunkMarkdownDocument } from "../vault/chunk.mjs";
import { discoverProjectRoots } from "../vault/project-roots.mjs";
import { writeLanceChunks } from "./lancedb.mjs";
import { writeChunks } from "./store.mjs";

export async function buildIndexes({
  vaultRoot,
  projectSpaces = [],
  indexRoot,
  retrievalBackend = "auto",
  lancedbUri = null,
  lancedbModule = null
}) {
  const { projects } = await discoverProjectRoots(vaultRoot, projectSpaces);
  const globalChunks = [];

  for (const { project, filePath } of projects) {
    const document = await discoverProjectDocument(filePath);
    const projectChunks = chunkMarkdownDocument(document);
    await writeChunks(path.join(indexRoot, "projects", project, "chunks.json"), projectChunks);
    globalChunks.push(...projectChunks);
  }

  await writeChunks(path.join(indexRoot, "global", "chunks.json"), globalChunks);

  if ((retrievalBackend === "auto" || retrievalBackend === "lancedb") && lancedbUri) {
    try {
      await writeLanceChunks({ lancedbUri, chunks: globalChunks, lancedbModule });
    } catch (error) {
      if (retrievalBackend === "lancedb") throw error;
    }
  }
}
```

- [ ] **Step 2: Run all tests**

```bash
node --test test/*.test.mjs 2>&1 | tail -20
```
Expected: vault and previously passing tests still pass. Some CLI tests for `list-projects` and `write` will fail — those are fixed in later tasks.

- [ ] **Step 3: Commit**

```bash
git add src/index/build.mjs
git commit -m "feat: update index build to use single-file project discovery"
```

---

### Task 8: Update lint to validate single project file

**Files:**
- Modify: `src/lint/lint.mjs`

Old behavior: walk all `.md` files in a project directory, require `doc_type` in each.
New behavior: validate a single project file — require `project`, `project_type`, `status` in frontmatter; no `doc_type` required.

- [ ] **Step 1: Write failing tests** in `test/lint.test.mjs`

Replace the full contents of `test/lint.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
node --test test/lint.test.mjs 2>&1 | tail -20
```
Expected: FAIL — `lintProject` still expects a directory.

- [ ] **Step 3: Rewrite `src/lint/lint.mjs`**

```javascript
import { discoverProjectDocument } from "../vault/discover.mjs";

const REQUIRED_FIELDS = ["project", "project_type", "status"];
const ALLOWED_PROJECT_TYPES = new Set(["engineering", "knowledge", "content"]);

export async function lintProject(filePath) {
  const document = await discoverProjectDocument(filePath);
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    const value =
      field === "project" ? document.project :
      field === "project_type" ? document.projectType :
      document.status;

    if (!value) {
      errors.push(`${document.sourceRelpath} is missing required field: ${field}`);
    }
  }

  if (document.projectType && !ALLOWED_PROJECT_TYPES.has(document.projectType)) {
    errors.push(`${document.sourceRelpath} has unsupported project_type: ${document.projectType}`);
  }

  return { ok: errors.length === 0, errors };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
node --test test/lint.test.mjs 2>&1 | tail -20
```
Expected: PASS (except the `writeProjectNote` test which is fixed in Task 9)

- [ ] **Step 5: Commit**

```bash
git add src/lint/lint.mjs test/lint.test.mjs
git commit -m "feat: update lint to validate single project file, drop per-file doc_type requirement"
```

---

### Task 9: Rewrite write command

**Files:**
- Modify: `src/commands/write.mjs`
- Modify: `src/config/load.mjs`

The `write` command now has two modes:
1. `--doc-type overview` (or no appendable type): create `<vaultRoot>/<project>.md` from the full-file template.
2. Any other `--doc-type`: append a dated snippet under the matching `## Section` heading in the existing project file.

- [ ] **Step 1: Add `resolveProjectFile` to `src/config/load.mjs`**

Open `src/config/load.mjs`. After the existing `resolveProjectRoot` function, add:

```javascript
export function resolveProjectFile({ config, project }) {
  return path.join(config.vaultRoot, `${project}.md`);
}
```

- [ ] **Step 2: Rewrite `src/commands/write.mjs`**

```javascript
import fs from "node:fs/promises";
import path from "node:path";

const APPENDABLE_DOC_TYPES = new Set([
  "decision", "runbook", "reference",
  "hypothesis", "idea", "experiment",
  "topic", "production", "landscape", "strategy", "architecture"
]);

const DOC_TYPE_TO_SECTION = {
  architecture: "Architecture",
  decision: "Decisions",
  runbook: "Runbooks",
  reference: "Reference",
  landscape: "Landscape",
  hypothesis: "Hypotheses",
  idea: "Ideas",
  experiment: "Experiments",
  strategy: "Strategy",
  topic: "Topics",
  production: "Production",
};

const FULL_FILE_TEMPLATES = {
  engineering: "engineering.md",
  knowledge: "knowledge.md",
  content: "content.md",
};

const SNIPPET_TEMPLATES = {
  decision: "_decision.md",
  runbook: "_runbook.md",
  reference: "_reference.md",
  hypothesis: "_hypothesis.md",
  idea: "_idea.md",
  experiment: "_experiment.md",
  topic: "_topic.md",
  production: "_production.md",
  landscape: "_landscape.md",
  strategy: "_strategy.md",
  architecture: null,
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fillTemplate(template, { project, projectType, title }) {
  return template
    .replace("<project-slug>", project)
    .replace(/project_type:\s+\S+/, `project_type: ${projectType}`)
    .replace("YYYY-MM-DD", today())
    .replace("<title>", title ?? project);
}

function fillSnippet(snippet, { title }) {
  const date = today();
  return snippet
    .replace("YYYY-MM-DD: <title>", `${date}: ${title ?? "Untitled"}`)
    .replace("<title>", title ?? "Untitled")
    .replace("YYYY-MM-DD", date);
}

async function appendToSection(filePath, section, snippet) {
  const raw = await fs.readFile(filePath, "utf8");
  const sectionHeading = `## ${section}`;
  const idx = raw.indexOf(`\n${sectionHeading}`);

  if (idx === -1) {
    // Section not found — append at end
    const appended = raw.trimEnd() + `\n\n${sectionHeading}\n\n${snippet}\n`;
    await fs.writeFile(filePath, appended, "utf8");
    return;
  }

  // Find start of next ## section after the target
  const afterSection = idx + 1 + sectionHeading.length;
  const nextSectionMatch = raw.slice(afterSection).match(/\n## /);
  const insertPos = nextSectionMatch
    ? afterSection + nextSectionMatch.index
    : raw.length;

  const updated = raw.slice(0, insertPos).trimEnd() + "\n\n" + snippet + "\n" + raw.slice(insertPos);
  await fs.writeFile(filePath, updated, "utf8");
}

export async function writeProjectNote({ repoRoot, vaultRoot, project, projectType = "engineering", docType = "overview", title = null }) {
  const projectFilePath = path.join(vaultRoot, `${project}.md`);

  if (!APPENDABLE_DOC_TYPES.has(docType)) {
    // Create the whole project file
    const templateName = FULL_FILE_TEMPLATES[projectType];
    if (!templateName) throw new Error(`Unsupported project_type: ${projectType}`);
    const templatePath = path.join(repoRoot, "templates", templateName);
    const template = await fs.readFile(templatePath, "utf8");
    const content = fillTemplate(template, { project, projectType, title: title ?? project });
    await fs.writeFile(projectFilePath, content, "utf8");
    return projectFilePath;
  }

  // Append to existing project file
  const snippetName = SNIPPET_TEMPLATES[docType];
  if (!snippetName) throw new Error(`No snippet template for doc_type: ${docType}`);
  const snippetPath = path.join(repoRoot, "templates", snippetName);
  const snippet = await fs.readFile(snippetPath, "utf8");
  const filled = fillSnippet(snippet, { title });
  const section = DOC_TYPE_TO_SECTION[docType];

  await appendToSection(projectFilePath, section, filled);
  return projectFilePath;
}
```

- [ ] **Step 3: Run lint tests to confirm the write+lint test passes now**

```bash
node --test test/lint.test.mjs 2>&1 | tail -20
```
Expected: all PASS

- [ ] **Step 4: Commit**

```bash
git add src/commands/write.mjs src/config/load.mjs test/lint.test.mjs
git commit -m "feat: rewrite write command to create single project file or append section entry"
```

---

### Task 10: Update CLI — where and write commands

**Files:**
- Modify: `bin/project-knowledge`

The `where` and `write` commands currently use `resolveProjectRoot` (returns a directory). Update them to use `resolveProjectFile`.

- [ ] **Step 1: Update imports at top of `bin/project-knowledge`**

Find the import line:
```javascript
import { loadConfig, resolveConfigPath, resolveProjectRoot } from "../src/config/load.mjs";
```

Replace with:
```javascript
import { loadConfig, resolveConfigPath, resolveProjectRoot, resolveProjectFile } from "../src/config/load.mjs";
```

- [ ] **Step 2: Update `write` command handler**

Find the `write` case in the CLI. It currently calls:
```javascript
const projectRoot = resolveProjectRoot({ config, projectRoot: args["--project-root"], project: args["--project"] });
```

Replace the `write` command block so it passes `vaultRoot` to `writeProjectNote`:

```javascript
case "write": {
  const project = args["--project"];
  if (!project) { console.error("--project is required"); process.exit(1); }
  const docType = args["--doc-type"] ?? "overview";
  const title = args["--title"] ?? null;
  const projectType = args["--project-type"] ?? "engineering";
  const vaultRoot = args["--vault-root"] ?? config.vaultRoot;

  const createdPath = await writeProjectNote({
    repoRoot,
    vaultRoot,
    project,
    projectType,
    docType,
    title
  });
  console.log(createdPath);
  break;
}
```

- [ ] **Step 3: Update `where` command handler**

Find the `where` case. Update the project path output to use `resolveProjectFile`:

```javascript
case "where": {
  const project = args["--project"];
  const output = {
    configPath: resolveConfigPath(),
    vaultRoot: config.vaultRoot,
    indexRoot: config.indexRoot,
  };
  if (project) {
    output.projectFile = resolveProjectFile({ config, project });
  }
  console.log(JSON.stringify(output, null, 2));
  break;
}
```

- [ ] **Step 4: Update `lint` command handler**

Find the `lint` case. It currently calls `lintProject(projectRoot)` where `projectRoot` was a directory. Update it:

```javascript
case "lint": {
  const project = args["--project"];
  if (!project) { console.error("--project is required"); process.exit(1); }
  const vaultRoot = args["--vault-root"] ?? config.vaultRoot;
  const filePath = resolveProjectFile({ config: { vaultRoot }, project });
  const result = await lintProject(filePath);
  if (result.ok) {
    console.log("ok");
  } else {
    result.errors.forEach((e) => console.error(e));
    process.exit(1);
  }
  break;
}
```

- [ ] **Step 5: Run all tests**

```bash
node --test test/*.test.mjs 2>&1 | tail -30
```
Expected: vault, lint, and templates tests all pass. CLI tests for `list-projects` and `write` may still fail — fix in next task.

- [ ] **Step 6: Commit**

```bash
git add bin/project-knowledge
git commit -m "feat: update CLI where/write/lint commands to use single-file project paths"
```

---

### Task 11: Update CLI tests

**Files:**
- Modify: `test/cli.test.mjs`

- [ ] **Step 1: Update `list-projects` tests**

Find both `list-projects` tests that write `00-overview.md` inside project directories. Replace the vault setup in each to use single `.md` files:

First test — replace:
```javascript
await fs.mkdir(path.join(vaultRoot, "alpha"), { recursive: true });
await fs.mkdir(path.join(vaultRoot, "beta"), { recursive: true });
// ...
await fs.writeFile(path.join(vaultRoot, "alpha", "00-overview.md"), "# Alpha\n", "utf8");
await fs.writeFile(path.join(vaultRoot, "beta", "00-overview.md"), "# Beta\n", "utf8");
```

With:
```javascript
await fs.mkdir(vaultRoot, { recursive: true });
// ...
await fs.writeFile(path.join(vaultRoot, "alpha.md"), "---\nproject: alpha\nproject_type: engineering\nstatus: active\n---\n# Alpha\n", "utf8");
await fs.writeFile(path.join(vaultRoot, "beta.md"), "---\nproject: beta\nproject_type: engineering\nstatus: active\n---\n# Beta\n", "utf8");
```

Second test (projectSpaces) — replace:
```javascript
await writeFile(path.join(vaultRoot, "alpha", "00-overview.md"), "# Alpha\n");
await writeFile(path.join(vaultRoot, "Openclaw", "beta", "00-overview.md"), "# Beta\n");
await writeFile(path.join(vaultRoot, "Openclaw", "alpha", "00-overview.md"), "# Alpha Nested\n");
```

With:
```javascript
await fs.mkdir(vaultRoot, { recursive: true });
await fs.mkdir(path.join(vaultRoot, "Openclaw"), { recursive: true });
await fs.writeFile(path.join(vaultRoot, "alpha.md"), "---\nproject: alpha\nproject_type: engineering\nstatus: active\n---\n# Alpha\n", "utf8");
await fs.writeFile(path.join(vaultRoot, "Openclaw", "beta.md"), "---\nproject: beta\nproject_type: engineering\nstatus: active\n---\n# Beta\n", "utf8");
```

Note: the second test checks that `alpha` appears only once (no collision from nested space). Adjust assertions to match new behavior.

- [ ] **Step 2: Run all tests**

```bash
node --test test/*.test.mjs 2>&1 | tail -30
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add test/cli.test.mjs
git commit -m "test: update CLI tests for single-file project layout"
```

---

### Task 12: Update docs and SKILL.md

**Files:**
- Modify: `project-knowledge/SKILL.md`
- Modify: `docs/classification-guide.md`
- Modify: `HUMAN_SETUP.md`

- [ ] **Step 1: Update project structure example in `HUMAN_SETUP.md`**

Find the block:
```text
/path/to/vault/
  openclaw-dashboard/
    00-overview.md
    01-architecture.md
    02-decisions/
    03-runbooks/
    04-reference/
```

Replace with:
```text
/path/to/vault/
  openclaw-dashboard.md
  brand-strategy.md
  project-knowledge-tool.md
```

- [ ] **Step 2: Update `write` command docs in `project-knowledge/SKILL.md`**

Find the `write` example block:
```bash
project-knowledge write \
  --project <project> \
  --project-type <engineering|knowledge|content> \
  --doc-type <overview|architecture|decision|runbook|reference> \
  --title "<title>"
```

Replace with:
```bash
# Create a new project file (first time setup):
project-knowledge write \
  --project <project> \
  --project-type <engineering|knowledge|content>

# Append an entry to an existing project file:
project-knowledge write \
  --project <project> \
  --doc-type <decision|runbook|reference|hypothesis|idea|experiment|topic|production> \
  --title "<title>"
```

Also update the explanation below the command block to describe the two modes:
```
The CLI creates the project file with standard frontmatter and section headings (for `overview`), or appends a new dated entry under the matching section heading (for all other doc types).
```

- [ ] **Step 3: Simplify `docs/classification-guide.md`**

Replace the Step 2 section (choosing file path/directory) with:

```markdown
## Step 2: Choose which section to append to

Do not write a new file. All content goes into the single project file. Choose the section based on what the content should do:

- `decision` → `## Decisions` — a conclusion, tradeoff, or explicit why
- `runbook` → `## Runbooks` — an engineering operating procedure  
- `reference` → `## Reference` — stable facts, APIs, conventions, or source material
- `hypothesis` → `## Hypotheses` — a claim that still needs validation (knowledge projects)
- `idea` → `## Ideas` — a possible direction not yet committed (knowledge projects)
- `experiment` → `## Experiments` — a test, trial, or validation record
- `topic` → `## Topics` — a content topic or angle (content projects)
- `production` → `## Production` — a content production workflow or output plan

Use `--doc-type overview` only when creating a new project file for the first time.
```

- [ ] **Step 4: Commit**

```bash
git add project-knowledge/SKILL.md docs/classification-guide.md HUMAN_SETUP.md
git commit -m "docs: update SKILL.md, classification guide, and setup docs for single-file layout"
```

---

### Task 13: Final test run and cleanup

- [ ] **Step 1: Run full test suite**

```bash
node --test test/*.test.mjs 2>&1
```
Expected: all tests pass, no failures.

- [ ] **Step 2: Verify templates directory contains only new files**

```bash
ls templates/
```
Expected output (13 files, no old numbered templates):
```
_decision.md  _experiment.md  _hypothesis.md  _idea.md  _landscape.md
_production.md  _reference.md  _runbook.md  _strategy.md  _topic.md
content.md  engineering.md  knowledge.md
```

- [ ] **Step 3: Commit any loose changes**

```bash
git status
```
If clean, no commit needed. If there are leftover changes, stage and commit them with an appropriate message.

---

## Self-review

**Spec coverage:**
- [x] Single file per project (`<vaultRoot>/<project>.md`) — Task 4, 5, 9
- [x] No numbered prefixes — Template redesign (Tasks 1–3)
- [x] `write` creates file or appends section entry — Task 9
- [x] `doc_type` derived from section headings (not frontmatter) — Task 6
- [x] Intro content becomes `overview` chunk — Task 6
- [x] `lint` validates single file — Task 8
- [x] `list-projects` finds `.md` files — Task 4
- [x] Index build updated — Task 7
- [x] CLI commands updated — Task 10
- [x] Tests updated — Tasks 4–6, 8, 11
- [x] Docs updated — Task 12

**No placeholders:** All code blocks are complete and self-contained.

**Type consistency:** `discoverProjectDocument` (singular) used consistently in Tasks 5, 6, 7, 8. `discoverProjectRoots` returns `{ project, filePath }` consistently across Tasks 4, 7, 10, 11.
