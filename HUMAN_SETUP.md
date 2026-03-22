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
  "lancedbUri": "/path/to/local/project-knowledge/lancedb",
  "remoteBaseUrl": null,
  "remotePrimaryUrl": null,
  "remoteBackupUrl": null
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
project-knowledge --help
```

If the command is not in `PATH` yet:

```bash
cd <repo-root>
node bin/project-knowledge --help
```

Cross-platform repo-local fallback:

```bash
cd <repo-root>
npm run test
npm run cli -- --help
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
- `remoteBaseUrl`: if set, `search` and `context-pack` use the remote HTTP service instead of local indexes
- `remotePrimaryUrl`: preferred remote service URL
- `remoteBackupUrl`: backup remote service URL

Remote priority:

1. `remotePrimaryUrl`
2. `remoteBackupUrl`
3. `remoteBaseUrl`
4. local fallback

Search:

```bash
project-knowledge search --project openclaw-dashboard --query "skill manager"
```

Build a context pack:

```bash
project-knowledge context-pack --project openclaw-dashboard --query "skill manager"
```

Inspect current config:

```bash
project-knowledge config get
```

Update LanceDB path:

```bash
project-knowledge config set lancedbUri /path/to/local/project-knowledge/lancedb
```

Set a remote query server:

```bash
project-knowledge config set remoteBaseUrl http://192.168.0.148:7357
```

```bash
project-knowledge config set remotePrimaryUrl http://192.168.0.148:7357
project-knowledge config set remoteBackupUrl http://100.112.159.108:7357
```

On a secondary machine that only queries another computer's service, `remoteBaseUrl` is the key setting. That machine does not need its own LanceDB install.

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

Reinstalling the skill does not reset `~/.project-knowledge/config.json`.

## What not to do

- do not treat the local index as the source of truth
- do not store project notes primarily in the index
- do not let tools write arbitrary markdown without linting
