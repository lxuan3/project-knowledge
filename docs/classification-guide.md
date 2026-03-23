# Classification Guide / 分类指南

Use this guide when deciding where a formal project-knowledge note belongs.

当你在决定一条正式项目知识应该写到哪里时，用这份规则。

## Boundary First / 先看边界

Apply this guide only when the user explicitly wants to record something into project knowledge / 项目知识库.

只有当用户明确表示要把内容记录到 project knowledge / 项目知识库 时，才应用这份分类规则。

Do not apply it to:

- meeting archives
- raw transcripts
- raw minutes
- generic note archiving

不要把它用于：

- 会议归档
- 原始 transcript
- 原始纪要
- 通用笔记归档

## Step 1: Choose Project Type / 第一步：选择项目类型

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

## Step 2: Choose Doc Type By Responsibility / 第二步：按知识职责选择文档类型

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

## Default Heuristic / 默认判断法

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
