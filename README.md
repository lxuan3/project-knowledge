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

Boundary rule / 边界规则:

- `project-knowledge` is only for formal project knowledge
- it is not a generic archive for all Obsidian notes
- meeting archives, transcripts, raw minutes, and other non-project-knowledge records should stay in their own systems unless the user explicitly asks to record a distilled result into project knowledge

- `project-knowledge` 只负责正式项目知识
- 它不是所有 Obsidian 笔记的通用归档系统
- 会议归档、转录、原始纪要和其他非项目知识记录，应继续留在各自系统里，除非用户明确要求把提炼后的结果记入项目知识库

## Dependencies / 依赖边界

`project-knowledge` depends on an Obsidian-style vault layout, not on the Obsidian app process itself.

`project-knowledge` 依赖的是 Obsidian 风格的 vault 目录结构，而不是 Obsidian 应用进程本身。

### Obsidian / Obsidian 依赖

Why it is useful:

- Obsidian markdown is the source of truth
- notes stay human-readable, editable, and portable
- humans and agents can collaborate on the same knowledge base without inventing a custom storage format

它的好处：

- Obsidian markdown 是知识真源
- 笔记天然可读、可编辑、可迁移
- 人和 agent 可以围绕同一份知识协作，而不需要额外发明私有存储格式

What is actually required:

- You do not need an Obsidian CLI
- You do not need Obsidian running in the background
- You do need markdown files stored under a vault root
- You should treat `vaultRoot` as the canonical location for project notes

实际需要的是：

- 不需要 Obsidian CLI
- 不需要后台运行 Obsidian
- 需要一个真实存在的 vault 根目录，里面放 markdown
- `vaultRoot` 应被视为项目知识真源位置

Cost if you do not use it:

- you lose a clear canonical source and drift toward tool-local memory or cache-only workflows
- review, migration, and manual repair become harder
- cross-tool reuse becomes weaker because the knowledge is no longer grounded in plain markdown files

如果不用它，代价是：

- 你会失去明确的知识真源，系统更容易退化成“工具内部记忆”或“只剩缓存”的状态
- 审阅、迁移、手工修复都会更困难
- 跨工具复用会变弱，因为知识不再落在通用 markdown 文件里

### LanceDB / LanceDB 依赖

LanceDB is optional.

LanceDB 是可选依赖。

Install behavior:

- `npm install` will attempt to install the optional LanceDB package
- if a machine only uses remote retrieval or JSON-only retrieval, LanceDB does not need to be operationally available
- use `project-knowledge doctor` to verify whether LanceDB is actually healthy on the current machine

安装行为：

- `npm install` 会尝试安装这个可选的 LanceDB 包
- 如果某台机器只走远端检索或 JSON-only 检索，LanceDB 不需要在运行时真正可用
- 可以用 `project-knowledge doctor` 检查当前机器上的 LanceDB 是否真的健康可用

Why it is useful:

- it improves local retrieval performance
- it gives a better retrieval path for larger vaults or heavier query usage
- with `retrievalBackend: "auto"`, it can be preferred when healthy without giving up JSON fallback

它的好处：

- 能提升本地检索性能
- 对更大的 vault 或更频繁的查询更有价值
- 在 `retrievalBackend: "auto"` 下，可以优先使用它，同时保留 JSON fallback

What happens if you do not use it:

- `retrievalBackend: "json"` disables LanceDB use and keeps the system on JSON-only retrieval
- this is simpler operationally, but retrieval performance and capability may be weaker
- `doctor` should treat missing LanceDB as a warning in `auto` mode, not necessarily as a hard failure

如果不用它，会怎样：

- `retrievalBackend: "json"` 会完全关闭 LanceDB，系统退回到 JSON-only 检索
- 运维更简单，但检索性能和能力可能更弱
- 在 `auto` 模式下，`doctor` 会把缺失 LanceDB 视为降级 warning，而不一定是硬故障

Backend modes:

- `retrievalBackend: "auto"` prefers LanceDB and falls back to JSON
- `retrievalBackend: "json"` disables LanceDB use
- `retrievalBackend: "lancedb"` requires LanceDB to be usable

后端模式：

- `retrievalBackend: "auto"` 优先使用 LanceDB，不可用时回退到 JSON
- `retrievalBackend: "json"` 禁用 LanceDB
- `retrievalBackend: "lancedb"` 要求 LanceDB 必须可用

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

## Classification Guide / 分类指南

Use this guide when deciding where a formal note belongs.

当你在决定一条正式知识应该写到哪里时，用这份规则。

### Step 1: Choose Project Type / 第一步：选择项目类型

Pick the project type based on the primary job of the project:

项目类型先看这个项目的主要职责：

- `engineering`
  - software, systems, tooling, automation, architecture, operations
- `knowledge`
  - research, analysis, hypothesis building, landscape mapping, insight formation
- `content`
  - topic selection, content production, publishing workflow, distribution strategy

- `engineering`
  - 软件、系统、工具、自动化、架构、运维
- `knowledge`
  - 研究、分析、假设、认知整理、领域地图
- `content`
  - 选题、内容生产、发布流程、分发策略

### Step 2: Choose Doc Type By Responsibility / 第二步：按知识职责选择文档类型

Do not classify by writing style. Classify by the job this note should do in the knowledge base.

不要按“这篇看起来像什么”分类，要按“它在知识库里承担什么职责”分类。

- `overview`
  - what this project is, what it covers, and its current state
- `architecture`
  - how an engineering system is structured
- `landscape`
  - how a knowledge domain is structured
- `strategy`
  - high-level direction for a content project
- `decision`
  - a conclusion, tradeoff, or explicit why
- `runbook`
  - an engineering operating procedure
- `reference`
  - stable facts, APIs, conventions, or source material
- `hypothesis`
  - a claim that still needs validation
- `idea`
  - a possible direction that is not yet committed
- `experiment`
  - a test, trial, or validation record
- `topic`
  - a content topic or angle
- `production`
  - a concrete content production workflow or output plan

- `overview`
  - 项目是什么、覆盖什么、当前处于什么状态
- `architecture`
  - 工程系统是怎么组成的
- `landscape`
  - 知识领域是怎么组成的
- `strategy`
  - 内容项目的高层方向
- `decision`
  - 一个明确结论、取舍或 why
- `runbook`
  - 工程操作流程
- `reference`
  - 稳定事实、接口、约定、资料
- `hypothesis`
  - 仍待验证的判断
- `idea`
  - 尚未承诺执行的方向性想法
- `experiment`
  - 试验、验证、试跑记录
- `topic`
  - 内容选题或切入角度
- `production`
  - 具体的内容生产流程或交付计划

### Default Heuristic / 默认判断法

Ask: how will someone look for this note later?

问自己：以后别人会用什么问题来找这条知识？

- “What is this project?” -> `overview`
- “How is it structured?” -> `architecture` / `landscape` / `strategy`
- “Why did we choose this?” -> `decision`
- “How do I operate this?” -> `runbook` / `production`
- “What facts should stay stable?” -> `reference`
- “What are we testing?” -> `experiment`
- “What are we still unsure about?” -> `hypothesis`
- “What content angle should we pursue?” -> `topic`

- “这项目是什么？” -> `overview`
- “它是怎么组织的？” -> `architecture` / `landscape` / `strategy`
- “为什么这么选？” -> `decision`
- “怎么操作？” -> `runbook` / `production`
- “哪些事实需要稳定沉淀？” -> `reference`
- “我们在验证什么？” -> `experiment`
- “还有哪些判断没定？” -> `hypothesis`
- “这个内容做什么角度？” -> `topic`

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
