# 项目知识库 / project-knowledge

`project-knowledge` is a project knowledge workflow for Obsidian-backed markdown.

`project-knowledge` 是一套围绕 Obsidian markdown 的项目知识工作流，用来统一项目知识的写入、索引、检索和跨工具复用。

Repository / 仓库地址:

- `https://github.com/lxuan3/project-knowledge`

## What It Is / 它是什么

This repository contains:

- a local CLI
- indexing and retrieval logic
- optional LanceDB-backed retrieval cache
- a lightweight HTTP query server
- integration docs for humans and AI tools

这个仓库包含：

- 本地 CLI
- 索引与检索逻辑
- 可选的 LanceDB 检索缓存
- 轻量 HTTP 查询服务
- 面向人类和 AI 的接入文档

Core rule / 核心规则:

- Obsidian markdown is the source of truth
- JSON index and LanceDB are rebuildable caches
- agents should query project knowledge before assuming project history

- Obsidian markdown 才是真源
- JSON index 和 LanceDB 都只是可重建缓存
- agent 不应在未检索项目前提下假设项目历史

## Dependencies / 依赖边界

`project-knowledge` depends on an Obsidian-style vault layout, not on the Obsidian app process itself.

`project-knowledge` 依赖的是 Obsidian 风格的 vault 目录结构，而不是 Obsidian 应用进程本身。

Important:

- You do not need an Obsidian CLI
- You do not need Obsidian running in the background
- You do need markdown files stored under a vault root
- You should treat `vaultRoot` as the canonical location for project notes

- 不需要 Obsidian CLI
- 不需要后台运行 Obsidian
- 需要一个真实存在的 vault 根目录，里面放 markdown
- `vaultRoot` 应被视为项目知识真源位置

LanceDB is optional:

- `retrievalBackend: "auto"` prefers LanceDB and falls back to JSON
- `retrievalBackend: "json"` disables LanceDB use
- `retrievalBackend: "lancedb"` requires LanceDB to be usable

## Install / 安装

```bash
git clone https://github.com/lxuan3/project-knowledge
cd project-knowledge
npm install
```

Preferred invocation order:

```bash
project-knowledge --help
```

```bash
node bin/project-knowledge --help
```

```bash
npm run cli -- --help
```

Command-specific help:

```bash
project-knowledge help write
```

If you want a global shim:

```bash
npm link
```

If Windows does not expose `project-knowledge.cmd` reliably after `npm link`, keep using:

```bash
node bin/project-knowledge --help
```

or:

```bash
npm run cli -- --help
```

## Core Commands / 核心命令

```bash
project-knowledge help write
project-knowledge help doctor
project-knowledge doctor --project openclaw-dashboard
project-knowledge where --project openclaw-dashboard
project-knowledge list-projects
project-knowledge index
project-knowledge search --project openclaw-dashboard --query "skill manager"
project-knowledge context-pack --project openclaw-dashboard --query "skill manager"
project-knowledge write --project openclaw-dashboard --doc-type decision --title "Repo First Sync"
project-knowledge lint --project openclaw-dashboard
project-knowledge config get
```

Use `where` to inspect resolved paths before writing:

```bash
project-knowledge where \
  --project openclaw-dashboard \
  --doc-type decision \
  --title "Repo First Sync"
```

Use `doctor` to actively probe local and remote setup:

```bash
project-knowledge doctor
```

```bash
project-knowledge doctor --project openclaw-dashboard
```

```bash
project-knowledge doctor --project openclaw-dashboard --json
```

## Docs / 文档入口

Use these documents by audience:

- [HUMAN_SETUP.md](/Users/hypernode/Github/project-knowledge/HUMAN_SETUP.md): detailed setup, Obsidian assumptions, LanceDB notes, config paths, command catalog
- [QUICKSTART.md](/Users/hypernode/Github/project-knowledge/QUICKSTART.md): fastest path to first successful command
- [AI_INTEGRATION.md](/Users/hypernode/Github/project-knowledge/AI_INTEGRATION.md): guidance for AI tool integration
- [PROMPTS.md](/Users/hypernode/Github/project-knowledge/PROMPTS.md): reusable prompts and usage conventions

## Typical Workflow / 常见工作流

1. Use `where` or `config get` to confirm resolved paths.
2. Use `list-projects` if the project slug is unclear.
3. Run `doctor` first if setup looks wrong or retrieval behaves unexpectedly.
4. Run `search` for focused questions.
5. Run `context-pack` for unfamiliar tasks.
6. Use `write` to create formal knowledge notes.
7. Run `lint` after reorganizing or batch-editing project notes.
8. Run `index` after note changes so local retrieval stays fresh.
