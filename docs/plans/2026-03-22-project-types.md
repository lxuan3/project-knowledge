# Project Types Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 `project-knowledge` 增加 `engineering / knowledge / content` 三类项目类型的最小 MVP 支持，覆盖模板、`write`、schema 和 lint 的最小扩展，同时不破坏现有 engineering 项目链路。

**Architecture:** 保持现有 CLI 和检索体系不变，在元数据层增加 `project_type`，在模板层增加 knowledge/content 需要的最小 `doc_type`，让 `write` 能按新 `doc_type` 落到对应目录，lint 和 schema 先做宽松合法性检查。

**Tech Stack:** Node.js, existing CLI, template files, JSON schema, current lint pipeline

---

### Task 1: 扩展 schema 和模板元数据

**Files:**
- Update: `schemas/note-frontmatter.schema.json`
- Update: existing templates as needed
- Create: `templates/landscape.md`
- Create: `templates/hypothesis.md`
- Create: `templates/idea.md`
- Create: `templates/experiment.md`
- Create: `templates/strategy.md`
- Create: `templates/topic.md`
- Create: `templates/production.md`
- Update: `test/templates.test.mjs`

**Step 1: Write the failing test**

断言：

- schema 接受 `project_type`
- 新模板文件存在
- 新模板包含 `project_type`、`project`、`doc_type`、`status`

**Step 2: Run test to verify it fails**

Run: `node --test test/templates.test.mjs`
Expected: FAIL because new templates and schema support do not exist yet.

**Step 3: Write minimal implementation**

实现：

- schema 增加 `project_type`
- 新模板落盘
- 旧模板补齐 `project_type` 占位

**Step 4: Run test to verify it passes**

Run: `node --test test/templates.test.mjs`
Expected: PASS

### Task 2: 扩展 write 命令支持新的 doc_type 和目录映射

**Files:**
- Update: `src/commands/write.mjs`
- Update: `bin/project-knowledge` if needed
- Update: `test/lint.test.mjs`

**Step 1: Write the failing test**

断言：

- `write --doc-type hypothesis` 能写到 `02-hypotheses/`
- `write --doc-type strategy` 能写到 `01-strategy.md` 或对应固定路径
- `write --doc-type topic` 能写到 `02-topics/`
- frontmatter 中保留正确 `doc_type`

**Step 2: Run test to verify it fails**

Run: `node --test test/lint.test.mjs`
Expected: FAIL because write does not yet support new types.

**Step 3: Write minimal implementation**

实现：

- 扩展 `doc_type -> template`
- 扩展 `doc_type -> output path`
- 保持现有 engineering 路径不变

**Step 4: Run test to verify it passes**

Run: `node --test test/lint.test.mjs`
Expected: PASS

### Task 3: 扩展 lint 的最小合法值支持

**Files:**
- Update: `src/lint/lint.mjs`
- Update: any frontmatter helpers if needed
- Update: `test/lint.test.mjs`

**Step 1: Write the failing test**

断言：

- `project_type: knowledge` 合法
- `project_type: content` 合法
- 新 `doc_type` 的合法文档能通过 lint
- 非法 `project_type` 仍然失败

**Step 2: Run test to verify it fails**

Run: `node --test test/lint.test.mjs`
Expected: FAIL because lint does not recognize new metadata values.

**Step 3: Write minimal implementation**

实现：

- 合法 `project_type` 集合
- 合法 `doc_type` 集合扩展
- 第一版对旧项目缺失 `project_type` 做兼容

**Step 4: Run test to verify it passes**

Run: `node --test test/lint.test.mjs`
Expected: PASS

### Task 4: 更新技能和文档说明

**Files:**
- Update: `SKILL.md`
- Update: `README.md`
- Update: `AI_INTEGRATION.md`

**Step 1: Write the failing test**

No new automated tests required.

Manual requirement:

- 文档必须明确存在三种项目类型
- 文档必须说明第一版是最小 MVP

**Step 2: Write minimal implementation**

更新：

- skill 描述
- README 项目类型说明
- AI 接入文档中的模型说明

**Step 3: Verify**

人工检查文档一致性。

### Task 5: Final verification

**Files:**
- Verify only

**Step 1: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 2: Smoke-test CLI help**

Run: `project-knowledge --help`
Expected: existing commands unchanged

**Step 3: Smoke-test representative writes**

Run:

```bash
project-knowledge write --project test-knowledge --project-root /tmp/test-knowledge --doc-type hypothesis --title "Core Assumption"
project-knowledge write --project test-content --project-root /tmp/test-content --doc-type topic --title "Episode Angle"
```

Expected:

- 文件写入到正确目录
- frontmatter 中 `doc_type` 正确

