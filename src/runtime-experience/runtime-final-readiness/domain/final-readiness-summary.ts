import type { FinalReadinessOverview } from "./final-readiness-overview.js";
import type { FinalReadinessRisk } from "./final-readiness-risks.js";
import type { FinalReadinessCheck } from "./final-readiness-checks.js";

export interface FinalReadinessSummary {
  overview: FinalReadinessOverview;
  mitigatedRiskCount: number;
  totalRiskCount: number;
  passedCheckCount: number;
  totalCheckCount: number;
  readyForProduction: boolean;
  readOnly: true;
  delegated: true;
}

export function buildFinalReadinessSummary(input: {
  overview: FinalReadinessOverview;
  risks: FinalReadinessRisk[];
  checks: FinalReadinessCheck[];
  certificationApproved: boolean;
}): FinalReadinessSummary {
  const mitigatedRiskCount = input.risks.filter((r) => r.mitigated).length;
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  const readyForProduction =
    input.overview.overallStatus === "approved" &&
    input.certificationApproved &&
    mitigatedRiskCount === input.risks.length &&
    passedCheckCount === input.checks.length;

  return {
    overview: input.overview,
    mitigatedRiskCount,
    totalRiskCount: input.risks.length,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    readyForProduction,
    readOnly: true,
    delegated: true,
  };
}
