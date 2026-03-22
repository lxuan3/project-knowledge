import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("package.json declares LanceDB as an optional dependency", async () => {
  const packageJson = JSON.parse(await fs.readFile(path.join(repoRoot, "package.json"), "utf8"));

  assert.equal(packageJson.dependencies?.["@lancedb/lancedb"], undefined);
  assert.equal(packageJson.optionalDependencies?.["@lancedb/lancedb"], "^0.21.3");
});
