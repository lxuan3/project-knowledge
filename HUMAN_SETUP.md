# Human Setup

This document is for the human operator.

## Repository

Repository root:

```bash
<repo-root>
```

## Local config

Create:

```bash
~/.project-knowledge/config.json
```

Example:

```json
{
  "vaultRoot": "/path/to/your/default/obsidian/vault",
  "indexRoot": "/path/to/local/project-knowledge/index",
  "retrievalBackend": "auto",
  "lancedbUri": "/path/to/local/project-knowledge/lancedb"
}
```

## Assumptions

- Obsidian markdown is the source of truth
- the tool reads markdown directly from the default Obsidian vault
- it does not require the Obsidian app or an Obsidian CLI
- local index is rebuildable cache
- do not sync the index through Obsidian Sync

## Verify install

```bash
cd <repo-root>
npm run test
node bin/project-knowledge --help
```

Optional local install:

```bash
cd <repo-root>
npm link
project-knowledge --help
```

## Daily commands

List projects:

```bash
project-knowledge list-projects
```

Lint a project:

```bash
project-knowledge lint --project openclaw-dashboard
```

Rebuild index:

```bash
project-knowledge index
```

Backend behavior:

- `retrievalBackend: "auto"`: prefer LanceDB, fall back to JSON
- `retrievalBackend: "json"`: use only the original JSON backend
- `retrievalBackend: "lancedb"`: require LanceDB

Search:

```bash
project-knowledge search --project openclaw-dashboard --query "skill manager"
```

Build a context pack:

```bash
project-knowledge context-pack --project openclaw-dashboard --query "skill manager"
```

Write a note:

```bash
project-knowledge write --project openclaw-dashboard --doc-type decision --title "Repo First Sync"
```

## Upgrade workflow

If another tool or AI updates this repo:

```bash
cd <repo-root>
git pull
npm run test
```

Then rebuild index if note structure or parsing changed:

```bash
project-knowledge index
```

If you enable LanceDB, rebuild once so both JSON and LanceDB stay in sync.

## What not to do

- do not treat the local index as the source of truth
- do not store project notes primarily in the index
- do not let tools write arbitrary markdown without linting
