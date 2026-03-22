import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesDir = path.join(repoRoot, "templates");
const schemaPath = path.join(repoRoot, "schemas", "note-frontmatter.schema.json");
const templateNames = [
  "overview",
  "architecture",
  "decision",
  "runbook",
  "reference",
  "landscape",
  "hypothesis",
  "idea",
  "experiment",
  "strategy",
  "topic",
  "production"
];

test("templates include required frontmatter keys", async () => {
  for (const templateName of templateNames) {
    const templatePath = path.join(templatesDir, `${templateName}.md`);
    const content = await fs.readFile(templatePath, "utf8");

    assert.match(content, /^---\n/);
    assert.match(content, /^project:/m);
    assert.match(content, /^project_type:/m);
    assert.match(content, /^doc_type:/m);
    assert.match(content, /^status:/m);
  }
});

test("frontmatter schema requires project, project_type, doc_type, and status", async () => {
  const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));

  assert.deepEqual(schema.required, ["project", "project_type", "doc_type", "status"]);
  assert.deepEqual(schema.properties.project_type.enum, ["engineering", "knowledge", "content"]);
});
