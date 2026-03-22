import path from "node:path";

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

export async function loadChunks({ indexRoot, project = null, scope = "project" }) {
  const indexPath = scope === "global"
    ? path.join(indexRoot, "global", "chunks.json")
    : path.join(indexRoot, "projects", project, "chunks.json");

  return readChunks(indexPath);
}

export async function retrieveRankedChunks({ indexRoot, query, project = null, scope = "project", limit = 5 }) {
  const chunks = await loadChunks({ indexRoot, project, scope });
  const terms = tokenizeQuery(query);

  return chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk, terms)
    }))
    .filter((chunk) => chunk.score > 0)
    .sort(sortRanked)
    .slice(0, limit);
}

export async function retrieveContextGroups({ indexRoot, project, query = null }) {
  const chunks = await loadChunks({ indexRoot, project, scope: "project" });
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
    overview: firstByType("overview"),
    architecture: firstByType("architecture"),
    decisions: topByType("decision", 3),
    runbooks: topByType("runbook", 3),
    reference: topByType("reference", 3)
  };
}
