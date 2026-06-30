import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { AnActTokensPayload } from "./types.js";

let cached: AnActTokensPayload | null = null;

export function loadTokensPayload(): AnActTokensPayload {
  if (cached) {
    return cached;
  }
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const assetPath = path.resolve(dir, "../assets/tokens.json");
  const raw = readFileSync(assetPath, "utf8");
  cached = JSON.parse(raw) as AnActTokensPayload;
  return cached;
}

export function getTokensVersion(): string {
  return loadTokensPayload().version;
}
