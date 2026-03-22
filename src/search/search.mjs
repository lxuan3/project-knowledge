import { retrieveRankedChunks } from "../retrieval/adapter.mjs";
import { searchRemoteIndex, tryRemoteOperation } from "./remote.mjs";

export async function searchIndex({
  indexRoot,
  query,
  project = null,
  scope = "project",
  limit = 5,
  retrievalBackend = "auto",
  lancedbUri = null,
  remoteBaseUrl = null,
  remotePrimaryUrl = null,
  remoteBackupUrl = null,
  lancedbModule = null
}) {
  const remoteAttempt = await tryRemoteOperation({
    remotePrimaryUrl,
    remoteBackupUrl,
    remoteBaseUrl,
    operation: (url) => searchRemoteIndex({ remoteBaseUrl: url, query, project, scope })
  });

  if (remoteAttempt.ok) {
    return remoteAttempt.result;
  }

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
    transport_backend: "local",
    results
  };
}
