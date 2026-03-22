# Project Types Design

**Goal:** 在 `project-knowledge` 中引入多项目类型支持，让同一套工具既能服务研发型项目，也能服务知识型和内容型项目，而不把所有项目强行塞进单一工程模板。

## Context

当前 `project-knowledge` 的默认项目结构明显偏工程研发：

- `overview`
- `architecture`
- `decisions`
- `runbooks`
- `reference`

这套结构适合：

- 代码项目
- agent 系统
- dashboard
- 插件和服务

但不适合这些项目：

- 产品方向探索
- 品牌营销策略
- 市场和用户研究
- 内容策划、选题、制作和复盘

这些项目的中心不是“系统怎么跑”，而是：

- 背景格局
- 假设
- 想法
- 内容资产
- 实验和验证
- 策略收敛

因此需要正式把“项目类型”引入知识模型。

## Options Considered

### Option 1: 继续只保留 engineering 模板

优点：

- 实现最简单
- 不需要改 CLI 和模板

缺点：

- 知识型和内容型项目会被迫写进不合适的结构
- `architecture`、`runbook` 这类概念会污染非工程项目
- 写作成本和检索质量都会下降

### Option 2: 只增加一个通用 knowledge 模板

优点：

- 比 engineering-only 更灵活
- 结构数量少

缺点：

- 内容项目和研究项目仍然不同
- 内容类项目会缺“选题/制作/复盘”这些核心对象
- 最终容易把 knowledge 模板继续拉杂

### Option 3: 明确定义三种项目类型

类型：

- `engineering`
- `knowledge`
- `content`

优点：

- 和真实工作对象一致
- 模板和 lint 可以逐步按类型收敛
- 对 Obsidian 写作和 agent 检索都更自然

缺点：

- 需要扩展模板、`write`、schema 和 lint
- 需要处理旧项目兼容

## Decision

采用 Option 3。

`project-knowledge` 正式引入：

- `project_type: engineering`
- `project_type: knowledge`
- `project_type: content`

但第一版采用**最小 MVP**，只做：

- 新增项目类型元数据
- 新增模板和 `doc_type`
- 扩展 `write`
- 扩展 schema / lint 的最小合法值集合

第一版不做：

- 全量旧项目迁移
- 按项目类型定制 `context-pack`
- 强约束目录级 lint
- 自动项目初始化器

## Design

### Shared Principles

三类项目共享这些基础约束：

- 都有 `00-overview.md`
- 都保留 `decision`
- 都保留 `reference`
- 都要求统一 frontmatter
- 都通过 `write / lint / index / search / context-pack` 使用

### Engineering

适合：

- 软件工程
- agent 系统
- dashboard
- 插件
- 服务

结构：

```text
00-overview.md
01-architecture.md
02-decisions/
03-runbooks/
04-reference/
```

支持的 `doc_type`：

- `overview`
- `architecture`
- `decision`
- `runbook`
- `reference`

### Knowledge

适合：

- 产品方向
- 品牌策略
- 研究议题
- 市场和用户洞察

第一版最小结构：

```text
00-overview.md
01-landscape.md
02-hypotheses/
03-ideas/
04-experiments/
05-decisions/
06-reference/
```

第一版支持的 `doc_type`：

- `overview`
- `landscape`
- `hypothesis`
- `idea`
- `experiment`
- `decision`
- `reference`

说明：

- 第一版不单独拆 `assets/`
- 研究材料先吸收到 `reference`

### Content

适合：

- 内容栏目
- 账号规划
- 选题系统
- 脚本制作
- 发布和复盘

第一版最小结构：

```text
00-overview.md
01-strategy.md
02-topics/
03-production/
04-experiments/
05-decisions/
06-reference/
```

第一版支持的 `doc_type`：

- `overview`
- `strategy`
- `topic`
- `production`
- `experiment`
- `decision`
- `reference`

说明：

- 第一版不单独拆 `audience`
- 第一版不单独拆 `assets`
- 相关内容先分别吸收到 `strategy` 和 `reference`

### Metadata Model

正式引入：

```yaml
project: some-project
project_type: engineering
doc_type: decision
status: active
```

规则：

- 新项目要求显式写 `project_type`
- 旧项目如果缺失，lint 第一版可默认按 `engineering` 兼容

### CLI Impact

第一版主要影响：

- `write`
- schema
- lint

`write` 需要新增允许的 `doc_type`：

- `landscape`
- `hypothesis`
- `idea`
- `experiment`
- `strategy`
- `topic`
- `production`

并把它们映射到对应目录。

### Lint Strategy

第一版 lint 只做宽松支持：

- `project_type` 合法性检查
- `doc_type` 合法性检查
- 新模板 frontmatter 合法

第一版不做：

- `content` 不能出现 `architecture`
- `knowledge` 不能出现 `runbook`

这类强约束留到第二阶段。

## Migration Strategy

旧项目不立即迁移。

兼容策略：

- 已有 `engineering` 项目保持不变
- 新建 `knowledge` / `content` 项目时开始使用新类型
- 后续按实际使用再决定是否需要 `init --project-type`

## Testing

最小 MVP 至少覆盖：

- 新 `doc_type` 模板存在
- `write` 能把新类型写入正确目录
- schema 接受 `project_type`
- lint 接受新类型的合法 frontmatter
- 旧 `engineering` 项目仍然通过现有测试

