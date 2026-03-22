import fs from "node:fs/promises";
import path from "node:path";

import { discoverProjectDocuments } from "../vault/discover.mjs";

const REQUIRED_FIELDS = ["project", "doc_type", "status"];
const ALLOWED_PROJECT_TYPES = new Set(["engineering", "knowledge", "content"]);
const ALLOWED_DOC_TYPES = new Set([
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
]);

export async function lintProject(projectRoot) {
  const documents = await discoverProjectDocuments(projectRoot);
  const errors = [];

  for (const document of documents) {
    for (const field of REQUIRED_FIELDS) {
      const value =
        field === "project" ? document.project :
        field === "doc_type" ? document.docType :
        document.status;

      if (!value) {
        errors.push(`${document.sourceRelpath} is missing required field: ${field}`);
      }
    }

    if (document.projectType && !ALLOWED_PROJECT_TYPES.has(document.projectType)) {
      errors.push(`${document.sourceRelpath} has unsupported project_type: ${document.projectType}`);
    }

    if (document.docType && !ALLOWED_DOC_TYPES.has(document.docType)) {
      errors.push(`${document.sourceRelpath} has unsupported doc_type: ${document.docType}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
