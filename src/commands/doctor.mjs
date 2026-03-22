import fs from "node:fs/promises";
import path from "node:path";

import { LANCEDB_TABLE_NAME, resolveLanceDbModule } from "../index/lancedb.mjs";
import { readChunks } from "../index/store.mjs";

function okCheck(name, details = {}) {
  return { name, status: "ok", ...details };
}

function warnCheck(name, details = {}) {
  return { name, status: "warn", ...details };
}

function failCheck(name, details = {}) {
  return { name, status: "fail", ...details };
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function statPath(targetPath) {
  try {
    const stats = await fs.stat(targetPath);
    return stats;
  } catch {
    return null;
  }
}

async function probeRemoteHealth(baseUrl) {
  const normalized = String(baseUrl ?? "").replace(/\/+$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`${normalized}/health`, { signal: controller.signal });
    const payload = await response.json();
    if (!response.ok) {
      return warnCheck("remote health", {
        target: baseUrl,
        message: payload?.message ?? payload?.error ?? `HTTP ${response.status}`
      });
    }
    return okCheck("remote health", {
      target: baseUrl,
      message: `HTTP ${response.status}`,
      data: payload
    });
  } catch (error) {
    return warnCheck("remote health", {
      target: baseUrl,
      message: error instanceof Error ? error.message : String(error)
    });
  } finally {
    clearTimeout(timer);
  }
}

async function probeLanceDb({ lancedbUri, required = false }) {
  const moduleValue = await resolveLanceDbModule();
  if (!moduleValue?.connect) {
    return (required ? failCheck : warnCheck)("lancedb connect", {
      target: lancedbUri,
      message: "lancedb module is unavailable"
    });
  }

  try {
    const db = await moduleValue.connect(lancedbUri);
    const connectCheck = okCheck("lancedb connect", {
      target: lancedbUri,
      message: "connected successfully"
    });

    try {
      await db.openTable(LANCEDB_TABLE_NAME);
      return [
        connectCheck,
        okCheck("lancedb table", {
          target: lancedbUri,
          message: `opened table ${LANCEDB_TABLE_NAME}`
        })
      ];
    } catch (error) {
      return [
        connectCheck,
        (required ? failCheck : warnCheck)("lancedb table", {
          target: lancedbUri,
          message: error instanceof Error ? error.message : String(error)
        })
      ];
    }
  } catch (error) {
    return (required ? failCheck : warnCheck)("lancedb connect", {
      target: lancedbUri,
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

function summarizeChecks(checks) {
  return checks.reduce((summary, check) => {
    summary[check.status] += 1;
    return summary;
  }, { ok: 0, warn: 0, fail: 0 });
}

function statusLabel(status) {
  return status.toUpperCase();
}

function colorizeStatus(status) {
  const label = statusLabel(status);
  const colors = {
    ok: "\u001b[32m",
    warn: "\u001b[33m",
    fail: "\u001b[31m"
  };
  const color = colors[status] ?? "";
  const reset = color ? "\u001b[0m" : "";
  return `${color}${label}${reset}`;
}

export function renderDoctorReport(report) {
  const lines = [
    "Project Knowledge Doctor",
    "",
    `Overall: ${report.ok ? "OK" : "ISSUES FOUND"}`,
    `Summary: ${report.summary.ok} ok, ${report.summary.warn} warn, ${report.summary.fail} fail`,
    ""
  ];

  if (report.project) {
    lines.push(`Project: ${report.project}`);
    lines.push("");
  }

  for (const check of report.checks) {
    lines.push(`[${colorizeStatus(check.status)}] ${check.name}`);
    if (check.target) lines.push(`  target: ${check.target}`);
    if (check.message) lines.push(`  message: ${check.message}`);
  }

  return `${lines.join("\n")}\n`;
}

export async function runDoctor({ config, project = null, configPath = null }) {
  const checks = [];

  checks.push((await pathExists(configPath))
    ? okCheck("config", { target: configPath, message: "config file exists" })
    : warnCheck("config", { target: configPath, message: "config file does not exist; defaults may be in use" }));

  for (const [name, target] of [
    ["vaultRoot", config.vaultRoot],
    ["indexRoot", config.indexRoot],
    ["lancedbUri", config.lancedbUri]
  ]) {
    const stats = await statPath(target);
    if (!stats) {
      checks.push(name === "vaultRoot"
        ? failCheck(name, { target, message: "path does not exist" })
        : warnCheck(name, { target, message: "path does not exist" }));
      continue;
    }
    checks.push(okCheck(name, {
      target,
      message: stats.isDirectory() ? "directory exists" : "path exists"
    }));
  }

  const globalIndexPath = path.join(config.indexRoot, "global", "chunks.json");
  try {
    const chunks = await readChunks(globalIndexPath);
    checks.push(okCheck("index read", {
      target: globalIndexPath,
      message: `read ${chunks.length} global chunks`
    }));
  } catch (error) {
    checks.push(warnCheck("index read", {
      target: globalIndexPath,
      message: error instanceof Error ? error.message : String(error)
    }));
  }

  if (config.retrievalBackend === "auto" || config.retrievalBackend === "lancedb") {
    const lancedbChecks = await probeLanceDb({
      lancedbUri: config.lancedbUri,
      required: config.retrievalBackend === "lancedb"
    });
    if (Array.isArray(lancedbChecks)) checks.push(...lancedbChecks);
    else checks.push(lancedbChecks);
  }

  for (const [name, value] of [
    ["remotePrimaryUrl", config.remotePrimaryUrl],
    ["remoteBackupUrl", config.remoteBackupUrl],
    ["remoteBaseUrl", config.remoteBaseUrl]
  ]) {
    if (!value) continue;
    const result = await probeRemoteHealth(value);
    checks.push({
      ...result,
      name,
      message: `${result.name}: ${result.message}`
    });
  }

  let projectRoot = null;
  if (project) {
    projectRoot = path.join(config.vaultRoot, project);
    checks.push((await pathExists(projectRoot))
      ? okCheck("projectRoot", { target: projectRoot, message: "project directory exists" })
      : failCheck("projectRoot", { target: projectRoot, message: "project directory does not exist" }));
  }

  const summary = summarizeChecks(checks);
  return {
    ok: summary.fail === 0,
    project,
    projectRoot,
    configPath,
    summary,
    checks
  };
}
