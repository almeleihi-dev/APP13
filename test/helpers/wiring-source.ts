import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export async function readModuleWiringSource(): Promise<string> {
  const bootstrapDir = path.join(ROOT_DIR, "src/bootstrap");
  const entries = (await readdir(bootstrapDir)).filter((file) => file.endsWith(".ts")).sort();
  const parts = await Promise.all(
    entries.map((file) => readFile(path.join(bootstrapDir, file), "utf8"))
  );
  const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
  return parts.join("\n") + index;
}

export async function readRouteWiringSource(): Promise<string> {
  const routes = await readFile(path.join(ROOT_DIR, "src/bootstrap/routes.ts"), "utf8");
  const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
  return routes + server;
}

export { ROOT_DIR };
