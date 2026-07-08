/** Dev-only runtime instrumentation — never enabled in production builds unless explicitly forced. */
export const RUNTIME_DEBUG_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_RUNTIME_DEBUG === "true";

export function logRuntimeTrace(label: string, payload?: Record<string, unknown>): void {
  if (!RUNTIME_DEBUG_ENABLED || typeof console === "undefined") {
    return;
  }
  console.log(`[AN ACT] ${label}`, payload ?? {});
}
