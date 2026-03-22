# 项目知识库 / project-knowledge

Project knowledge skill and local indexer for Obsidian-backed project RAG.

It reads project notes directly from your default Obsidian vault. It does not depend on the Obsidian app being open, and it does not require an Obsidian CLI.

Human-facing name: `项目知识库`

Internal skill / CLI name: `project-knowledge`

## Invocation Modes

Preferred day-to-day form:

```bash
project-knowledge --help
```

If the command is not in `PATH`, use the repo-local form:

```bash
node bin/project-knowledge --help
```

Cross-platform repo-local fallback:

```bash
npm run cli -- --help
```

Optional convenience shim setup:

```bash
npm link
project-knowledge --help
```

On some Windows setups `npm link` does not reliably expose `project-knowledge.cmd`. If that happens, keep using `node bin/project-knowledge ...` or `npm run cli -- ...`.

## Current install recommendation

For Codex and similar tools, prefer `git clone` + repo-local invocation.

Do not rely on a repo-root `skill-installer --path .` flow yet. Current installers that sparse-check out `.` may copy only top-level files and miss `bin/`, `src/`, and `templates/`.

## Commands

- `project-knowledge write`
- `project-knowledge index`
- `project-knowledge search`
- `project-knowledge context-pack`
- `project-knowledge config`
- `project-knowledge lint`

## Default paths

By default, the CLI loads `~/.project-knowledge/config.json`.

Example config:

```json
{
  "vaultRoot": "/path/to/your/default/obsidian/vault",
  "indexRoot": "/path/to/local/project-knowledge/index",
  "retrievalBackend": "auto",
  "lancedbUri": "/path/to/local/project-knowledge/lancedb"
}
```

This means you can run commands directly against markdown files in your default Obsidian vault without passing
`--vault-root` or `--index-root` every time.

## Retrieval Backend

The CLI now supports two local retrieval layers:

- JSON index: the original fallback backend
- LanceDB: the preferred backend when available

Config values:

- `retrievalBackend: "auto"`: prefer LanceDB, fall back to JSON
- `retrievalBackend: "json"`: force the original JSON backend
- `retrievalBackend: "lancedb"`: force LanceDB and fail if it is unavailable

The `index` command continues to write JSON indexes. In `auto` or `lancedb` mode it also writes LanceDB rows.

## Config Commands

Inspect the current effective config:

```bash
project-knowledge config get
```

Update one supported key:

```bash
project-knowledge config set lancedbUri /path/to/local/project-knowledge/lancedb
```

Allowed keys:

- `vaultRoot`
- `indexRoot`
- `retrievalBackend`
- `lancedbUri`

## Current status

This repository is in early bootstrap. The first version standardizes:

- Obsidian project note structure
- frontmatter schema
- local index/search command surface
- linting rules for project notes
