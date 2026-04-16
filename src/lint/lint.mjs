import { discoverProjectDocument } from "../vault/discover.mjs";

const REQUIRED_FIELDS = ["project", "project_type", "status"];
const ALLOWED_PROJECT_TYPES = new Set(["engineering", "knowledge", "content"]);

export async function lintProject(filePath) {
  const document = await discoverProjectDocument(filePath);
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    const value =
      field === "project" ? document.project :
      field === "project_type" ? document.projectType :
      document.status;

    if (!value) {
      errors.push(`${document.sourceRelpath} is missing required field: ${field}`);
    }
  }

  if (document.projectType && !ALLOWED_PROJECT_TYPES.has(document.projectType)) {
    errors.push(`${document.sourceRelpath} has unsupported project_type: ${document.projectType}`);
  }

  return { ok: errors.length === 0, errors };
}
