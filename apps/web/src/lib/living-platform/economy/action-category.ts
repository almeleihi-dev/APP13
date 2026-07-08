import type { ActionContract, LivingPlatformState } from "../types.js";

export interface ActionCategoryRule {
  category: string;
  keywords: string[];
  baseValue: number;
  baseDays: number;
  seedDemand: number;
  seedSupply: number;
}

export const ACTION_CATEGORY_RULES: ActionCategoryRule[] = [
  {
    category: "Mobile App Design",
    keywords: ["app design", "mobile design", "ux", "ui design", "visual design"],
    baseValue: 450,
    baseDays: 9,
    seedDemand: 920,
    seedSupply: 180,
  },
  {
    category: "Software Development",
    keywords: ["develop", "development", "engineering", "api", "software", "feature build"],
    baseValue: 680,
    baseDays: 14,
    seedDemand: 1100,
    seedSupply: 420,
  },
  {
    category: "Certified Underwater Welding",
    keywords: ["underwater welding", "welding", "certified welding"],
    baseValue: 1200,
    baseDays: 5,
    seedDemand: 880,
    seedSupply: 42,
  },
  {
    category: "Architecture & Planning",
    keywords: ["architectural", "plan", "planning", "site assessment", "permit"],
    baseValue: 520,
    baseDays: 12,
    seedDemand: 640,
    seedSupply: 210,
  },
  {
    category: "Construction & Trades",
    keywords: ["construction", "foundation", "framing", "electrical", "plumbing", "hvac"],
    baseValue: 890,
    baseDays: 10,
    seedDemand: 760,
    seedSupply: 290,
  },
  {
    category: "Business Strategy",
    keywords: ["business plan", "strategy", "market validation", "financial model"],
    baseValue: 380,
    baseDays: 7,
    seedDemand: 540,
    seedSupply: 320,
  },
  {
    category: "Quality & Inspection",
    keywords: ["inspection", "qa", "quality", "audit", "verification"],
    baseValue: 320,
    baseDays: 4,
    seedDemand: 480,
    seedSupply: 260,
  },
  {
    category: "Professional Services",
    keywords: ["service", "consulting", "delivery", "professional"],
    baseValue: 280,
    baseDays: 6,
    seedDemand: 400,
    seedSupply: 400,
  },
];

export function resolveActionCategory(actionName: string): ActionCategoryRule {
  const normalized = actionName.trim().toLowerCase();
  for (const rule of ACTION_CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule;
    }
  }
  return ACTION_CATEGORY_RULES[ACTION_CATEGORY_RULES.length - 1]!;
}

export function findMicroActionValue(
  state: LivingPlatformState,
  projectId: string | null | undefined,
  microActionId: string | null | undefined,
): number | null {
  if (!projectId || !microActionId) return null;
  const project = state.projects.find((item) => item.projectId === projectId);
  if (!project) return null;
  for (const phase of project.phases) {
    for (const sub of phase.subPhases) {
      const micro = sub.microActions.find((item) => item.microActionId === microActionId);
      if (micro) return micro.estimatedCost;
    }
  }
  return null;
}

export function estimateContractValue(contract: ActionContract, state: LivingPlatformState): number {
  const microValue = findMicroActionValue(state, contract.projectId, contract.microActionId);
  if (microValue != null) return microValue;
  return resolveActionCategory(contract.actionDetails.name).baseValue;
}

export function executionDaysForContract(contract: ActionContract): number {
  const start = contract.acceptedAt ?? contract.createdAt;
  const end = contract.completedAt ?? contract.updatedAt;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function contractEconomyScope(contract: ActionContract): "individual" | "team" | "project" {
  if (contract.projectId && contract.microActionId) return "project";
  if (contract.teamId || contract.contractScope === "team") return "team";
  return "individual";
}

export function evidenceQualityScore(contract: ActionContract): number {
  if (contract.evidence.length === 0) return 0;
  const confirmed = contract.evidence.filter((item) => item.status === "confirmed").length;
  const attached = contract.evidence.length;
  return Math.round(((confirmed * 70 + attached * 30) / Math.max(attached, 1)));
}
