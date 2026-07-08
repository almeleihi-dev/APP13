import type { CertificationOverview } from "./certification-overview.js";
import type { CertificationCheck } from "./certification-checks.js";

export type CertificationAuthorityStatus = "certified" | "conditional" | "pending" | "rejected";

export interface CertificationStatus {
  authorityStatus: CertificationAuthorityStatus;
  certified: boolean;
  certificationPercentage: number;
  passedCheckCount: number;
  totalCheckCount: number;
  readyForProductionApproval: boolean;
  releaseCertified: boolean;
  readinessComplete: boolean;
  readOnly: true;
  delegated: true;
}

export function buildCertificationStatus(input: {
  overview: CertificationOverview;
  checks: CertificationCheck[];
  releaseCertified: boolean;
  readinessComplete: boolean;
}): CertificationStatus {
  const passedCheckCount = input.checks.filter((c) => c.status === "passed").length;
  const readyForProductionApproval =
    input.overview.overallStatus === "certified" &&
    input.releaseCertified &&
    input.readinessComplete &&
    passedCheckCount === input.checks.length;

  return {
    authorityStatus: input.overview.overallStatus,
    certified: input.overview.overallStatus === "certified",
    certificationPercentage: input.overview.certificationPercentage,
    passedCheckCount,
    totalCheckCount: input.checks.length,
    readyForProductionApproval,
    releaseCertified: input.releaseCertified,
    readinessComplete: input.readinessComplete,
    readOnly: true,
    delegated: true,
  };
}
