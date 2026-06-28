export const LAUNCH_MODE_IDS = [
  "development",
  "preview",
  "demo",
  "mvp-readiness",
  "handoff",
  "production-candidate",
] as const;

export type LaunchModeId = (typeof LAUNCH_MODE_IDS)[number];

export type LaunchReadinessStatus = "ready" | "partial" | "blocked" | "pending";

export interface LaunchModeDefinition {
  id: LaunchModeId;
  title: string;
  description: string;
  requiredExperiences: string[];
}

export const LAUNCH_MODE_DEFINITIONS: LaunchModeDefinition[] = [
  {
    id: "development",
    title: "Development",
    description: "Local development entry with all user runtime experiences available.",
    requiredExperiences: ["need", "action", "contract", "chat", "timeline", "notification", "profile"],
  },
  {
    id: "preview",
    title: "Preview",
    description: "Read-only preview of all runtime experiences before execution.",
    requiredExperiences: [
      "need", "action", "contract", "chat", "timeline", "notification", "profile",
      "runtime-preview",
    ],
  },
  {
    id: "demo",
    title: "Demo",
    description: "Deterministic demo playback of the complete AN ACT journey.",
    requiredExperiences: ["runtime-journey", "runtime-state", "runtime-coordinator", "runtime-demo"],
  },
  {
    id: "mvp-readiness",
    title: "MVP Readiness",
    description: "Evaluate whether the platform meets MVP launch criteria.",
    requiredExperiences: [
      "need", "action", "contract", "chat", "timeline", "notification", "profile",
      "runtime-journey", "runtime-state", "runtime-registry", "runtime-coordinator",
      "runtime-health", "runtime-demo", "runtime-preview",
    ],
  },
  {
    id: "handoff",
    title: "Handoff",
    description: "Produce handoff summary for MVP implementation teams.",
    requiredExperiences: [
      "need", "action", "contract", "chat", "timeline", "notification", "profile",
      "runtime-journey", "runtime-state", "runtime-registry", "runtime-coordinator",
      "runtime-health", "runtime-demo", "runtime-preview",
    ],
  },
  {
    id: "production-candidate",
    title: "Production Candidate",
    description: "Final readiness gate before production launch consideration.",
    requiredExperiences: [
      "need", "action", "contract", "chat", "timeline", "notification", "profile",
      "runtime-journey", "runtime-state", "runtime-registry", "runtime-coordinator",
      "runtime-health", "runtime-demo", "runtime-preview",
    ],
  },
];

export function isLaunchModeId(id: string): id is LaunchModeId {
  return (LAUNCH_MODE_IDS as readonly string[]).includes(id);
}

export function getLaunchModeDefinition(id: LaunchModeId): LaunchModeDefinition {
  const mode = LAUNCH_MODE_DEFINITIONS.find((m) => m.id === id);
  if (!mode) throw new Error(`Unknown launch mode: ${id}`);
  return mode;
}

export interface LaunchModeView {
  id: LaunchModeId;
  title: string;
  description: string;
  enabled: boolean;
  readinessStatus: LaunchReadinessStatus;
  requiredExperiences: string[];
  missingRequirements: string[];
  warnings: string[];
  errors: string[];
  recommendedNextStep: string;
}
