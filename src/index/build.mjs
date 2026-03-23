import path from "node:path";

import { discoverProjectDocuments } from "../vault/discover.mjs";
import { chunkMarkdownDocument } from "../vault/chunk.mjs";
import { discoverProjectRoots } from "../vault/project-roots.mjs";
import { writeLanceChunks } from "./lancedb.mjs";
import { writeChunks } from "./store.mjs";

export async function buildIndexes({
  vaultRoot,
  projectSpaces = [],
  indexRoot,
  retrievalBackend = "auto",
  lancedbUri = null,
  lancedbModule = null
}) {
  const { projects } = await discoverProjectRoots(vaultRoot, projectSpaces);
  const globalChunks = [];

  for (const { project, path: projectRoot } of projects) {
    const documents = await discoverProjectDocuments(projectRoot);
    const projectChunks = documents.flatMap((document) => chunkMarkdownDocument(document));
    await writeChunks(path.join(indexRoot, "projects", project, "chunks.json"), projectChunks);
    globalChunks.push(...projectChunks);
  }

  await writeChunks(path.join(indexRoot, "global", "chunks.json"), globalChunks);

  if ((retrievalBackend === "auto" || retrievalBackend === "lancedb") && lancedbUri) {
    try {
      await writeLanceChunks({
        lancedbUri,
        chunks: globalChunks,
        lancedbModule
      });
    } catch (error) {
      if (retrievalBackend === "lancedb") {
        throw error;
      }
    }
  }
}
