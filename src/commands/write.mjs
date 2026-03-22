import fs from "node:fs/promises";
import path from "node:path";

const TEMPLATE_TO_DIR = {
  overview: "",
  architecture: "",
  decision: "02-decisions",
  runbook: "03-runbooks",
  reference: "04-reference"
};

const TEMPLATE_TO_FILE = {
  overview: "overview.md",
  architecture: "architecture.md",
  decision: "decision.md",
  runbook: "runbook.md",
  reference: "reference.md"
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function replaceTemplate(content, { project, docType }) {
  return content
    .replace("<project-slug>", project)
    .replace(`doc_type: ${docType}`, `doc_type: ${docType}`)
    .replace("updated_at: YYYY-MM-DD", `updated_at: ${new Date().toISOString().slice(0, 10)}`);
}

export async function writeProjectNote({ repoRoot, projectRoot, project, docType, slug = null, title = null }) {
  const templateName = TEMPLATE_TO_FILE[docType];
  if (!templateName) {
    throw new Error(`Unsupported doc type: ${docType}`);
  }

  const effectiveSlug = slug ?? (title ? slugify(title) : null);
  if (!effectiveSlug && docType !== "overview" && docType !== "architecture") {
    throw new Error("slug or title is required for this doc type");
  }

  const templatePath = path.join(repoRoot, "templates", templateName);
  const template = await fs.readFile(templatePath, "utf8");
  const fileName = docType === "overview"
    ? "00-overview.md"
    : docType === "architecture"
      ? "01-architecture.md"
      : `${effectiveSlug}.md`;

  const destination = path.join(projectRoot, TEMPLATE_TO_DIR[docType], fileName);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, replaceTemplate(template, { project, docType }), "utf8");
  return destination;
}
