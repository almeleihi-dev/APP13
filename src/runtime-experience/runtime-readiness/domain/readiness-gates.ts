import { READINESS_CHECK_IDS } from "./readiness-checks.js";

export type ReadinessGateStatus = "open" | "closed" | "conditional";

export interface ReadinessGate {
  id: string;
  title: string;
  description: string;
  status: ReadinessGateStatus;
  requiredChecks: string[];
  missingRequirements: string[];
  delegateModule: string;
}

export const READINESS_GATE_DEFINITIONS = [
  {
    id: "experience-gate",
    title: "Experience Gate",
    description: "All user runtime experiences must pass validation.",
    requiredChecks: [
      "need-experience",
      "action-experience",
      "contract-experience",
      "chat-experience",
      "timeline-experience",
      "notification-experience",
      "profile-experience",
    ],
    delegateModule: "CH3-X5",
  },
  {
    id: "runtime-stack-gate",
    title: "Runtime Stack Gate",
    description: "Core runtime stack must be ready for handoff.",
    requiredChecks: ["runtime-journey", "runtime-state", "runtime-registry", "runtime-coordinator"],
    delegateModule: "CH3-X12",
  },
  {
    id: "certification-gate",
    title: "Certification Gate",
    description: "Release candidate must be certified.",
    requiredChecks: ["runtime-health", "runtime-demo", "runtime-preview", "runtime-launcher", "runtime-release"],
    delegateModule: "CH3-X20",
  },
  {
    id: "operations-gate",
    title: "Operations Gate",
    description: "Operations center must report all modules operational.",
    requiredChecks: ["runtime-operations"],
    delegateModule: "CH3-X21",
  },
  {
    id: "executive-gate",
    title: "Executive Gate",
    description: "Executive dashboard must confirm on-track readiness.",
    requiredChecks: ["runtime-executive"],
    delegateModule: "CH3-X22",
  },
  {
    id: "handoff-gate",
    title: "Production Handoff Gate",
    description: "All gates must be open for production handoff.",
    requiredChecks: [...READINESS_CHECK_IDS],
    delegateModule: "CH3-X23",
  },
] as const;

export function buildReadinessGates(
  checks: Array<{ id: string; status: string }>
): ReadinessGate[] {
  const checkMap = Object.fromEntries(checks.map((c) => [c.id, c.status === "passed"]));

  return READINESS_GATE_DEFINITIONS.map((gate) => {
    const missingRequirements = gate.requiredChecks.filter((id) => !checkMap[id]);
    let status: ReadinessGateStatus = "open";
    if (missingRequirements.length === gate.requiredChecks.length) status = "closed";
    else if (missingRequirements.length > 0) status = "conditional";
    return {
      id: gate.id,
      title: gate.title,
      description: gate.description,
      status,
      requiredChecks: [...gate.requiredChecks],
      missingRequirements,
      delegateModule: gate.delegateModule,
    };
  });
}
