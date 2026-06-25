import type { CertificationLevel } from "./blueprint-certification.js";
import type { MaturityLevel } from "./blueprint-lifecycle.js";

export interface GovernancePolicy {
  policyId: string;
  name: string;
  description: string;
  requiredCertification: CertificationLevel;
  requiredMaturity: MaturityLevel;
  enforceSemanticVersion: boolean;
  allowDuplicateTaxonomy: boolean;
}

export const GOVERNANCE_POLICIES: GovernancePolicy[] = [
  {
    policyId: "gov://publish/default",
    name: "Default Publish Policy",
    description: "Minimum bronze certification and emerging maturity required for publication.",
    requiredCertification: "bronze",
    requiredMaturity: "emerging",
    enforceSemanticVersion: true,
    allowDuplicateTaxonomy: false,
  },
  {
    policyId: "gov://certify/silver",
    name: "Silver Certification Policy",
    description: "Requires validated blueprint with TEKRR and execution compile readiness.",
    requiredCertification: "silver",
    requiredMaturity: "stable",
    enforceSemanticVersion: true,
    allowDuplicateTaxonomy: false,
  },
  {
    policyId: "gov://certify/gold",
    name: "Gold Certification Policy",
    description: "Requires mature blueprint with full lineage and quality score >= 80.",
    requiredCertification: "gold",
    requiredMaturity: "mature",
    enforceSemanticVersion: true,
    allowDuplicateTaxonomy: false,
  },
  {
    policyId: "gov://marketplace/readiness",
    name: "Marketplace Readiness Policy",
    description: "Gold or platinum certification with country and language metadata.",
    requiredCertification: "gold",
    requiredMaturity: "mature",
    enforceSemanticVersion: true,
    allowDuplicateTaxonomy: false,
  },
];

export function getGovernancePolicy(policyId: string): GovernancePolicy | undefined {
  return GOVERNANCE_POLICIES.find((policy) => policy.policyId === policyId);
}

export function listGovernancePolicies(): GovernancePolicy[] {
  return [...GOVERNANCE_POLICIES];
}

export function evaluatePolicyCompliance(input: {
  certificationLevel: CertificationLevel;
  maturityLevel: MaturityLevel;
  policyId?: string;
}): { compliant: boolean; policy: GovernancePolicy; gaps: string[] } {
  const policy = getGovernancePolicy(input.policyId ?? "gov://publish/default") ?? GOVERNANCE_POLICIES[0];
  const gaps: string[] = [];

  const certOrder = ["unverified", "bronze", "silver", "gold", "platinum"];
  const maturityOrder = ["draft", "emerging", "stable", "mature", "deprecated"];

  if (certOrder.indexOf(input.certificationLevel) < certOrder.indexOf(policy.requiredCertification)) {
    gaps.push(`Certification ${input.certificationLevel} below required ${policy.requiredCertification}`);
  }
  if (maturityOrder.indexOf(input.maturityLevel) < maturityOrder.indexOf(policy.requiredMaturity)) {
    gaps.push(`Maturity ${input.maturityLevel} below required ${policy.requiredMaturity}`);
  }

  return {
    compliant: gaps.length === 0,
    policy,
    gaps,
  };
}
