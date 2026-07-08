import type { AnActTokensPayload } from "./types.js";
import { TOKENS_PAYLOAD } from "./tokens-data.js";

let cached: AnActTokensPayload | null = null;

export function loadTokensPayload(): AnActTokensPayload {
  if (cached) {
    return cached;
  }
  cached = TOKENS_PAYLOAD as unknown as AnActTokensPayload;
  return cached;
}

export function getTokensVersion(): string {
  return loadTokensPayload().version;
}
