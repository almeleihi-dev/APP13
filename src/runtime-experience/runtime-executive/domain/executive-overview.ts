export const EXECUTIVE_MODULE_IDS = [
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
] as const;

export type ExecutiveModuleId = (typeof EXECUTIVE_MODULE_IDS)[number];

export type ExecutiveStatus = "on-track" | "attention" | "at-risk" | "unknown";

export interface ExecutiveModuleStatus {
  id: ExecutiveModuleId;
  label: string;
  delegateModule: string;
  status: ExecutiveStatus;
  healthy: boolean;
}

export const EXECUTIVE_MODULE_META: Record<
  ExecutiveModuleId,
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
};

export interface ExecutiveOverview {
  moduleCount: number;
  onTrackCount: number;
  attentionCount: number;
  atRiskCount: number;
  overallStatus: ExecutiveStatus;
  modules: ExecutiveModuleStatus[];
}

export function buildExecutiveOverview(modules: ExecutiveModuleStatus[]): ExecutiveOverview {
  const onTrackCount = modules.filter((m) => m.status === "on-track").length;
  const attentionCount = modules.filter((m) => m.status === "attention").length;
  const atRiskCount = modules.filter((m) => m.status === "at-risk").length;
  let overallStatus: ExecutiveStatus = "on-track";
  if (atRiskCount > 0) overallStatus = "at-risk";
  else if (attentionCount > 0) overallStatus = "attention";
  return {
    moduleCount: modules.length,
    onTrackCount,
    attentionCount,
    atRiskCount,
    overallStatus,
    modules,
  };
}
