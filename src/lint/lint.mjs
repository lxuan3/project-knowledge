import fs from "node:fs/promises";
import path from "node:path";

import { discoverProjectDocuments } from "../vault/discover.mjs";

const REQUIRED_FIELDS = ["project", "doc_type", "status"];

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
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
