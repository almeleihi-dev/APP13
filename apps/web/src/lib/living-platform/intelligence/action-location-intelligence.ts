import type { ActionExecutionLocation } from "../types.js";

const REMOTE_KEYWORDS = [
  "software",
  "develop",
  "engineering",
  "api",
  "ux",
  "design",
  "product",
  "analytics",
  "marketing",
  "strategy",
  "translation",
  "document",
  "research",
];

const LOCAL_KEYWORDS = [
  "inspection",
  "construction",
  "site",
  "foundation",
  "electrical",
  "plumbing",
  "hvac",
  "survey",
  "welding",
  "on-site",
  "house",
  "residential",
];

const HYBRID_KEYWORDS = [
  "project management",
  "management",
  "coordination",
  "consult",
  "workshop",
  "facilitat",
];

export function deriveActionExecutionLocation(actionName: string, skill?: string): ActionExecutionLocation {
  const haystack = `${actionName} ${skill ?? ""}`.toLowerCase();
  const localHits = LOCAL_KEYWORDS.filter((keyword) => haystack.includes(keyword)).length;
  const remoteHits = REMOTE_KEYWORDS.filter((keyword) => haystack.includes(keyword)).length;
  const hybridHits = HYBRID_KEYWORDS.filter((keyword) => haystack.includes(keyword)).length;

  if (hybridHits > 0 || (localHits > 0 && remoteHits > 0)) return "hybrid";
  if (localHits > remoteHits) return "local";
  return "remote";
}

export function executionLocationLabel(location: ActionExecutionLocation): string {
  if (location === "local") return "Local 📍";
  if (location === "hybrid") return "Hybrid 🔁";
  return "Remote 🌍";
}

export function deriveProjectLocationFromTemplate(templateId: string): {
  remoteTeamPossible: boolean;
  localTeamRequired: boolean;
} {
  if (templateId === "build-house") {
    return { remoteTeamPossible: false, localTeamRequired: true };
  }
  if (templateId === "launch-app") {
    return { remoteTeamPossible: true, localTeamRequired: false };
  }
  return { remoteTeamPossible: true, localTeamRequired: false };
}
