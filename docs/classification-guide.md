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

## Step 2: Choose which section to append to / 第二步：选择要追加到哪个 section

All content goes into the single project file. Do not create a new file. Choose the `--doc-type` based on what the content should do — the CLI will append it under the matching `##` heading.

所有内容写进同一个项目文件。不新建文件。根据内容的职责选择 `--doc-type`，CLI 会把它追加到对应的 `##` 小节下。

| `--doc-type` | Section | When to use |
|---|---|---|
| `decision` | `## Decisions` | a conclusion, tradeoff, or explicit why / 明确结论、取舍或 why |
| `runbook` | `## Runbooks` | an engineering operating procedure / 工程操作流程 |
| `reference` | `## Reference` | stable facts, APIs, conventions / 稳定事实、接口、约定 |
| `hypothesis` | `## Hypotheses` | a claim that still needs validation / 仍待验证的判断 |
| `idea` | `## Ideas` | a possible direction not yet committed / 尚未承诺的方向 |
| `experiment` | `## Experiments` | a test, trial, or validation record / 试验、验证记录 |
| `topic` | `## Topics` | a content topic or angle / 内容选题或切入角度 |
| `production` | `## Production` | a content production workflow / 内容生产流程 |
| `landscape` | `## Landscape` | how a knowledge domain is structured / 知识领域结构 |
| `strategy` | `## Strategy` | high-level content direction / 内容项目高层方向 |

Use `--doc-type overview` only when creating a new project file for the first time — this generates the full file with all section headings.

只有初始化一个新项目文件时才用 `--doc-type overview`，它会生成包含所有 section 的完整文件。

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
