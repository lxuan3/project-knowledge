export const LANCEDB_TABLE_NAME = "chunks";

function normalizeLanceDbModule(moduleValue) {
  if (!moduleValue) return null;
  return moduleValue.default ?? moduleValue;
}

export async function resolveLanceDbModule(moduleValue = null) {
  if (moduleValue) return normalizeLanceDbModule(moduleValue);

  try {
    const imported = await import("@lancedb/lancedb");
    return normalizeLanceDbModule(imported);
  } catch {
    return null;
  }
}

async function connectToLanceDb({ lancedbUri, lancedbModule = null }) {
  const resolvedModule = await resolveLanceDbModule(lancedbModule);
  if (!resolvedModule?.connect) {
    throw new Error("lancedb module is unavailable");
  }

  return resolvedModule.connect(lancedbUri);
}

function asPlainRows(chunks) {
  return chunks.map((chunk) => ({
    ...chunk,
    doc_type: chunk.doc_type ?? "",
    status: chunk.status ?? "",
    updated_at: chunk.updated_at ?? "",
    tags: JSON.stringify(Array.isArray(chunk.tags) ? chunk.tags : []),
    aliases: JSON.stringify(Array.isArray(chunk.aliases) ? chunk.aliases : [])
  }));
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeRows(rows) {
  return rows.map((row) => ({
    ...row,
    tags: parseJsonArray(row.tags),
    aliases: parseJsonArray(row.aliases)
  }));
}

export async function writeLanceChunks({ lancedbUri, chunks, lancedbModule = null }) {
  const db = await connectToLanceDb({ lancedbUri, lancedbModule });
  const rows = asPlainRows(chunks);

  if (typeof db.createTable === "function") {
    await db.createTable(LANCEDB_TABLE_NAME, rows, { mode: "overwrite" });
    return;
  }

  throw new Error("connected LanceDB client does not support createTable");
}

export async function readLanceChunks({ lancedbUri, lancedbModule = null }) {
  const db = await connectToLanceDb({ lancedbUri, lancedbModule });
  const table = await db.openTable(LANCEDB_TABLE_NAME);

  if (typeof table.toArray === "function") {
    return normalizeRows(await table.toArray());
  }

  if (typeof table.query === "function") {
    const query = table.query();
    if (typeof query.toArray === "function") {
      return normalizeRows(await query.toArray());
    }
  }

  throw new Error("connected LanceDB table cannot be read as an array");
}
