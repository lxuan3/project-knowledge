# 项目知识库 / project-knowledge

`project-knowledge` is a project knowledge workflow for Obsidian-backed engineering notes.

`project-knowledge` 是一套基于 Obsidian 的项目知识工作流，面向工程项目、agent 和多设备检索。

It standardizes how project knowledge is written, indexed, queried, and shared across tools like Codex, Claude, OpenClaw, and Cowork.

它统一了项目知识的写入、索引、检索和跨工具复用方式，适用于 Codex、Claude、OpenClaw、Cowork 等环境。

## What It Is / 它是什么

`project-knowledge` is built around one simple rule:

`project-knowledge` 围绕一条简单规则展开：

- Obsidian markdown is the source of truth
- JSON index and LanceDB are rebuildable retrieval caches
- agents should query project knowledge before assuming project history

- Obsidian markdown 才是真源
- JSON index 和 LanceDB 都只是可重建的检索缓存
- agent 在假设项目历史之前，应先查询项目知识

This repository contains:

这个仓库包含：

- a skill definition
- a local CLI
- local indexing and retrieval logic
- a lightweight HTTP query server
- docs for humans and AI tools

- skill 定义
- 本地 CLI
- 本地索引与检索逻辑
- 一个轻量 HTTP 查询服务
- 面向人类和 AI 的接入文档

Human-facing name / 面向用户显示名:

- `项目知识库`
- `project knowledge`

Internal id / 内部正式 id:

- `project-knowledge`

## How It Works / 它如何工作

At a high level:

整体流程是：

1. Write formal project knowledge into an Obsidian vault
2. Run `project-knowledge index`
3. Query with `search` or `context-pack`
4. Optionally expose the same query node to other devices with `serve`

1. 把正式项目知识写进 Obsidian vault
2. 运行 `project-knowledge index`
3. 用 `search` 或 `context-pack` 查询
4. 如有需要，用 `serve` 把同一台主机的查询能力共享给其他设备

The default retrieval model is:

默认检索模型是：

- local JSON index
- local LanceDB
- optional remote query endpoints
- fallback instead of hard failure

- 本地 JSON index
- 本地 LanceDB
- 可选远程查询地址
- 优先 fallback，而不是直接硬失败

## Installation / 安装

`project-knowledge` currently works best as a checked-out repository plus CLI.

当前最稳的安装方式是：直接 `git clone` 仓库，然后使用 CLI。

### 1. Clone the repo / 拉代码

```bash
git clone <your-repo-url>
cd project-knowledge
```

### 2. Install dependencies / 安装依赖

```bash
npm install
```

### 3. Optional global shortcut / 可选全局快捷命令

```bash
npm link
project-knowledge --help
```

If `npm link` is unreliable on your platform, use the repo-local forms instead.

如果 `npm link` 在你的平台上不稳定，就直接用仓库内调用方式。

Preferred invocation order:

推荐调用优先级：

```bash
project-knowledge --help
```

```bash
node bin/project-knowledge --help
```

```bash
npm run cli -- --help
```

### 4. Create config / 写配置

Default config path:

默认配置路径：

- macOS / Linux: `~/.project-knowledge/config.json`
- Windows: `%USERPROFILE%\\.project-knowledge\\config.json`

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

Important:

重要说明：

- `vaultRoot` points to the default Obsidian vault root
- `lancedbUri` is always a local filesystem path
- `remotePrimaryUrl` / `remoteBackupUrl` are network addresses for remote query service

- `vaultRoot` 指向默认 Obsidian vault 根目录
- `lancedbUri` 永远是本机文件路径
- `remotePrimaryUrl` / `remoteBackupUrl` 是远程查询服务地址

## Verify Installation / 验证安装

Run this minimal sequence:

跑这组最小验证：

```bash
project-knowledge list-projects
project-knowledge index
project-knowledge search --project openclaw-dashboard --query "skill manager"
```

If these commands work, then:

如果这三步正常，说明：

- the vault path is correct
- indexing works
- retrieval works
- the CLI is usable

- vault 路径正确
- 索引正常
- 检索正常
- CLI 可用

## Basic Workflow / 基本工作流

Use this workflow for day-to-day project work:

日常项目工作建议按这个顺序走：

1. `list-projects` if the project name is unclear
2. `search` for targeted questions
3. `context-pack` for complex tasks
4. `write` for formal notes
5. `lint` after structural changes
6. `index` after note creation, rename, move, or delete

1. 如果项目名不确定，先 `list-projects`
2. 简单问题优先 `search`
3. 复杂任务优先 `context-pack`
4. 正式知识沉淀走 `write`
5. 结构变更后跑 `lint`
6. 新增、重命名、移动、删除笔记后跑 `index`

## Commands / 命令面

Core commands:

核心命令：

- `project-knowledge list-projects`
- `project-knowledge search`
- `project-knowledge context-pack`
- `project-knowledge write`
- `project-knowledge lint`
- `project-knowledge index`
- `project-knowledge config`
- `project-knowledge serve`

## Retrieval Model / 检索模型

Local retrieval layers:

本地检索层：

- JSON index: fallback backend
- LanceDB: preferred backend when available

- JSON index：fallback 后端
- LanceDB：优先后端

`retrievalBackend` supports:

`retrievalBackend` 支持：

- `"auto"`: prefer LanceDB, fall back to JSON
- `"json"`: force JSON
- `"lancedb"`: force LanceDB

- `"auto"`：优先 LanceDB，失败回退 JSON
- `"json"`：强制 JSON
- `"lancedb"`：强制 LanceDB

Remote retrieval priority:

远程优先级：

1. `remotePrimaryUrl`
2. `remoteBackupUrl`
3. `remoteBaseUrl`
4. local fallback

This makes it easy to combine LAN + Tailscale + local fallback.

这样就可以组合使用内网地址、Tailscale 地址和本地 fallback。

## HTTP Query Server / HTTP 查询服务

Start the local server:

启动本地服务：

```bash
project-knowledge serve --host 0.0.0.0 --port 7357
```

Endpoints:

接口：

- `GET /health`
- `GET /search?project=...&query=...`
- `GET /context-pack?project=...&query=...`

This is the recommended way to share one host's retrieval node with other devices.

这也是把主机查询能力共享给其他设备的推荐方式。

## Config Commands / 配置命令

Inspect current config:

查看当前配置：

```bash
project-knowledge config get
```

Update one key:

修改单个配置项：

```bash
project-knowledge config set lancedbUri /path/to/local/project-knowledge/lancedb
project-knowledge config set remotePrimaryUrl http://192.168.0.148:7357
project-knowledge config set remoteBackupUrl http://100.112.159.108:7357
```

Supported keys:

支持的配置键：

- `vaultRoot`
- `indexRoot`
- `retrievalBackend`
- `lancedbUri`
- `remoteBaseUrl`
- `remotePrimaryUrl`
- `remoteBackupUrl`

## Current Installation Recommendation / 当前安装建议

For Codex and similar tools:

对于 Codex 和类似工具：

- prefer `git clone` + direct CLI usage
- do not rely on generic repo-root skill installers yet

- 推荐 `git clone` + 直接调用 CLI
- 目前不要依赖通用的 repo-root skill installer

Some installers that sparse-check out `.` may only copy top-level files and miss `bin/`, `src/`, and `templates/`.

有些安装器如果对 `.` 做 sparse checkout，可能只复制顶层文件，漏掉 `bin/`、`src/`、`templates/`。

## Reinstall Behavior / 重装行为

Reinstalling the skill does not reset user config.

重装 skill 不会重置用户配置。

Config lives outside the repo:

配置文件在仓库外：

- macOS / Linux: `~/.project-knowledge/config.json`
- Windows: `%USERPROFILE%\\.project-knowledge\\config.json`

## Documentation / 文档入口

Repository docs:

仓库内文档：

- [QUICKSTART.md](./QUICKSTART.md)
- [HUMAN_SETUP.md](./HUMAN_SETUP.md)
- [AI_INTEGRATION.md](./AI_INTEGRATION.md)
- [PROMPTS.md](./PROMPTS.md)
- [SKILL.md](./SKILL.md)

If you also maintain an Obsidian knowledge base for this project, keep an architecture note, runbooks, decisions, and reference docs in sync there as well.

如果你也在 Obsidian 里维护这套系统，建议同步保留 architecture、runbook、decision、reference 这些文档层次。
