---
name: project-knowledge
description: Use when a project uses an Obsidian knowledge base and the agent needs to search prior decisions, build task context, or write formal notes before assuming project history or writing arbitrary markdown.
compatibility: Requires Node.js 18+. Run `node bin/project-knowledge` from the checked-out repository root.
---

# 项目知识库

Use this skill when project context lives in Obsidian and should be treated as structured knowledge instead of ad hoc notes.

Human-facing name: `项目知识库`

Preferred English name: `project knowledge`

Internal id: `project-knowledge`

Accepted trigger phrases:

- `项目知识库`
- `项目知识`
- `project knowledge`
- `project context`

## Overview

Obsidian markdown is the only source of truth. Local indexes are rebuildable retrieval caches.

This skill exists to keep different tools reading and writing project knowledge the same way.

## When to Use

Use this skill when:

- working on an existing project and prior decisions may matter
- an agent needs structured project context before execution
- the user explicitly wants to record something into project knowledge / 项目知识库
- formal project knowledge should be written into the standard note layout
- notes were moved, renamed, or reorganized and need validation
- the retrieval cache may be stale after note changes

Do not use this skill for:

- meeting archive flows unless the user explicitly asks to write a distilled result into project knowledge
- raw transcripts, raw minutes, or generic note archiving
- temporary scratch reasoning that should stay outside the formal knowledge base
- one-off freeform markdown when no project structure is required

## Core Rules

- Search or build a context pack before assuming project history
- Only enter the formal `project-knowledge` write flow when the user explicitly asks to record something into project knowledge / 项目知识库
- Use `write` for formal knowledge instead of hand-writing random markdown files
- Treat Obsidian markdown as canonical; never treat the local index as canonical memory
- Run `lint` after restructuring, bulk edits, or project knowledge cleanup
- Run `index` after note creation, deletion, rename, or folder moves

## Invocation

Two modes depending on how the tool is installed:

```bash
# Preferred from a checked-out repo:
node bin/project-knowledge <command>

# Fallback from the repo root:
npm run cli -- <command>

# Optional if installed globally / via npm link:
project-knowledge <command>
```

Prefer the repo-local form when the repository is available. Use the global form only as a convenience shortcut.

## Workflow

### 0. Discover available projects

When the target project name is unknown:

```bash
project-knowledge list-projects
```

### 1. Read existing project context

For targeted lookup:

```bash
project-knowledge search \
  --project <project> \
  --query "<query>"
```

For structured preload context:

```bash
project-knowledge context-pack \
  --project <project> \
  [--query "<query>"]
```

- Use **`search`** when you know what you're looking for and want targeted evidence.
- Use **`context-pack`** when the task is complex or unfamiliar and needs overview + architecture + decisions together. `--query` is optional.

### 2. Write formal project knowledge

Each project is a single `.md` file at `<vaultRoot>/<project>.md`. All knowledge lives inside that file under `##` section headings.

**Creating a new project file (first time):**

```bash
project-knowledge write \
  --project <project> \
  --project-type <engineering|knowledge|content>
```

**Appending an entry to an existing project file:**

```bash
project-knowledge write \
  --project <project> \
  --doc-type <decision|runbook|reference|hypothesis|idea|experiment|topic|production> \
  --title "<title>"
```

The CLI creates the project file with standard frontmatter and section headings, or appends a new dated entry under the matching `##` section.

Before calling `write`, the agent should explicitly state:

- chosen `project-type` (only needed when creating a new project file)
- chosen `doc-type` and section it will append to
- one-sentence reason for that classification

This is not a hard approval gate. The default is to continue. But the classification must be visible to the human so they can correct it if needed.

For the detailed classification rules, see:

- `docs/classification-guide.md`

### 3. Validate and refresh

After structural edits:

```bash
project-knowledge lint \
  --project <project>
```

After note creation, rename, move, or delete:

```bash
project-knowledge index
```

## Command Map

| Command | Purpose | When |
|---|---|---|
| `list-projects` | list available projects | project name unknown |
| `search` | targeted evidence retrieval | specific lookup |
| `context-pack` | structured task context | complex / unfamiliar task |
| `write` | create formal note from template | adding project knowledge |
| `lint` | validate note structure | after restructuring or bulk edits |
| `index` | rebuild retrieval cache | after note create / rename / move / delete |

## Anti-Patterns

- reading arbitrary markdown trees directly instead of going through the CLI
- writing formal notes by hand without using `write` (loses standard frontmatter and folder placement)
- treating the index as canonical — Obsidian markdown is always the source of truth
- skipping `lint` after restructuring, then assuming the knowledge base is healthy
- skipping `index` after renames or moves, then trusting retrieval results
- assuming project history without running `search` or `context-pack` first

## References

- repository guidance: `AI_INTEGRATION.md`
- quickstart: `QUICKSTART.md`
