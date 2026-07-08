import { COMMISSION_POLICY_STATUSES } from "./commission-schema.js";

export type CommissionPolicyStatus = (typeof COMMISSION_POLICY_STATUSES)[number];

export interface CommissionPolicy {
  policyId: string;
  version: string;
  name: string;
  description: string;
  status: CommissionPolicyStatus;
  baseCommissionBps: number;
  platformCostBps: number;
  riskFactorBpsMax: number;
  valueAddedBpsMax: number;
  incentiveDiscountBpsMax: number;
  minCommissionBps: number;
  maxCommissionBps: number;
  publishedAt?: string;
  deprecatedAt?: string;
}

export const SEED_COMMISSION_POLICIES: CommissionPolicy[] = [
  {
    policyId: "commission://app13/default@v1",
    version: "1.0.0",
    name: "APP13 Default Commission Policy",
    description: "Default weighted commission policy for MVP marketplace services.",
    status: "published",
    baseCommissionBps: 1200,
    platformCostBps: 200,
    riskFactorBpsMax: 250,
    valueAddedBpsMax: 150,
    incentiveDiscountBpsMax: 300,
    minCommissionBps: 800,
    maxCommissionBps: 2200,
    publishedAt: "2026-06-20T00:00:00.000Z",
  },
  {
    policyId: "commission://app13/premium-trade@v1",
    version: "1.0.0",
    name: "Premium Trade Commission Policy",
    description: "Elevated commission band for skilled trade categories.",
    status: "published",
    baseCommissionBps: 1500,
    platformCostBps: 250,
    riskFactorBpsMax: 300,
    valueAddedBpsMax: 180,
    incentiveDiscountBpsMax: 250,
    minCommissionBps: 1000,
    maxCommissionBps: 2500,
    publishedAt: "2026-06-20T00:00:00.000Z",
  },
];

export function getDefaultCommissionPolicy(): CommissionPolicy {
  return SEED_COMMISSION_POLICIES[0];
}

export function listCommissionPolicies(policies: CommissionPolicy[]): CommissionPolicy[] {
  return [...policies].sort((left, right) => left.policyId.localeCompare(right.policyId));
}

export function getCommissionPolicyById(
  policies: CommissionPolicy[],
  policyId: string
): CommissionPolicy | undefined {
  return policies.find((policy) => policy.policyId === policyId && policy.status === "published");
}
