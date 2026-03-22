# Doctor And Help Cases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an actively probing `doctor` command and expand command-specific help and docs with richer examples for `where`, `search`, `index`, `context-pack`, and `doctor`.

**Architecture:** Keep diagnostics as a dedicated command module that returns structured checks with `ok`, `warn`, and `fail` statuses. Let the CLI render either JSON or a compact human-readable report while reusing existing config resolution, JSON index reads, LanceDB connection logic, and remote `/health` probing.

**Tech Stack:** Node.js ESM CLI, node:test, Markdown docs, built-in fetch

---

### Task 1: Lock down doctor behavior with tests

**Files:**
- Modify: `test/cli.test.mjs`

- [ ] **Step 1: Write failing tests for `doctor`, `doctor --json`, and richer command help**
- [ ] **Step 2: Run targeted CLI tests to verify they fail**

Run: `npm test -- test/cli.test.mjs`
Expected: FAIL because `doctor` does not exist and command help/docs are incomplete.

- [ ] **Step 3: Implement the minimal CLI and diagnostics code**
- [ ] **Step 4: Run targeted CLI tests to verify they pass**

Run: `npm test -- test/cli.test.mjs`
Expected: PASS

### Task 2: Add structured diagnostics module

**Files:**
- Create: `src/commands/doctor.mjs`
- Modify: `bin/project-knowledge`

- [ ] **Step 1: Add checks for config path, vault/index/LanceDB paths, local JSON index readability, LanceDB connectivity, remote `/health`, and optional project path resolution**
- [ ] **Step 2: Add human-readable and JSON output modes**
- [ ] **Step 3: Re-run targeted CLI tests**

Run: `npm test -- test/cli.test.mjs`
Expected: PASS

### Task 3: Expand docs and examples

**Files:**
- Modify: `README.md`
- Modify: `QUICKSTART.md`
- Modify: `HUMAN_SETUP.md`

- [ ] **Step 1: Add `doctor` to command overviews and troubleshooting flows**
- [ ] **Step 2: Add richer examples for `where`, `search`, `index`, `context-pack`, and `doctor`**
- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: PASS
