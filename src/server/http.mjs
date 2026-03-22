import http from "node:http";

import { buildContextPack } from "../search/context-pack.mjs";
import { searchIndex } from "../search/search.mjs";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

export function createProjectKnowledgeServer({ config }) {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");

      if (request.method !== "GET") {
        sendJson(response, 405, { error: "method_not_allowed" });
        return;
      }

      if (url.pathname === "/health") {
        sendJson(response, 200, {
          ok: true,
          vault_root: config.vaultRoot,
          index_root: config.indexRoot,
          retrieval_backend: config.retrievalBackend,
          lancedb_uri: config.lancedbUri
        });
        return;
      }

      if (url.pathname === "/search") {
        const query = url.searchParams.get("query");
        const project = url.searchParams.get("project");
        const scope = url.searchParams.get("scope") ?? (project ? "project" : "global");

        if (!query) {
          sendJson(response, 400, { error: "missing_query" });
          return;
        }

        const result = await searchIndex({
          indexRoot: config.indexRoot,
          query,
          project,
          scope,
          retrievalBackend: config.retrievalBackend,
          lancedbUri: config.lancedbUri
        });
        sendJson(response, 200, result);
        return;
      }

      if (url.pathname === "/context-pack") {
        const project = url.searchParams.get("project");
        const query = url.searchParams.get("query");

        if (!project) {
          sendJson(response, 400, { error: "missing_project" });
          return;
        }

        const result = await buildContextPack({
          indexRoot: config.indexRoot,
          project,
          query,
          retrievalBackend: config.retrievalBackend,
          lancedbUri: config.lancedbUri
        });
        sendJson(response, 200, result);
        return;
      }

      sendJson(response, 404, { error: "not_found" });
    } catch (error) {
      sendJson(response, 500, {
        error: "internal_error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
}
