import type { ReadinessOverview } from "./readiness-overview.js";
import type { ReadinessGate } from "./readiness-gates.js";
import type { ReadinessCheck } from "./readiness-checks.js";

export interface ReadinessSummary {
  overview: ReadinessOverview;
  openGateCount: number;
  totalGateCount: number;
  passedCheckCount: number;
  totalCheckCount: number;
  readyForHandoff: boolean;
  readOnly: true;
  delegated: true;
}

export function buildReadinessSummary(input: {
  overview: ReadinessOverview;
  gates: ReadinessGate[];
  checks: ReadinessCheck[];
}): ReadinessSummary {
  const openGateCount = input.gates.filter((g) => g.status === "open").length;
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  const handoffGate = input.gates.find((g) => g.id === "handoff-gate");
  return {
    overview: input.overview,
    openGateCount,
    totalGateCount: input.gates.length,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    readyForHandoff: handoffGate?.status === "open",
    readOnly: true,
    delegated: true,
  };
}
