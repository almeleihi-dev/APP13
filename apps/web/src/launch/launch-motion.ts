/** Set to true to enable a soft mechanical key click on splash press. */
export const LAUNCH_KEY_CLICK_ENABLED = false;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function terminalBar(fillPercent: number, segments = 12): string {
  const filled = Math.max(0, Math.min(segments, Math.round((fillPercent / 100) * segments)));
  return `${"█".repeat(filled)}${"░".repeat(segments - filled)}`;
}
