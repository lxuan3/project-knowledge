import { retrieveRankedChunks } from "../retrieval/adapter.mjs";

export async function searchIndex({
  indexRoot,
  query,
  project = null,
  scope = "project",
  limit = 5,
  retrievalBackend = "auto",
  lancedbUri = null,
  lancedbModule = null
}) {
  const retrieval = await retrieveRankedChunks({
    indexRoot,
    query,
    project,
    scope,
    limit,
    retrievalBackend,
    lancedbUri,
    lancedbModule
  });

  const results = retrieval.chunks
    .map((chunk) => ({
      score: chunk.score,
      project: chunk.project,
      doc_type: chunk.doc_type,
      title: chunk.title,
      heading_path: chunk.heading_path,
      source_path: chunk.source_path,
      snippet: chunk.content,
      updated_at: chunk.updated_at
    }));

  return {
    query,
    project,
    retrieval_backend: retrieval.backend,
    results
  };
}
