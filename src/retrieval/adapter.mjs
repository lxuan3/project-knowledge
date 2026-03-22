import path from "node:path";

import { readLanceChunks } from "../index/lancedb.mjs";
import { readChunks } from "../index/store.mjs";

export function tokenizeQuery(query) {
  return (query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function scoreChunk(chunk, terms) {
  const haystack = [
    chunk.title,
    chunk.heading_path,
    chunk.content,
    ...(Array.isArray(chunk.aliases) ? chunk.aliases : [])
  ].join(" ").toLowerCase();

  let score = 0;
  for (const term of terms) {
    score += haystack.split(term).length - 1;
  }
  return score;
}

function sortRanked(left, right) {
  if (right.score !== left.score) return right.score - left.score;
  return String(right.updated_at ?? "").localeCompare(String(left.updated_at ?? ""));
}

async function loadJsonChunks({ indexRoot, project = null, scope = "project" }) {
  const indexPath = scope === "global"
    ? path.join(indexRoot, "global", "chunks.json")
    : path.join(indexRoot, "projects", project, "chunks.json");

  return readChunks(indexPath);
}

function filterChunksForScope(chunks, { project = null, scope = "project" }) {
  if (scope === "global") return chunks;
  return chunks.filter((chunk) => chunk.project === project);
}

export async function loadChunks({
  indexRoot,
  project = null,
  scope = "project",
  retrievalBackend = "auto",
  lancedbUri = null,
  lancedbModule = null
}) {
  const shouldTryLanceDb = (retrievalBackend === "auto" || retrievalBackend === "lancedb") && lancedbUri;

  if (shouldTryLanceDb) {
    try {
      const chunks = await readLanceChunks({ lancedbUri, lancedbModule });
      return {
        chunks: filterChunksForScope(chunks, { project, scope }),
        backend: "lancedb",
        fallbackReason: null
      };
    } catch (error) {
      if (retrievalBackend === "lancedb") throw error;
      return {
        chunks: await loadJsonChunks({ indexRoot, project, scope }),
        backend: "json-fallback",
        fallbackReason: error
      };
    }
  }

  return {
    chunks: await loadJsonChunks({ indexRoot, project, scope }),
    backend: "json",
    fallbackReason: null
  };
}

export async function retrieveRankedChunks({
  indexRoot,
  query,
  project = null,
  scope = "project",
  limit = 5,
  retrievalBackend = "auto",
  lancedbUri = null,
  lancedbModule = null
}) {
  const { chunks, backend, fallbackReason } = await loadChunks({
    indexRoot,
    project,
    scope,
    retrievalBackend,
    lancedbUri,
    lancedbModule
  });
  const terms = tokenizeQuery(query);

  const ranked = chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk, terms)
    }))
    .filter((chunk) => chunk.score > 0)
    .sort(sortRanked)
    .slice(0, limit);

  return {
    chunks: ranked,
    backend,
    fallbackReason
  };
}

export async function retrieveContextGroups({
  indexRoot,
  project,
  query = null,
  retrievalBackend = "auto",
  lancedbUri = null,
  lancedbModule = null
}) {
  const { chunks, backend, fallbackReason } = await loadChunks({
    indexRoot,
    project,
    scope: "project",
    retrievalBackend,
    lancedbUri,
    lancedbModule
  });
  const terms = tokenizeQuery(query);

  const firstByType = (docType) =>
    chunks
      .filter((chunk) => chunk.doc_type === docType)
      .slice(0, 1);

  const topByType = (docType, limit) => {
    const ranked = chunks
      .filter((chunk) => chunk.doc_type === docType)
      .map((chunk) => ({
        ...chunk,
        score: scoreChunk(chunk, terms)
      }))
      .sort(sortRanked);

    const matching = ranked.filter((chunk) => terms.length === 0 || chunk.score > 0);
    const selected = matching.length > 0 ? matching : ranked;
    return selected.slice(0, limit);
  };

  return {
    backend,
    fallbackReason,
    groups: {
      overview: firstByType("overview"),
      architecture: firstByType("architecture"),
      decisions: topByType("decision", 3),
      runbooks: topByType("runbook", 3),
      reference: topByType("reference", 3)
    }
  };
}
