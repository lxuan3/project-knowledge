# Quickstart

## 1. Install

```bash
cd <repo-root>
npm install
```

Canonical repo-local invocation:

```bash
node bin/project-knowledge --help
```

Cross-platform fallback:

```bash
npm run cli -- --help
```

Command-specific help:

```bash
node bin/project-knowledge help write
```

Optional global shim:

```bash
npm link
project-knowledge --help
```

If Windows does not expose `project-knowledge.cmd` reliably after `npm link`, stay on the repo-local forms.

## 2. Create config

Expected config path:

- macOS / Linux: `~/.project-knowledge/config.json`
- Windows: `%USERPROFILE%\\.project-knowledge\\config.json`

Example:

```json
{
  "vaultRoot": "/path/to/your/obsidian/Openclaw",
  "indexRoot": "/path/to/local/project-knowledge/index",
  "retrievalBackend": "auto",
  "lancedbUri": "/path/to/local/project-knowledge/lancedb"
}
```

## 3. Confirm paths

```bash
node bin/project-knowledge where
```

```bash
node bin/project-knowledge where --project openclaw-dashboard
```

```bash
node bin/project-knowledge where --project openclaw-dashboard --doc-type decision --title "Repo First Sync"
```

If setup still looks wrong, run:

```bash
node bin/project-knowledge doctor
```

```bash
node bin/project-knowledge doctor --project openclaw-dashboard --json
```

## 4. Verify setup

```bash
node bin/project-knowledge list-projects
```

```bash
node bin/project-knowledge index
```

```bash
node bin/project-knowledge search --project openclaw-dashboard --query "skill manager"
```

If these work, your vault path, index path, and retrieval path are wired correctly.

## 5. Common commands

```bash
node bin/project-knowledge help write
```

```bash
node bin/project-knowledge context-pack --project openclaw-dashboard --query "skill manager"
```

```bash
node bin/project-knowledge search --query "incident response" --scope global
```

```bash
node bin/project-knowledge doctor --project openclaw-dashboard
```

```bash
node bin/project-knowledge write --project openclaw-dashboard --doc-type decision --title "Repo First Sync"
```

```bash
node bin/project-knowledge lint --project openclaw-dashboard
```

```bash
node bin/project-knowledge config get
```

## 6. LanceDB note

If you use `retrievalBackend: "auto"` or `"lancedb"`, make sure you have run:

```bash
npm install
node bin/project-knowledge index
```

`lancedbUri` should point to a local cache directory, not your Obsidian vault.

For detailed setup, see [HUMAN_SETUP.md](/Users/hypernode/Github/project-knowledge/HUMAN_SETUP.md).
