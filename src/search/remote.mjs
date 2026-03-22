function normalizeBaseUrl(remoteBaseUrl) {
  return String(remoteBaseUrl ?? "").replace(/\/+$/, "");
}

async function fetchJson(url) {
  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.message ?? payload?.error ?? `Remote request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function searchRemoteIndex({ remoteBaseUrl, query, project = null, scope = "project" }) {
  const baseUrl = normalizeBaseUrl(remoteBaseUrl);
  const url = new URL(`${baseUrl}/search`);
  url.searchParams.set("query", query);
  if (project) url.searchParams.set("project", project);
  if (scope) url.searchParams.set("scope", scope);
  return fetchJson(url);
}

export async function buildRemoteContextPack({ remoteBaseUrl, project, query = null }) {
  const baseUrl = normalizeBaseUrl(remoteBaseUrl);
  const url = new URL(`${baseUrl}/context-pack`);
  url.searchParams.set("project", project);
  if (query) url.searchParams.set("query", query);
  return fetchJson(url);
}

export async function tryRemoteOperation({ remotePrimaryUrl = null, remoteBackupUrl = null, remoteBaseUrl = null, operation }) {
  const primary = remotePrimaryUrl ?? remoteBaseUrl ?? null;
  const backup = remoteBackupUrl ?? null;
  const attempts = [
    primary ? { url: primary, transportBackend: "remote-primary" } : null,
    backup ? { url: backup, transportBackend: "remote-backup" } : null
  ].filter(Boolean);

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const result = await operation(attempt.url);
      return {
        ok: true,
        result: {
          ...result,
          transport_backend: attempt.transportBackend
        },
        error: null
      };
    } catch (error) {
      lastError = error;
    }
  }

  return {
    ok: false,
    result: null,
    error: lastError
  };
}
