export const CERTIFICATION_MODULE_IDS = [
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
] as const;

export type CertificationModuleId = (typeof CERTIFICATION_MODULE_IDS)[number];

export type CertificationModuleStatus = "certified" | "conditional" | "pending" | "rejected";

export interface CertificationModuleOverview {
  id: CertificationModuleId;
  label: string;
  delegateModule: string;
  status: CertificationModuleStatus;
  certified: boolean;
}

export const CERTIFICATION_MODULE_META: Record<
  CertificationModuleId,
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
};

export interface CertificationOverview {
  moduleCount: number;
  certifiedCount: number;
  conditionalCount: number;
  rejectedCount: number;
  certificationPercentage: number;
  overallStatus: CertificationModuleStatus;
  modules: CertificationModuleOverview[];
}

export function calculateCertificationPercentage(certifiedCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((certifiedCount / total) * 100);
}

export function buildCertificationOverview(modules: CertificationModuleOverview[]): CertificationOverview {
  const certifiedCount = modules.filter((m) => m.status === "certified").length;
  const conditionalCount = modules.filter((m) => m.status === "conditional").length;
  const rejectedCount = modules.filter((m) => m.status === "rejected").length;
  let overallStatus: CertificationModuleStatus = "certified";
  if (rejectedCount > 0) overallStatus = "rejected";
  else if (conditionalCount > 0) overallStatus = "conditional";
  else if (certifiedCount < modules.length) overallStatus = "pending";
  return {
    moduleCount: modules.length,
    certifiedCount,
    conditionalCount,
    rejectedCount,
    certificationPercentage: calculateCertificationPercentage(certifiedCount, modules.length),
    overallStatus,
    modules,
  };
}
