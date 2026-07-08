/**
 * Federation Spine — module barrel (Phase 1A).
 *
 * Ecosystem-level identity that sits ABOVE the engines. Phase 1A exposes the
 * Person + Credential foundation only. It is intentionally NOT registered into
 * the HTTP server yet, so the live AN ACT experience and authentication are
 * completely unaffected.
 */
export * from "./domain/index.js";
export * from "./infrastructure/index.js";
export * from "./application/index.js";
