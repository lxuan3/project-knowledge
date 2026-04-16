import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesDir = path.join(repoRoot, "templates");
const schemaPath = path.join(repoRoot, "schemas", "note-frontmatter.schema.json");

const fullFileTemplates = ["engineering", "knowledge", "content"];

const snippetTemplates = [
  "_decision", "_runbook", "_reference",
  "_hypothesis", "_idea", "_experiment",
  "_topic", "_production", "_landscape", "_strategy"
];

test("full-file templates include required frontmatter keys", async () => {
  for (const templateName of fullFileTemplates) {
    const templatePath = path.join(templatesDir, `${templateName}.md`);
    const content = await fs.readFile(templatePath, "utf8");

    assert.match(content, /^---\n/, `${templateName}.md should start with frontmatter`);
    assert.match(content, /^project:/m, `${templateName}.md should have project field`);
    assert.match(content, /^project_type:/m, `${templateName}.md should have project_type field`);
    assert.match(content, /^status:/m, `${templateName}.md should have status field`);
  }
});

test("snippet templates exist and are non-empty", async () => {
  for (const templateName of snippetTemplates) {
    const templatePath = path.join(templatesDir, `${templateName}.md`);
    const content = await fs.readFile(templatePath, "utf8");
    assert.ok(content.trim().length > 0, `${templateName}.md should not be empty`);
  }
});

test("frontmatter schema requires project, project_type, and status", async () => {
  const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));

  assert.ok(schema.required.includes("project"));
  assert.ok(schema.required.includes("project_type"));
  assert.ok(schema.required.includes("status"));
  assert.deepEqual(schema.properties.project_type.enum, ["engineering", "knowledge", "content"]);
});
