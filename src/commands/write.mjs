import fs from "node:fs/promises";
import path from "node:path";

const APPENDABLE_DOC_TYPES = new Set([
  "decision", "runbook", "reference",
  "hypothesis", "idea", "experiment",
  "topic", "production", "landscape", "strategy", "architecture"
]);

const DOC_TYPE_TO_SECTION = {
  architecture: "Architecture",
  decision: "Decisions",
  runbook: "Runbooks",
  reference: "Reference",
  landscape: "Landscape",
  hypothesis: "Hypotheses",
  idea: "Ideas",
  experiment: "Experiments",
  strategy: "Strategy",
  topic: "Topics",
  production: "Production",
};

const FULL_FILE_TEMPLATES = {
  engineering: "engineering.md",
  knowledge: "knowledge.md",
  content: "content.md",
};

const SNIPPET_TEMPLATES = {
  decision: "_decision.md",
  runbook: "_runbook.md",
  reference: "_reference.md",
  hypothesis: "_hypothesis.md",
  idea: "_idea.md",
  experiment: "_experiment.md",
  topic: "_topic.md",
  production: "_production.md",
  landscape: "_landscape.md",
  strategy: "_strategy.md",
  architecture: null,
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fillTemplate(template, { project, projectType, title }) {
  return template
    .replace("<project-slug>", project)
    .replace(/project_type:\s+\S+/, `project_type: ${projectType}`)
    .replace("YYYY-MM-DD", today())
    .replace("<title>", title ?? project);
}

function fillSnippet(snippet, { title }) {
  const date = today();
  return snippet
    .replace("YYYY-MM-DD: <title>", `${date}: ${title ?? "Untitled"}`)
    .replace("<title>", title ?? "Untitled")
    .replace("YYYY-MM-DD", date);
}

async function appendToSection(filePath, section, snippet) {
  const raw = await fs.readFile(filePath, "utf8");
  const sectionHeading = `## ${section}`;
  const idx = raw.indexOf(`\n${sectionHeading}`);

  if (idx === -1) {
    const appended = raw.trimEnd() + `\n\n${sectionHeading}\n\n${snippet}\n`;
    await fs.writeFile(filePath, appended, "utf8");
    return;
  }

  const afterSection = idx + 1 + sectionHeading.length;
  const nextSectionMatch = raw.slice(afterSection).match(/\n## /);
  const insertPos = nextSectionMatch
    ? afterSection + nextSectionMatch.index
    : raw.length;

  const updated = raw.slice(0, insertPos).trimEnd() + "\n\n" + snippet + "\n" + raw.slice(insertPos);
  await fs.writeFile(filePath, updated, "utf8");
}

export async function writeProjectNote({ repoRoot, vaultRoot, project, projectType = "engineering", docType = "overview", title = null }) {
  const projectFilePath = path.join(vaultRoot, `${project}.md`);

  if (!APPENDABLE_DOC_TYPES.has(docType)) {
    const templateName = FULL_FILE_TEMPLATES[projectType];
    if (!templateName) throw new Error(`Unsupported project_type: ${projectType}`);
    const templatePath = path.join(repoRoot, "templates", templateName);
    const template = await fs.readFile(templatePath, "utf8");
    const content = fillTemplate(template, { project, projectType, title: title ?? project });
    await fs.writeFile(projectFilePath, content, "utf8");
    return projectFilePath;
  }

  const snippetName = SNIPPET_TEMPLATES[docType];
  if (!snippetName) throw new Error(`No snippet template for doc_type: ${docType}`);
  const snippetPath = path.join(repoRoot, "templates", snippetName);
  const snippet = await fs.readFile(snippetPath, "utf8");
  const filled = fillSnippet(snippet, { title });
  const section = DOC_TYPE_TO_SECTION[docType];

  await appendToSection(projectFilePath, section, filled);
  return projectFilePath;
}
