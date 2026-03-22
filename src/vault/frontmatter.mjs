function parseArray(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
  const body = trimmed.slice(1, -1).trim();
  if (!body) return [];
  return body.split(",").map((item) => item.trim().replace(/^['"]|['"]$/g, ""));
}

function parseScalar(value) {
  const arrayValue = parseArray(value);
  if (arrayValue) return arrayValue;

  const trimmed = value.trim();
  return trimmed.replace(/^['"]|['"]$/g, "");
}

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { data: {}, body: raw };
  }

  const data = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    data[key] = parseScalar(value);
  }

  return {
    data,
    body: raw.slice(match[0].length)
  };
}
