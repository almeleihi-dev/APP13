import { PRICING_POLICY_STATUSES } from "./pricing-schema.js";

export type PricingPolicyStatus = (typeof PRICING_POLICY_STATUSES)[number];

export interface PricingPolicy {
  policyId: string;
  version: string;
  name: string;
  description: string;
  status: PricingPolicyStatus;
  efficiencyFactorDefault: number;
  marketValueFloor: number;
  marketValueCeiling: number;
  technicalValueFloor: number;
  confidenceThreshold: number;
  publishedAt?: string;
  deprecatedAt?: string;
}

export const SEED_PRICING_POLICIES: PricingPolicy[] = [
  {
    policyId: "pricing://app13/default@v1",
    version: "1.0.0",
    name: "APP13 Default Pricing Policy",
    description: "Default three-layer pricing policy for MVP marketplace listings.",
    status: "published",
    efficiencyFactorDefault: 0.92,
    marketValueFloor: 0.85,
    marketValueCeiling: 1.2,
    technicalValueFloor: 5000,
    confidenceThreshold: 70,
    publishedAt: "2026-06-20T00:00:00.000Z",
  },
  {
    policyId: "pricing://app13/premium-trade@v1",
    version: "1.0.0",
    name: "Premium Trade Pricing Policy",
    description: "Elevated market value band for skilled trade domains.",
    status: "published",
    efficiencyFactorDefault: 0.9,
    marketValueFloor: 0.95,
    marketValueCeiling: 1.35,
    technicalValueFloor: 8000,
    confidenceThreshold: 75,
    publishedAt: "2026-06-20T00:00:00.000Z",
  },
];

export function getDefaultPricingPolicy(): PricingPolicy {
  return SEED_PRICING_POLICIES[0];
}

export function listPricingPolicies(policies: PricingPolicy[]): PricingPolicy[] {
  return [...policies].sort((left, right) => left.policyId.localeCompare(right.policyId));
}

export function getPricingPolicyById(
  policies: PricingPolicy[],
  policyId: string
): PricingPolicy | undefined {
  return policies.find((policy) => policy.policyId === policyId && policy.status === "published");
}
