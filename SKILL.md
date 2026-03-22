---
name: project-knowledge
description: Use when a project uses an Obsidian knowledge base and the agent needs to search prior decisions, build task context, or write formal notes before assuming project history or writing arbitrary markdown.
---

# 项目知识库

Use this skill when project context lives in Obsidian and should be treated as structured knowledge instead of ad hoc notes.

Human-facing name: `项目知识库`

Internal id: `project-knowledge`

## Overview

Obsidian markdown is the only source of truth. Local indexes are rebuildable retrieval caches.

This skill exists to keep different tools reading and writing project knowledge the same way.

## When to Use

Use this skill when:

- working on an existing project and prior decisions may matter
- an agent needs structured project context before execution
- formal project knowledge should be written into the standard note layout
- notes were moved, renamed, or reorganized and need validation
- the retrieval cache may be stale after note changes

Do not use this skill for:

- temporary scratch reasoning that should stay outside the formal knowledge base
- one-off freeform markdown when no project structure is required

## Core Rules

- Search or build a context pack before assuming project history
- Use `write` for formal knowledge instead of hand-writing random markdown files
- Treat Obsidian markdown as canonical; never treat the local index as canonical memory
- Run `lint` after restructuring, bulk edits, or project knowledge cleanup
- Run `index` after note creation, deletion, rename, or folder moves

## Invocation

Two modes depending on how the tool is installed:

```bash
# From a checked-out repo (locate root first):
git rev-parse --show-toplevel   # find repo root
project-knowledge <command>

# If installed globally / via npm link:
project-knowledge <command>
```

Prefer the global form when available. Fall back to `project-knowledge` only when working directly inside the repo.

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

Create formal notes through the CLI so folder placement and frontmatter stay consistent:

```bash
project-knowledge write \
  --project <project> \
  --doc-type <overview|architecture|decision|runbook|reference> \
  --title "<title>"
```

The CLI creates the file with standard frontmatter and a template body. Edit the generated file to add actual content.

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
