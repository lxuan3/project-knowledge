# Prompts

Reusable prompts for integrating AI tools with `project-knowledge`.

## General Integration Prompt

```text
你现在需要接入并使用我的项目知识库系统 `project-knowledge`。

自然语言触发词约定：
- 中文优先使用“项目知识库”
- 中文可接受别名：“项目知识”
- 英文优先使用“project knowledge”
- 英文可接受别名：“project context”
- 上述词都视为调用 `project-knowledge`

规则：
1. Obsidian markdown 是唯一真源，不要把本地索引当真源。
2. 在处理某个已有项目前，优先先检索项目知识，不要直接假设背景。
3. 正式项目知识应通过 `project-knowledge write` 创建，不要随意手写不规范 markdown。
4. 项目文档变更、移动、重命名后，必要时运行 `project-knowledge index`。
5. 整理或批量修改项目知识后，运行 `project-knowledge lint`。
6. 这套工具直接读取默认 Obsidian vault 的 markdown，不依赖 Obsidian app 或 Obsidian CLI。

仓库位置：
项目知识库仓库的本地 checkout 根目录。

先阅读：
- `<repo-root>/AI_INTEGRATION.md`
- `<repo-root>/QUICKSTART.md`

执行方式：
- 如果已 `npm link`，直接运行 `project-knowledge ...`
- 否则先进入 `<repo-root>`，再运行 `node bin/project-knowledge ...`

默认配置：
- 读取 `~/.project-knowledge/config.json`
- 其中定义 `vaultRoot` 和 `indexRoot`
- `vaultRoot` 应指向默认 Obsidian vault 根目录

常用命令：
- 列项目：
  `project-knowledge list-projects`
- 检索项目：
  `project-knowledge search --project <project> --query "<query>"`
- 获取上下文包：
  `project-knowledge context-pack --project <project> --query "<query>"`
- 校验项目：
  `project-knowledge lint --project <project>`
- 重建索引：
  `project-knowledge index`
- 创建笔记：
  `project-knowledge write --project <project> --doc-type <type> --title "<title>"`

行为要求：
- 当任务涉及已有项目时，先 search 再行动。
- 如果任务复杂，优先使用 `context-pack` 而不是只拿零散 search 结果。
- 当任务需要沉淀正式结论时，使用 write 创建规范笔记。
- 不要绕过这套系统去随意扫描整个 Obsidian，除非明确必要。
```

## Codex / Claude Coding Prompt

```text
在处理项目代码前，先用 `project-knowledge search` 或 `project-knowledge context-pack` 检索该项目的已有决策、runbook、reference。
如果任务会产生正式项目知识，完成后用 `project-knowledge write` 记录。
如果你重构了项目知识目录，结束前运行 `project-knowledge lint`，必要时运行 `project-knowledge index`。
先读：
`<repo-root>/AI_INTEGRATION.md`
```

## OpenClaw Agent Prompt

```text
当用户请求涉及某个项目时，优先把项目名映射到 `project-knowledge` 中的项目目录，并先执行项目知识检索或上下文打包：
`project-knowledge search --project <project> --query "<task topic>"`
或：
`project-knowledge context-pack --project <project> --query "<task topic>"`
如果检索结果包含相关 decision/runbook/reference，应先吸收这些上下文，再继续执行任务。
不要把本地索引当作真源；Obsidian markdown 才是真源。
```

## Claude Cowork Prompt

```text
你和我协作项目前，先用 `project-knowledge` 查该项目已有知识，再开始讨论。
如果讨论中形成了正式结论，不要只停留在对话里，应建议写回项目知识库。
参考：
`<repo-root>/AI_INTEGRATION.md`
```
