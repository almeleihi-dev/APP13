import type { DifficultyLevel } from "./dynamic-pricing-schema.js";

export interface CategoryBaseRate {
  category: string;
  baseMin: number;
  baseMax: number;
  hourlyRate: number;
  marketLabel: string;
}

export interface PricingReferenceValues {
  taskWeight: number;
  stageWeight: number;
  skillWeight: number;
  resourceWeight: number;
  dependencyWeight: number;
  parallelDiscount: number;
  riskWeightHigh: number;
  riskWeightMedium: number;
  urgencyMultipliers: Record<string, number>;
  distanceMultipliers: Record<string, number>;
  categoryBaseRates: CategoryBaseRate[];
}

export const PRICING_REFERENCE_VALUES: PricingReferenceValues = {
  taskWeight: 12,
  stageWeight: 25,
  skillWeight: 18,
  resourceWeight: 10,
  dependencyWeight: 8,
  parallelDiscount: 0.92,
  riskWeightHigh: 45,
  riskWeightMedium: 22,
  urgencyMultipliers: {
    standard: 1.0,
    priority: 1.15,
    urgent: 1.3,
  },
  distanceMultipliers: {
    local: 1.0,
    regional: 1.12,
    remote: 1.25,
  },
  categoryBaseRates: [
    { category: "moving", baseMin: 80, baseMax: 120, hourlyRate: 35, marketLabel: "Moving Services" },
    {
      category: "cleaning",
      baseMin: 100,
      baseMax: 150,
      hourlyRate: 30,
      marketLabel: "Cleaning Services",
    },
    {
      category: "delivery",
      baseMin: 25,
      baseMax: 45,
      hourlyRate: 28,
      marketLabel: "Delivery Services",
    },
    {
      category: "maintenance",
      baseMin: 75,
      baseMax: 110,
      hourlyRate: 45,
      marketLabel: "Maintenance Services",
    },
    {
      category: "professional_service_request",
      baseMin: 0,
      baseMax: 0,
      hourlyRate: 55,
      marketLabel: "Professional Services",
    },
    {
      category: "documentation_evidence",
      baseMin: 20,
      baseMax: 40,
      hourlyRate: 25,
      marketLabel: "Documentation",
    },
    {
      category: "inspection_verification",
      baseMin: 35,
      baseMax: 60,
      hourlyRate: 40,
      marketLabel: "Inspection",
    },
    {
      category: "scheduling_coordination",
      baseMin: 15,
      baseMax: 30,
      hourlyRate: 22,
      marketLabel: "Coordination",
    },
    {
      category: "pricing_estimation",
      baseMin: 20,
      baseMax: 35,
      hourlyRate: 35,
      marketLabel: "Estimation",
    },
    {
      category: "contract_preparation",
      baseMin: 50,
      baseMax: 90,
      hourlyRate: 60,
      marketLabel: "Contract Preparation",
    },
  ],
};

export function getCategoryBaseRate(category: string): CategoryBaseRate {
  return (
    PRICING_REFERENCE_VALUES.categoryBaseRates.find((entry) => entry.category === category) ??
    PRICING_REFERENCE_VALUES.categoryBaseRates[0]!
  );
}

export function resolveDifficultyLevel(complexityScore: number): DifficultyLevel {
  if (complexityScore >= 75) return "expert";
  if (complexityScore >= 55) return "high";
  if (complexityScore >= 35) return "moderate";
  return "low";
}

export function difficultyMultiplier(level: DifficultyLevel): number {
  switch (level) {
    case "low":
      return 1.0;
    case "moderate":
      return 1.1;
    case "high":
      return 1.22;
    case "expert":
      return 1.35;
  }
}
