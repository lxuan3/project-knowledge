# CLI Docs Where Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `where` command, expand CLI help with detailed usage and examples, and reorganize human-facing docs so setup guidance lives in `HUMAN_SETUP.md` while `README.md` stays concise.

**Architecture:** Keep path-resolution logic centralized in small helpers shared by `write` and the new `where` command. Treat CLI help as generated static text in `bin/project-knowledge`, while documentation changes stay split by audience: overview in `README.md`, operational setup in `HUMAN_SETUP.md`, and quick command-first examples in `QUICKSTART.md`.

**Tech Stack:** Node.js ESM CLI, node:test, Markdown docs

---

### Task 1: Lock down new CLI behavior with tests

**Files:**
- Modify: `test/cli.test.mjs`

- [ ] **Step 1: Write failing tests for `where` and richer help output**

- [ ] **Step 2: Run targeted CLI tests to verify they fail**

Run: `npm test -- test/cli.test.mjs`
Expected: FAIL because `where` is not implemented and help text lacks the new detailed content.

- [ ] **Step 3: Implement the minimal CLI changes to satisfy the tests**

- [ ] **Step 4: Run targeted CLI tests to verify they pass**

Run: `npm test -- test/cli.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add test/cli.test.mjs bin/project-knowledge src/config/load.mjs src/commands/write.mjs
git commit -m "feat: add where command and richer CLI help"
```

### Task 2: Refactor path resolution for write previews

**Files:**
- Modify: `src/commands/write.mjs`
- Modify: `src/config/load.mjs`
- Modify: `bin/project-knowledge`

- [ ] **Step 1: Add a helper that resolves a `write` destination without writing the file**

- [ ] **Step 2: Use that helper from both `write` and `where`**

- [ ] **Step 3: Re-run targeted CLI tests**

Run: `npm test -- test/cli.test.mjs`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/commands/write.mjs src/config/load.mjs bin/project-knowledge test/cli.test.mjs
git commit -m "refactor: share project path resolution helpers"
```

### Task 3: Update human-facing docs

**Files:**
- Modify: `README.md`
- Modify: `HUMAN_SETUP.md`
- Modify: `QUICKSTART.md`

- [ ] **Step 1: Rewrite `README.md` as an overview and command index**

- [ ] **Step 2: Expand `HUMAN_SETUP.md` with Obsidian assumptions, LanceDB setup, config paths, and `where` examples**

- [ ] **Step 3: Refresh `QUICKSTART.md` with command-first examples and cross-platform notes**

- [ ] **Step 4: Run the full test suite to ensure doc-adjacent CLI changes did not regress behavior**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add README.md HUMAN_SETUP.md QUICKSTART.md
git commit -m "docs: expand setup and command guidance"
```
