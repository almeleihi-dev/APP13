export const CH3_RUNTIME_MODULE_IDS = [
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
  "runtime-readiness",
  "runtime-certification",
  "runtime-final-readiness",
  "runtime-production-approval",
  "runtime-operations-center",
  "runtime-launch-control",
  "runtime-launch-readiness-authority",
  "runtime-executive-launch-authority",
] as const;

export type Ch3RuntimeModuleId = (typeof CH3_RUNTIME_MODULE_IDS)[number];

export type Ch3RuntimeModuleStatus = "validated" | "pending" | "failed";

export interface Ch3RuntimeModuleEntry {
  id: Ch3RuntimeModuleId;
  label: string;
  chapterCode: string;
  depKey: string;
  routePrefix: string;
  apiEndpointCount: number;
  status: Ch3RuntimeModuleStatus;
  validated: boolean;
}

export const CH3_RUNTIME_MODULE_REGISTRY: Record<
  Ch3RuntimeModuleId,
  { label: string; chapterCode: string; depKey: string; routePrefix: string; apiEndpointCount: number }
> = {
  need: { label: "Need Experience", chapterCode: "CH3-X5", depKey: "need", routePrefix: "/need-experience", apiEndpointCount: 12 },
  action: { label: "Action Experience", chapterCode: "CH3-X6", depKey: "action", routePrefix: "/action-experience", apiEndpointCount: 16 },
  contract: { label: "Contract Experience", chapterCode: "CH3-X7", depKey: "contract", routePrefix: "/contract-experience", apiEndpointCount: 9 },
  chat: { label: "Chat Experience", chapterCode: "CH3-X8", depKey: "chat", routePrefix: "/chat-experience", apiEndpointCount: 10 },
  timeline: { label: "Timeline Experience", chapterCode: "CH3-X9", depKey: "timeline", routePrefix: "/timeline-experience", apiEndpointCount: 8 },
  notification: { label: "Notification Experience", chapterCode: "CH3-X10", depKey: "notification", routePrefix: "/notification-experience", apiEndpointCount: 8 },
  profile: { label: "Profile Experience", chapterCode: "CH3-X11", depKey: "profile", routePrefix: "/profile-experience", apiEndpointCount: 10 },
  "runtime-journey": { label: "Runtime Journey", chapterCode: "CH3-X12", depKey: "journey", routePrefix: "/runtime-journey", apiEndpointCount: 11 },
  "runtime-state": { label: "Runtime State", chapterCode: "CH3-X13", depKey: "state", routePrefix: "/runtime-state", apiEndpointCount: 11 },
  "runtime-registry": { label: "Runtime Registry", chapterCode: "CH3-X14", depKey: "registry", routePrefix: "/runtime-registry", apiEndpointCount: 9 },
  "runtime-coordinator": { label: "Runtime Coordinator", chapterCode: "CH3-X15", depKey: "coordinator", routePrefix: "/runtime-coordinator", apiEndpointCount: 10 },
  "runtime-health": { label: "Runtime Health", chapterCode: "CH3-X16", depKey: "health", routePrefix: "/runtime-health", apiEndpointCount: 6 },
  "runtime-demo": { label: "Runtime Demo", chapterCode: "CH3-X17", depKey: "demo", routePrefix: "/runtime-demo", apiEndpointCount: 13 },
  "runtime-preview": { label: "Runtime Preview", chapterCode: "CH3-X18", depKey: "preview", routePrefix: "/runtime-preview", apiEndpointCount: 7 },
  "runtime-launcher": { label: "Runtime Launcher", chapterCode: "CH3-X19", depKey: "launcher", routePrefix: "/runtime-launcher", apiEndpointCount: 9 },
  "runtime-release": { label: "Runtime Release", chapterCode: "CH3-X20", depKey: "release", routePrefix: "/runtime-release", apiEndpointCount: 9 },
  "runtime-operations": { label: "Runtime Operations", chapterCode: "CH3-X21", depKey: "operations", routePrefix: "/runtime-operations", apiEndpointCount: 8 },
  "runtime-executive": { label: "Runtime Executive", chapterCode: "CH3-X22", depKey: "executive", routePrefix: "/runtime-executive", apiEndpointCount: 8 },
  "runtime-readiness": { label: "Runtime Readiness", chapterCode: "CH3-X23", depKey: "readiness", routePrefix: "/runtime-readiness", apiEndpointCount: 8 },
  "runtime-certification": { label: "Runtime Certification", chapterCode: "CH3-X24", depKey: "certification", routePrefix: "/runtime-certification", apiEndpointCount: 8 },
  "runtime-final-readiness": { label: "Runtime Final Readiness", chapterCode: "CH3-X25", depKey: "finalReadiness", routePrefix: "/runtime-final-readiness", apiEndpointCount: 8 },
  "runtime-production-approval": { label: "Production Approval", chapterCode: "CH3-X26", depKey: "productionApproval", routePrefix: "/runtime-production-approval", apiEndpointCount: 8 },
  "runtime-operations-center": { label: "Operations Center", chapterCode: "CH3-X27", depKey: "operationsCenter", routePrefix: "/runtime-operations-center", apiEndpointCount: 8 },
  "runtime-launch-control": { label: "Launch Control", chapterCode: "CH3-X28", depKey: "launchControl", routePrefix: "/runtime-launch-control", apiEndpointCount: 8 },
  "runtime-launch-readiness-authority": { label: "Launch Readiness Authority", chapterCode: "CH3-X29", depKey: "launchReadinessAuthority", routePrefix: "/runtime-launch-readiness-authority", apiEndpointCount: 8 },
  "runtime-executive-launch-authority": { label: "Executive Launch Authority", chapterCode: "CH3-X30", depKey: "executiveLaunchAuthority", routePrefix: "/runtime-executive-launch-authority", apiEndpointCount: 8 },
};

export interface RuntimeCompletionOverview {
  moduleCount: number;
  validatedCount: number;
  pendingCount: number;
  failedCount: number;
  completionPercentage: number;
  overallStatus: Ch3RuntimeModuleStatus | "completed";
  modules: Ch3RuntimeModuleEntry[];
}

export function calculateCompletionPercentage(validatedCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((validatedCount / total) * 100);
}

export function buildRuntimeCompletionOverview(modules: Ch3RuntimeModuleEntry[]): RuntimeCompletionOverview {
  const validatedCount = modules.filter((m) => m.status === "validated").length;
  const pendingCount = modules.filter((m) => m.status === "pending").length;
  const failedCount = modules.filter((m) => m.status === "failed").length;
  let overallStatus: RuntimeCompletionOverview["overallStatus"] = "completed";
  if (failedCount > 0) overallStatus = "failed";
  else if (pendingCount > 0) overallStatus = "pending";
  else if (validatedCount < modules.length) overallStatus = "pending";
  return {
    moduleCount: modules.length,
    validatedCount,
    pendingCount,
    failedCount,
    completionPercentage: calculateCompletionPercentage(validatedCount, modules.length),
    overallStatus,
    modules,
  };
}
