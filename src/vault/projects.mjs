import { discoverProjectRoots } from "./project-roots.mjs";

export async function listProjects(vaultRoot, projectSpaces = []) {
  return discoverProjectRoots(vaultRoot, projectSpaces);
}
