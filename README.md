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
- Projects can live directly under `vaultRoot/<project>` or under configured spaces such as `vaultRoot/<space>/<project>`

实际需要的是：

- 不需要 Obsidian CLI
- 不需要后台运行 Obsidian
- 需要一个真实存在的 vault 根目录，里面放 markdown
- `vaultRoot` 应被视为项目知识真源位置
- 项目既可以直接位于 `vaultRoot/<project>`，也可以位于配置过的空间目录下，例如 `vaultRoot/<space>/<project>`

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

### Claude Code Plugin（推荐）

通过 Claude Code marketplace 机制安装，无需手动 clone。

在插件集合目录（如 `~/.agents/skills/`）创建 `.claude-plugin/marketplace.json`：

```json
{
  "name": "lxuan3",
  "owner": { "name": "lxuan3" },
  "plugins": [
    {
      "name": "project-knowledge",
      "source": "./project-knowledge",
      "description": "Obsidian-backed project knowledge base.",
      "skills": ["./project-knowledge"]
    }
  ]
}
```

然后在 Claude Code 中执行：

```
/plugin marketplace add ~/.agents/skills
/plugin install project-knowledge@lxuan3
/reload-plugins
```

**注意**：`"skills"` 字段是必填的，因为 `.claude-plugin/plugin.json` 中未声明 skills 路径，Claude Code 需要通过 marketplace entry 才能找到 `SKILL.md`。

### 手动安装

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

Use these as the default command map:

按这个顺序理解常用命令：

- `project-knowledge list-projects`
  - discover available projects across the vault root and configured project spaces when the slug is unclear
  - 当项目名不确定时，先列出 vault root 和已配置 project spaces 下的项目
- `project-knowledge search --project <project> --query "<query>"`
  - targeted lookup for one concrete question
  - 针对一个明确问题做精确检索
- `project-knowledge context-pack --project <project> [--query "<query>"]`
  - preload overview, architecture, decisions, and other grouped context
  - 预加载 overview、architecture、decision 等分组上下文
- `project-knowledge where --project <project> [--doc-type <type>] [--title "<title>"]`
  - inspect resolved config, project spaces, project paths, and write destination before writing
  - 在写入前检查当前配置、project spaces、项目路径和目标落点
- `project-knowledge doctor [--project <project>] [--json]`
  - diagnose config, local retrieval, remote health, and project path problems
  - 诊断配置、本地检索、远端健康状态和项目路径问题
- `project-knowledge write --project <project> --doc-type <type> --title "<title>"`
  - create a formal project-knowledge note from the standard template
  - 用标准模板创建正式项目知识 note
- `project-knowledge lint --project <project>`
  - validate note structure after reorganization or bulk edits
  - 在重组目录或批量编辑后做结构校验
- `project-knowledge index`
  - rebuild retrieval caches after note creation, move, rename, or deletion
  - 在创建、移动、重命名或删除 note 后重建检索缓存
- `project-knowledge config get`
  - inspect the currently effective configuration
  - 查看当前实际生效的配置

More examples:

- `project-knowledge help write`
- `project-knowledge help doctor`
- `project-knowledge doctor --project openclaw-dashboard --json`
- `project-knowledge where --project openclaw-dashboard --doc-type decision --title "Repo First Sync"`

## Classification Guide / 分类指南

Formal project knowledge is grouped into three project types:

- `engineering`
- `knowledge`
- `content`

正式项目知识分三类：

- `engineering`
- `knowledge`
- `content`

Classification logic:

- first choose the project type based on the primary job of the project
- then choose the doc type based on what job the note should do inside the knowledge base
- this classification should only be applied when the user explicitly wants to record something into project knowledge / 项目知识库

分类逻辑：

- 先按项目的主要职责选择项目类型
- 再按这条 note 在知识库中承担的职责选择文档类型
- 只有当用户明确表示要记录到 project knowledge / 项目知识库 时，才应用这套分类规则

Detailed classification rules:

- [classification-guide.md](/Users/hypernode/Github/project-knowledge/docs/classification-guide.md)

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
