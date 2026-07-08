export const EXECUTIVE_LAUNCH_MODULE_IDS = [
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
] as const;

export type ExecutiveLaunchModuleId = (typeof EXECUTIVE_LAUNCH_MODULE_IDS)[number];

export type ExecutiveLaunchModuleStatus = "authorized" | "conditional" | "pending" | "denied";

export interface ExecutiveLaunchModuleOverview {
  id: ExecutiveLaunchModuleId;
  label: string;
  delegateModule: string;
  status: ExecutiveLaunchModuleStatus;
  authorized: boolean;
}

export const EXECUTIVE_LAUNCH_MODULE_META: Record<
  ExecutiveLaunchModuleId,
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
  "runtime-readiness": { label: "Runtime Readiness", delegateModule: "CH3-X23", depKey: "readiness" },
  "runtime-certification": { label: "Runtime Certification", delegateModule: "CH3-X24", depKey: "certification" },
  "runtime-final-readiness": { label: "Runtime Final Readiness", delegateModule: "CH3-X25", depKey: "finalReadiness" },
  "runtime-production-approval": {
    label: "Production Approval",
    delegateModule: "CH3-X26",
    depKey: "productionApproval",
  },
  "runtime-operations-center": {
    label: "Operations Center",
    delegateModule: "CH3-X27",
    depKey: "operationsCenter",
  },
  "runtime-launch-control": {
    label: "Launch Control",
    delegateModule: "CH3-X28",
    depKey: "launchControl",
  },
  "runtime-launch-readiness-authority": {
    label: "Launch Readiness Authority",
    delegateModule: "CH3-X29",
    depKey: "launchReadinessAuthority",
  },
};

export interface ExecutiveLaunchOverview {
  moduleCount: number;
  authorizedCount: number;
  conditionalCount: number;
  deniedCount: number;
  authorizationPercentage: number;
  overallStatus: ExecutiveLaunchModuleStatus;
  modules: ExecutiveLaunchModuleOverview[];
}

export function calculateAuthorizationPercentage(authorizedCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((authorizedCount / total) * 100);
}

export function buildExecutiveLaunchOverview(modules: ExecutiveLaunchModuleOverview[]): ExecutiveLaunchOverview {
  const authorizedCount = modules.filter((m) => m.status === "authorized").length;
  const conditionalCount = modules.filter((m) => m.status === "conditional").length;
  const deniedCount = modules.filter((m) => m.status === "denied").length;
  let overallStatus: ExecutiveLaunchModuleStatus = "authorized";
  if (deniedCount > 0) overallStatus = "denied";
  else if (conditionalCount > 0) overallStatus = "conditional";
  else if (authorizedCount < modules.length) overallStatus = "pending";
  return {
    moduleCount: modules.length,
    authorizedCount,
    conditionalCount,
    deniedCount,
    authorizationPercentage: calculateAuthorizationPercentage(authorizedCount, modules.length),
    overallStatus,
    modules,
  };
}
