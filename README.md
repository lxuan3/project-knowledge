# 项目知识库 / project-knowledge

Project knowledge skill and local indexer for Obsidian-backed project RAG.

It reads project notes directly from your default Obsidian vault. It does not depend on the Obsidian app being open, and it does not require an Obsidian CLI.

Human-facing name: `项目知识库`

Internal skill / CLI name: `project-knowledge`

## Invocation Modes

From the repository root:

```bash
node bin/project-knowledge --help
```

Or install a local global shim:

```bash
npm link
project-knowledge --help
```

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
