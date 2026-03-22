# Quickstart

## 1. Verify the repo

```bash
cd <repo-root>
npm run test
```

Optional: install the CLI shim into your local npm global bin:

```bash
cd <repo-root>
npm link
project-knowledge --help
```

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
project-knowledge list-projects
```

## 4. Rebuild index

```bash
project-knowledge index
```

## 5. Search project knowledge

```bash
project-knowledge search \
  --project openclaw-dashboard \
  --query "skill manager"
```

## 6. Build a context pack

```bash
project-knowledge context-pack \
  --project openclaw-dashboard \
  --query "skill manager"
```

## 7. Lint a project

```bash
project-knowledge lint \
  --project openclaw-dashboard
```

## 8. Create a new note

```bash
project-knowledge write \
  --project openclaw-dashboard \
  --doc-type decision \
  --title "Repo First Sync"
```
