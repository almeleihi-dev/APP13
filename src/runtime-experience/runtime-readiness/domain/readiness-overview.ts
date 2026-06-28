export const READINESS_MODULE_IDS = [
  "need",
  "action",
  "contract",
  "chat",
  "timeline",
  "notification",
  "profile",
  "runtime-journey",
  "runtime-state",
  "runtime-registry",
  "runtime-coordinator",
  "runtime-health",
  "runtime-demo",
  "runtime-preview",
  "runtime-launcher",
  "runtime-release",
  "runtime-operations",
  "runtime-executive",
] as const;

export type ReadinessModuleId = (typeof READINESS_MODULE_IDS)[number];

export type ReadinessStatus = "ready" | "partial" | "blocked" | "pending";

export interface ReadinessModuleOverview {
  id: ReadinessModuleId;
  label: string;
  delegateModule: string;
  status: ReadinessStatus;
  passed: boolean;
}

export const READINESS_MODULE_META: Record<
  ReadinessModuleId,
  { label: string; delegateModule: string; depKey: string }
> = {
  need: { label: "Need Experience", delegateModule: "CH3-X5", depKey: "need" },
  action: { label: "Action Experience", delegateModule: "CH3-X6", depKey: "action" },
  contract: { label: "Contract Experience", delegateModule: "CH3-X7", depKey: "contract" },
  chat: { label: "Chat Experience", delegateModule: "CH3-X8", depKey: "chat" },
  timeline: { label: "Timeline Experience", delegateModule: "CH3-X9", depKey: "timeline" },
  notification: { label: "Notification Experience", delegateModule: "CH3-X10", depKey: "notification" },
  profile: { label: "Profile Experience", delegateModule: "CH3-X11", depKey: "profile" },
  "runtime-journey": { label: "Runtime Journey", delegateModule: "CH3-X12", depKey: "journey" },
  "runtime-state": { label: "Runtime State", delegateModule: "CH3-X13", depKey: "state" },
  "runtime-registry": { label: "Runtime Registry", delegateModule: "CH3-X14", depKey: "registry" },
  "runtime-coordinator": { label: "Runtime Coordinator", delegateModule: "CH3-X15", depKey: "coordinator" },
  "runtime-health": { label: "Runtime Health", delegateModule: "CH3-X16", depKey: "health" },
  "runtime-demo": { label: "Runtime Demo", delegateModule: "CH3-X17", depKey: "demo" },
  "runtime-preview": { label: "Runtime Preview", delegateModule: "CH3-X18", depKey: "preview" },
  "runtime-launcher": { label: "Runtime Launcher", delegateModule: "CH3-X19", depKey: "launcher" },
  "runtime-release": { label: "Runtime Release", delegateModule: "CH3-X20", depKey: "release" },
  "runtime-operations": { label: "Runtime Operations", delegateModule: "CH3-X21", depKey: "operations" },
  "runtime-executive": { label: "Runtime Executive", delegateModule: "CH3-X22", depKey: "executive" },
};

export interface ReadinessOverview {
  moduleCount: number;
  readyCount: number;
  partialCount: number;
  blockedCount: number;
  readinessPercentage: number;
  overallStatus: ReadinessStatus;
  modules: ReadinessModuleOverview[];
}

export function calculateReadinessPercentage(readyCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((readyCount / total) * 100);
}

export function buildReadinessOverview(modules: ReadinessModuleOverview[]): ReadinessOverview {
  const readyCount = modules.filter((m) => m.status === "ready").length;
  const partialCount = modules.filter((m) => m.status === "partial").length;
  const blockedCount = modules.filter((m) => m.status === "blocked").length;
  let overallStatus: ReadinessStatus = "ready";
  if (blockedCount > 0) overallStatus = "blocked";
  else if (partialCount > 0) overallStatus = "partial";
  else if (readyCount < modules.length) overallStatus = "pending";
  return {
    moduleCount: modules.length,
    readyCount,
    partialCount,
    blockedCount,
    readinessPercentage: calculateReadinessPercentage(readyCount, modules.length),
    overallStatus,
    modules,
  };
}
