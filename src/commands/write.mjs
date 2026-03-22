import fs from "node:fs/promises";
import path from "node:path";

const PROJECT_LAYOUTS = {
  engineering: {
    overview: { dir: "", fileName: "00-overview.md", template: "overview.md" },
    architecture: { dir: "", fileName: "01-architecture.md", template: "architecture.md" },
    decision: { dir: "02-decisions", template: "decision.md" },
    runbook: { dir: "03-runbooks", template: "runbook.md" },
    reference: { dir: "04-reference", template: "reference.md" }
  },
  knowledge: {
    overview: { dir: "", fileName: "00-overview.md", template: "overview.md" },
    landscape: { dir: "", fileName: "01-landscape.md", template: "landscape.md" },
    hypothesis: { dir: "02-hypotheses", template: "hypothesis.md" },
    idea: { dir: "03-ideas", template: "idea.md" },
    experiment: { dir: "04-experiments", template: "experiment.md" },
    decision: { dir: "05-decisions", template: "decision.md" },
    reference: { dir: "06-reference", template: "reference.md" }
  },
  content: {
    overview: { dir: "", fileName: "00-overview.md", template: "overview.md" },
    strategy: { dir: "", fileName: "01-strategy.md", template: "strategy.md" },
    topic: { dir: "02-topics", template: "topic.md" },
    production: { dir: "03-production", template: "production.md" },
    experiment: { dir: "04-experiments", template: "experiment.md" },
    decision: { dir: "05-decisions", template: "decision.md" },
    reference: { dir: "06-reference", template: "reference.md" }
  }
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function replaceTemplate(content, { project, projectType, docType }) {
  return content
    .replace("<project-slug>", project)
    .replace(/^project_type:\s+.+$/m, `project_type: ${projectType}`)
    .replace(`doc_type: ${docType}`, `doc_type: ${docType}`)
    .replace("updated_at: YYYY-MM-DD", `updated_at: ${new Date().toISOString().slice(0, 10)}`);
}

export async function writeProjectNote({ repoRoot, projectRoot, project, projectType = "engineering", docType, slug = null, title = null }) {
  const projectLayout = PROJECT_LAYOUTS[projectType];
  if (!projectLayout) {
    throw new Error(`Unsupported project type: ${projectType}`);
  }

  const templateConfig = projectLayout[docType];
  if (!templateConfig) {
    throw new Error(`Unsupported doc type: ${docType}`);
  }

  const effectiveSlug = slug ?? (title ? slugify(title) : null);
  if (!effectiveSlug && !templateConfig.fileName) {
    throw new Error("slug or title is required for this doc type");
  }

  const templatePath = path.join(repoRoot, "templates", templateConfig.template);
  const template = await fs.readFile(templatePath, "utf8");
  const fileName = templateConfig.fileName ?? `${effectiveSlug}.md`;

  const destination = path.join(projectRoot, templateConfig.dir, fileName);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, replaceTemplate(template, { project, projectType, docType }), "utf8");
  return destination;
}
