# Project Knowledge Design

**Goal:** 构建一个独立仓库 `project-knowledge`，提供基于 Obsidian 项目笔记的统一知识写入规范、本地可重建索引和统一检索入口，供 Codex、Claude、Gemini、OpenCode、OpenClaw 和 Claude Cowork 复用。

## Context

当前需求有几个明确约束：

- 知识真源必须放在 Obsidian 中，便于人类整理和通过 Obsidian Sync 跨电脑同步
- 不能把数据库当作唯一真源，因为用户有多台电脑
- 需要支持多个工具和 agent 统一检索，而不是每个工具各做一套 markdown 读取逻辑
- 想通过 skill 统一读写格式和检索方式

因此系统必须区分：

- 真源：Obsidian markdown
- 派生物：本地索引缓存
- 统一入口：skill + CLI

## Options Considered

### Option 1: 只用 Obsidian，不做本地索引层

优点：
- 最简单
- 完全没有派生缓存

缺点：
- 检索质量不稳定，主要停留在关键词层
- 多工具共用时缺少统一结构化返回
- agent 不适合直接做 markdown 全量扫描

### Option 2: Obsidian 真源 + 本地全文索引 + 统一 skill/CLI

优点：
- 保持 Obsidian 为唯一真源
- 本地索引可重建，适合多电脑
- 第一版复杂度可控
- 统一读写和检索接口

缺点：
- 第一版仍需要定义模板、schema 和索引格式
- 需要本地 index rebuild 流程

### Option 3: 一开始就做中心化 RAG 服务

优点：
- 所有设备直接查同一服务
- 结果一致

缺点：
- 部署和运维明显更重
- 网络、权限、稳定性问题提前引入
- 与“Obsidian Sync + 多机本地检索”模式不匹配

## Decision

采用 Option 2。

第一版 `project-knowledge` 是一个独立 Node.js 仓库，包含：

- 单入口 skill
- 固定模板和 frontmatter schema
- 本地 markdown 扫描和 chunking
- 本地全文索引
- 统一 JSON 检索输出
- lint 校验命令

Obsidian 是唯一真源。本地索引只是缓存，不进入 Obsidian Sync，也不作为唯一存储。

## Design

### Repository Shape

仓库结构：

```text
project-knowledge/
  README.md
  package.json
  SKILL.md
  docs/plans/
  templates/
  schemas/
  src/
  bin/
```

### Obsidian Project Structure

每个项目在 Obsidian 中固定为：

```text
<ProjectRoot>/
  00-overview.md
  01-architecture.md
  02-decisions/
  03-runbooks/
  04-reference/
  90-scratch/
```

每篇正式笔记带统一 frontmatter：

```yaml
---
project: openclaw-dashboard
doc_type: decision
status: active
tags: [skills, architecture]
updated_at: 2026-03-22
aliases: [skill manager repo sync]
---
```

### Command Surface

第一版 CLI 只支持 4 个命令：

- `write`
- `index`
- `search`
- `lint`

### Index Model

索引分两层：

- `projects/<project>/`
- `global/`

每条记录是 chunk 级，至少包含：

- `chunk_id`
- `project`
- `doc_type`
- `source_path`
- `source_relpath`
- `title`
- `heading_path`
- `status`
- `tags`
- `aliases`
- `content`
- `chunk_index`
- `updated_at`
- `token_count`

### Search Model

统一返回结构化结果，而不是原始 markdown 文件：

- `project`
- `doc_type`
- `title`
- `heading_path`
- `source_path`
- `snippet`
- `score`
- `updated_at`

### Non-Goals

第一版不做：

- 向量数据库
- 中心化服务
- MCP server
- 自动写回 Obsidian Sync 配置
- 多用户权限系统

## Testing

第一版至少覆盖：

- markdown + frontmatter 解析
- 项目目录识别
- chunk 输出稳定性
- 索引写入与读取
- search 结果格式
- lint 对非法 frontmatter 和非法目录结构的报错
