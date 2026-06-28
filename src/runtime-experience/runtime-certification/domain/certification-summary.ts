import type { CertificationOverview } from "./certification-overview.js";
import type { CertificationStatus } from "./certification-status.js";
import type { CertificationCheck } from "./certification-checks.js";

export interface CertificationSummary {
  overview: CertificationOverview;
  status: CertificationStatus;
  passedCheckCount: number;
  totalCheckCount: number;
  readyForProductionApproval: boolean;
  readOnly: true;
  delegated: true;
}

export function buildCertificationSummary(input: {
  overview: CertificationOverview;
  status: CertificationStatus;
  checks: CertificationCheck[];
}): CertificationSummary {
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  return {
    overview: input.overview,
    status: input.status,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    readyForProductionApproval: input.status.readyForProductionApproval,
    readOnly: true,
    delegated: true,
  };
}
