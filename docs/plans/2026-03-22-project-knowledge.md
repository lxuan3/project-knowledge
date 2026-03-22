# Project Knowledge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建 `project-knowledge` 独立仓库第一版，提供统一 Obsidian 项目知识结构、Node CLI、全文索引、统一检索结果和 lint 校验。

**Architecture:** 使用 Obsidian markdown 作为唯一真源，仓库内提供模板、schema、frontmatter 校验和本地索引器。索引先采用全文检索思路，维护项目级和全局级两类索引视图，CLI 暴露 `write`、`index`、`search`、`lint` 四个命令，所有工具通过 skill 和 CLI 间接读写知识。

**Tech Stack:** Node.js, TypeScript, markdown/frontmatter parsing, local JSON/SQLite-style index cache, npm CLI bin

---

### Task 1: 建立仓库骨架和基础元数据

**Files:**
- Create: `README.md`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `SKILL.md`
- Create: `bin/project-knowledge`

**Step 1: Write the failing test**

创建基础 CLI 测试文件，断言：

- 执行 `project-knowledge --help` 能输出命令列表
- 命令列表包含 `write`、`index`、`search`、`lint`

**Step 2: Run test to verify it fails**

Run: `node --test test/cli.test.mjs`
Expected: FAIL because CLI files do not exist yet.

**Step 3: Write minimal implementation**

创建：

- package metadata
- bin 入口
- 最小 help 输出
- `SKILL.md` 说明单入口 skill 如何路由到 CLI

**Step 4: Run test to verify it passes**

Run: `node --test test/cli.test.mjs`
Expected: PASS

### Task 2: 加入模板与 frontmatter schema

**Files:**
- Create: `templates/overview.md`
- Create: `templates/architecture.md`
- Create: `templates/decision.md`
- Create: `templates/runbook.md`
- Create: `templates/reference.md`
- Create: `schemas/note-frontmatter.schema.json`
- Create: `test/templates.test.mjs`

**Step 1: Write the failing test**

断言：

- 每个模板存在
- 模板带必需 frontmatter 字段
- schema 要求 `project`、`doc_type`、`status`

**Step 2: Run test to verify it fails**

Run: `node --test test/templates.test.mjs`
Expected: FAIL because templates/schema do not exist yet.

**Step 3: Write minimal implementation**

添加模板和 schema，使正式笔记结构固定。

**Step 4: Run test to verify it passes**

Run: `node --test test/templates.test.mjs`
Expected: PASS

### Task 3: 实现 vault 扫描与 chunk 化

**Files:**
- Create: `src/vault/frontmatter.ts`
- Create: `src/vault/discover.ts`
- Create: `src/vault/chunk.ts`
- Create: `test/vault.test.mjs`

**Step 1: Write the failing test**

构造一个临时项目目录，断言：

- 能识别项目根目录
- 能解析 frontmatter
- 能把 markdown 切成稳定 chunk
- chunk 带 `project`、`doc_type`、`source_path`、`heading_path`

**Step 2: Run test to verify it fails**

Run: `node --test test/vault.test.mjs`
Expected: FAIL because vault parsing is not implemented.

**Step 3: Write minimal implementation**

实现：

- markdown 文件发现
- frontmatter 解析
- heading-aware chunking
- chunk record 组装

**Step 4: Run test to verify it passes**

Run: `node --test test/vault.test.mjs`
Expected: PASS

### Task 4: 实现 index 与 search

**Files:**
- Create: `src/index/store.ts`
- Create: `src/index/build.ts`
- Create: `src/search/search.ts`
- Create: `test/search.test.mjs`

**Step 1: Write the failing test**

断言：

- `index` 能生成项目索引和全局索引
- `search` 能按项目检索
- `search` 返回统一 JSON 字段

**Step 2: Run test to verify it fails**

Run: `node --test test/search.test.mjs`
Expected: FAIL because index/search are not implemented.

**Step 3: Write minimal implementation**

实现：

- 索引写入
- 索引加载
- 项目内搜索
- 全局搜索
- 统一结果格式

**Step 4: Run test to verify it passes**

Run: `node --test test/search.test.mjs`
Expected: PASS

### Task 5: 实现 lint 与 write

**Files:**
- Create: `src/lint/lint.ts`
- Create: `src/commands/write.ts`
- Create: `test/lint.test.mjs`

**Step 1: Write the failing test**

断言：

- 缺少 frontmatter 必填字段时 lint 失败
- 错误目录结构时 lint 失败
- `write` 能按模板生成新笔记

**Step 2: Run test to verify it fails**

Run: `node --test test/lint.test.mjs`
Expected: FAIL because lint/write are not implemented.

**Step 3: Write minimal implementation**

实现：

- frontmatter 校验
- 项目目录结构校验
- 按模板创建笔记

**Step 4: Run test to verify it passes**

Run: `node --test test/lint.test.mjs`
Expected: PASS

### Task 6: Final verification

**Files:**
- Verify only

**Step 1: Run full test suite**

Run: `node --test test/*.test.mjs`
Expected: PASS

**Step 2: Run lint or typecheck**

Run: `npm run test`
Expected: PASS

**Step 3: Smoke-test CLI**

Run: `node bin/project-knowledge --help`
Expected: help text includes `write`, `index`, `search`, `lint`
