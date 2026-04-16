# Human Setup

This document is the detailed setup and operations guide for the human operator.

## 1. What `project-knowledge` depends on

Source of truth:

- markdown files inside your Obsidian-style vault

What it does not require:

- the Obsidian desktop app to be running
- an Obsidian CLI
- Obsidian Sync

What it does require:

- a stable vault root directory
- one subdirectory per project under that vault root, or configured project spaces such as `vaultRoot/Openclaw/<project>`, unless you pass `--project-root`
- markdown notes created with the expected templates or layout

Default assumption:

- `vaultRoot` points to your default project-knowledge vault root
- each project lives under `vaultRoot/<project>` unless `projectSpaces` is configured

Example:

```text
/path/to/vault/
  openclaw-dashboard.md
  brand-strategy.md
  project-knowledge-tool.md
```

## 2. Install the repo

### Step 1: Clone and install / 克隆并安装

```bash
git clone https://github.com/lxuan3/project-knowledge
cd project-knowledge
npm install
```

Optional global shortcut:

```bash
npm link
project-knowledge --help
```

Cross-platform fallback:

```bash
node bin/project-knowledge --help
```

```bash
npm run cli -- --help
```

If Windows does not expose `project-knowledge.cmd` reliably after `npm link`, use one of the repo-local forms above.

### Step 2: Install the skill / 安装 skill

The skill directory structure differs between Claude Code and Codex.

#### Claude Code

Claude Code reads skills from subdirectories inside its skills directory.
The skill file is at `project-knowledge/project-knowledge/SKILL.md`.

```bash
mkdir -p ~/.agents/skills
ln -s /path/to/project-knowledge ~/.agents/skills/project-knowledge
```

Result: `~/.agents/skills/project-knowledge/project-knowledge/SKILL.md` ✓

If your Claude Code uses a custom `skillsDirectory` configured in `~/.claude/settings.json`,
replace `~/.agents/skills` with that path.

#### Codex

Codex reads the skill directly from the root of the linked directory.
The skill file is at `project-knowledge/SKILL.md`.

```bash
mkdir -p ~/.codex/skills
ln -s /path/to/project-knowledge ~/.codex/skills/project-knowledge
```

Result: `~/.codex/skills/project-knowledge/SKILL.md` ✓

## 3. Create local config

Config file path:

- macOS / Linux: `~/.project-knowledge/config.json`
- Windows: `%USERPROFILE%\\.project-knowledge\\config.json`

Minimal example:

```json
{
  "vaultRoot": "/path/to/your/obsidian",
  "projectSpaces": ["Openclaw"],
  "indexRoot": "/path/to/local/project-knowledge/index",
  "retrievalBackend": "auto",
  "lancedbUri": "/path/to/local/project-knowledge/lancedb",
  "remoteBaseUrl": null,
  "remotePrimaryUrl": null,
  "remoteBackupUrl": null
}
```

Meaning of each field:

- `vaultRoot`: default source-of-truth vault root
- `projectSpaces`: optional second-level directories to scan, such as `["Openclaw"]`
- `indexRoot`: local JSON retrieval cache
- `retrievalBackend`: `auto`, `json`, or `lancedb`
- `lancedbUri`: local LanceDB storage directory
- `remoteBaseUrl`: generic remote query endpoint
- `remotePrimaryUrl`: preferred remote query endpoint
- `remoteBackupUrl`: backup remote query endpoint

Remote priority:

1. `remotePrimaryUrl`
2. `remoteBackupUrl`
3. `remoteBaseUrl`
4. local fallback

Resolution rule:

1. `vaultRoot/<project>`
2. each configured `vaultRoot/<space>/<project>`
3. explicit `--project-root`

## 4. LanceDB setup

LanceDB is optional. You only need it if you want LanceDB-backed retrieval instead of JSON-only retrieval.

The repository already declares the dependency in `package.json`, so the normal setup is simply:

```bash
npm install
```

Then set a local storage path:

```bash
project-knowledge config set lancedbUri /path/to/local/project-knowledge/lancedb
```

If you want LanceDB enabled by default:

```bash
project-knowledge config set retrievalBackend lancedb
```

If you want automatic fallback:

```bash
project-knowledge config set retrievalBackend auto
```

Notes:

- `lancedbUri` is always a local filesystem path
- you should not point `lancedbUri` at an Obsidian-synced folder
- LanceDB is a cache, not the source of truth
- after enabling or moving LanceDB, run `project-knowledge index`

If one machine only uses another machine's remote query server, that client machine does not need its own LanceDB setup.

## 5. Verify resolved paths

Inspect the effective config and path resolution:

```bash
project-knowledge where
```

Inspect a specific project:

```bash
project-knowledge where --project openclaw-dashboard
```

Preview the exact write destination before creating a note:

```bash
project-knowledge where \
  --project openclaw-dashboard \
  --doc-type decision \
  --title "Repo First Sync"
```

The output is JSON so it is easy to read in a terminal and easy to consume from scripts or agents.

Typical fields:

- `configPath`
- `vaultRoot`
- `indexRoot`
- `lancedbUri`
- `projectRoot`
- `writePath`

If the values look wrong or retrieval still fails, run active diagnostics:

```bash
project-knowledge doctor
```

```bash
project-knowledge doctor --project openclaw-dashboard
```

```bash
project-knowledge doctor --project openclaw-dashboard --json
```

## 6. Daily commands

Show help:

```bash
project-knowledge --help
```

Show command-specific help:

```bash
project-knowledge help write
```

Show effective config:

```bash
project-knowledge config get
```

List projects:

```bash
project-knowledge list-projects
```

Rebuild local indexes:

```bash
project-knowledge index
```

Search:

```bash
project-knowledge search --project openclaw-dashboard --query "skill manager"
```

Global search:

```bash
project-knowledge search --query "incident response" --scope global
```

Build a context pack:

```bash
project-knowledge context-pack --project openclaw-dashboard --query "skill manager"
```

Build a whole-project context pack without a query:

```bash
project-knowledge context-pack --project openclaw-dashboard
```

Run active diagnostics:

```bash
project-knowledge doctor --project openclaw-dashboard
```

Get machine-readable diagnostics:

```bash
project-knowledge doctor --project openclaw-dashboard --json
```

Write a note:

```bash
project-knowledge write --project openclaw-dashboard --doc-type decision --title "Repo First Sync"
```

Lint a project:

```bash
project-knowledge lint --project openclaw-dashboard
```

Run the HTTP server:

```bash
project-knowledge serve --host 127.0.0.1 --port 7357
```

## 7. `write` path rules

`write` resolves the target in this order:

1. `--doc-type overview` (or omitted): creates `vaultRoot/<project>.md` from the full project template
2. Any other `--doc-type`: appends a dated entry under the matching `##` section heading in the existing project file

Examples:

- `project-knowledge write --project openclaw-dashboard` → creates `openclaw-dashboard.md`
- `project-knowledge write --project openclaw-dashboard --doc-type decision --title "Use LanceDB"` → appends under `## Decisions`
- `project-knowledge write --project openclaw-dashboard --doc-type runbook --title "Deploy Rollback"` → appends under `## Runbooks`

Use `where --project <name>` to inspect the resolved project file path.

## 8. Remote usage

Set a single remote endpoint:

```bash
project-knowledge config set remoteBaseUrl http://192.168.0.148:7357
```

Set primary and backup remote endpoints:

```bash
project-knowledge config set remotePrimaryUrl http://192.168.0.148:7357
project-knowledge config set remoteBackupUrl http://100.112.159.108:7357
```

On a secondary machine that only queries a remote server:

- `remoteBaseUrl` or `remotePrimaryUrl` is the key setting
- local LanceDB is optional
- local JSON indexes are optional if you are comfortable depending on the remote service

## 9. Upgrade workflow

```bash
cd <repo-root>
git pull
npm install
npm test
project-knowledge index
project-knowledge doctor
```

If you run the local HTTP server manually, restart it after upgrading.

If you use a managed service wrapper, restart that wrapper after upgrading.

Reinstalling the skill or recloning the repo does not reset `~/.project-knowledge/config.json`.

## 10. What not to do

- do not treat the JSON index or LanceDB as the source of truth
- do not sync caches through Obsidian Sync
- do not let agents write arbitrary markdown outside the expected structure and then skip linting
- do not assume `write` targets a cache directory; it writes into project knowledge markdown
