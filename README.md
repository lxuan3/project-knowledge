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
- `project-knowledge lint`

## Default paths

By default, the CLI loads `~/.project-knowledge/config.json`.

Example config:

```json
{
  "vaultRoot": "/path/to/your/default/obsidian/vault",
  "indexRoot": "/path/to/local/project-knowledge/index"
}
```

This means you can run commands directly against markdown files in your default Obsidian vault without passing
`--vault-root` or `--index-root` every time.

## Current status

This repository is in early bootstrap. The first version standardizes:

- Obsidian project note structure
- frontmatter schema
- local index/search command surface
- linting rules for project notes
