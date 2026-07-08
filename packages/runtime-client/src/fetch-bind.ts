/** Browser fetch must stay bound to globalThis when stored and invoked later. */
export function resolveFetch(custom?: typeof fetch): typeof fetch {
  return custom ?? ((input, init) => fetch(input, init));
}

function readBrowserOrigin(): string | undefined {
  if (typeof globalThis === "undefined" || !("location" in globalThis)) {
    return undefined;
  }
  const location = (globalThis as { location?: { origin?: string } }).location;
  return location?.origin;
}

/** Resolve API paths when baseUrl is empty (browser dev proxy / same-origin). */
export function resolveRequestUrl(baseUrl: string, path: string): URL {
  const origin = baseUrl || readBrowserOrigin() || "http://127.0.0.1:3000";
  return new URL(path, origin);
}
