# AI Integration

This document is for AI tools and agents that need to use `project-knowledge`.

## Identity

- Human-facing name: `项目知识库`
- Internal skill / tool id: `project-knowledge`

## Source of truth

- Obsidian markdown is the only source of truth
- the tool reads markdown directly from the default Obsidian vault
- it does not depend on the Obsidian app being open
- it does not require an Obsidian CLI
- local index is rebuildable cache
- do not treat the index as canonical project memory

## Repository

Resolve the repository root first. Treat the checked-out repo as `<repo-root>`.

Preferred invocation option:

```bash
project-knowledge
```

If the command is not available in `PATH`, fall back from the repo root:

```bash
node bin/project-knowledge <command>
```

Cross-platform repo-local fallback:

```bash
npm run cli -- <command>
```

Do not assume `npm link` always exposes a stable global command on Windows. Use `node bin/project-knowledge ...` or `npm run cli -- ...` when needed.

Current limitation:

- do not assume a generic repo-root skill installer can install this repository correctly via `--path .`
- prefer cloning the repo locally, then running `project-knowledge ...`

Default config file:

```bash
~/.project-knowledge/config.json
```

The `vaultRoot` in that config should point to the default Obsidian vault root, not to a single project subfolder.

Retrieval config in the same file:

- `retrievalBackend`: `auto`, `json`, or `lancedb`
- `lancedbUri`: local LanceDB storage path

## Expected behavior

When working on a project:

1. Prefer `project-knowledge search` before making assumptions
2. Prefer `project-knowledge context-pack` when the task needs structured project context
3. Prefer `project-knowledge write` for formal notes
4. Prefer `project-knowledge lint` after restructuring or bulk edits
5. Prefer `project-knowledge index` after note creation, moves, or renames
6. If `retrievalBackend` is `auto`, expect the tool to prefer LanceDB and fall back to JSON automatically

## Supported commands

### List projects

```bash
project-knowledge list-projects
```

### Search project knowledge

```bash
project-knowledge search \
  --project openclaw-dashboard \
  --query "skill manager"
```

### Build a context pack

```bash
project-knowledge context-pack \
  --project openclaw-dashboard \
  --query "skill manager"
```

### Lint a project

```bash
project-knowledge lint \
  --project openclaw-dashboard
```

### Rebuild index

```bash
project-knowledge index
```

### Inspect current config

```bash
project-knowledge config get
```

### Update one config key

```bash
project-knowledge config set lancedbUri /path/to/local/project-knowledge/lancedb
```

### Create a note

```bash
project-knowledge write \
  --project openclaw-dashboard \
  --doc-type decision \
  --title "Repo First Sync"
```

## Usage policy

### When to search

Search first when:

- the task references an existing project
- the task may depend on prior decisions
- the task may have an existing runbook
- the task is likely to repeat previous work

### When to use context-pack

Use `context-pack` when:

- the task is complex enough to need overview + architecture + decisions together
- the agent should receive structured context instead of a flat search list
- you want a stable higher-level interface that can later swap its retrieval backend

### When to write

Write only for formal project knowledge:

- overview
- architecture
- decision
- runbook
- reference

Do not use this system for temporary scratch reasoning unless the project intentionally keeps scratch notes.

### When to lint

Run lint after:

- moving notes
- renaming notes
- bulk edits
- creating or restructuring a project knowledge folder

### When to index

Run index after:

- adding notes
- deleting notes
- renaming notes
- changing folder structure
- enabling LanceDB for the first time

## Do not

- do not directly invent note structure when the CLI can create it
- do not assume the index is up to date after file moves
- do not rewrite the knowledge model per tool
- do not bypass project names and read arbitrary markdown trees unless necessary

## Integration recommendation

For first-phase integration:

- use this repo directly from git
- do not require packaging or publishing
- call the CLI from your workflow

Only add MCP or service layers after the CLI workflow is stable.
