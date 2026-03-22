# Quickstart

## 1. Verify the repo

```bash
cd <repo-root>
npm run test
```

Canonical invocation from the repo root:

```bash
node bin/project-knowledge --help
```

Cross-platform fallback:

```bash
npm run cli -- --help
```

Optional: install the CLI shim into your local npm global bin:

```bash
cd <repo-root>
npm link
project-knowledge --help
```

If Windows does not expose `project-knowledge.cmd` reliably after `npm link`, keep using `node bin/project-knowledge ...` or `npm run cli -- ...`.

## 2. Check local config

Expected config file:

```bash
~/.project-knowledge/config.json
```

Expected content:

```json
{
  "vaultRoot": "/path/to/your/obsidian/vault",
  "indexRoot": "/path/to/local/project-knowledge/index"
}
```

## 3. List known projects

```bash
node bin/project-knowledge list-projects
```

## 4. Rebuild index

```bash
node bin/project-knowledge index
```

## 5. Search project knowledge

```bash
node bin/project-knowledge search \
  --project openclaw-dashboard \
  --query "skill manager"
```

## 6. Build a context pack

```bash
node bin/project-knowledge context-pack \
  --project openclaw-dashboard \
  --query "skill manager"
```

## 7. Lint a project

```bash
node bin/project-knowledge lint \
  --project openclaw-dashboard
```

## 8. Create a new note

```bash
node bin/project-knowledge write \
  --project openclaw-dashboard \
  --doc-type decision \
  --title "Repo First Sync"
```
