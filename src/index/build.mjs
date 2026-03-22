import fs from "node:fs/promises";
import path from "node:path";

import { discoverProjectDocuments } from "../vault/discover.mjs";
import { chunkMarkdownDocument } from "../vault/chunk.mjs";
import { writeLanceChunks } from "./lancedb.mjs";
import { writeChunks } from "./store.mjs";

async function listProjectRoots(vaultRoot) {
  const entries = await fs.readdir(vaultRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => path.join(vaultRoot, entry.name));
}

export async function buildIndexes({
  vaultRoot,
  indexRoot,
  retrievalBackend = "auto",
  lancedbUri = null,
  lancedbModule = null
}) {
  const projectRoots = await listProjectRoots(vaultRoot);
  const globalChunks = [];

  for (const projectRoot of projectRoots) {
    const documents = await discoverProjectDocuments(projectRoot);
    const projectChunks = documents.flatMap((document) => chunkMarkdownDocument(document));
    const project = path.basename(projectRoot);
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
