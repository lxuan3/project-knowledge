import { retrieveContextGroups } from "../retrieval/adapter.mjs";
import { buildRemoteContextPack, tryRemoteOperation } from "./remote.mjs";

function simplifyChunk(chunk, includeScore = false) {
  return {
    ...(includeScore ? { score: chunk.score } : {}),
    project: chunk.project,
    doc_type: chunk.doc_type,
    title: chunk.title,
    heading_path: chunk.heading_path,
    source_path: chunk.source_path,
    snippet: chunk.content,
    updated_at: chunk.updated_at
  };
}

export async function buildContextPack({
  indexRoot,
  project,
  query = null,
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
    operation: (url) => buildRemoteContextPack({ remoteBaseUrl: url, project, query })
  });

  if (remoteAttempt.ok) {
    return remoteAttempt.result;
  }

  const retrieval = await retrieveContextGroups({
    indexRoot,
    project,
    query,
    retrievalBackend,
    lancedbUri,
    lancedbModule
  });
  const groups = retrieval.groups;

  return {
    project,
    query,
    retrieval_backend: retrieval.backend,
    transport_backend: "local",
    generated_at: new Date().toISOString(),
    context: {
      overview: groups.overview.map((chunk) => simplifyChunk(chunk, false)),
      architecture: groups.architecture.map((chunk) => simplifyChunk(chunk, false)),
      decisions: groups.decisions.map((chunk) => simplifyChunk(chunk, true)),
      runbooks: groups.runbooks.map((chunk) => simplifyChunk(chunk, true)),
      reference: groups.reference.map((chunk) => simplifyChunk(chunk, true))
    }
  };
}
