import type { EscrowReleaseStrategy, ProfessionCategory } from "./types.js";

export interface EscrowRule {
  id: string;
  releaseStrategy: EscrowReleaseStrategy;
  milestoneCount: number;
  percentages: number[];
  stageLabels: string[];
  triggers: string[];
}

export const ESCROW_RULES: Record<string, EscrowRule> = {
  cleaning_single: {
    id: "cleaning_single",
    releaseStrategy: "single_release",
    milestoneCount: 1,
    percentages: [100],
    stageLabels: ["Service completion"],
    triggers: ["Cleaning checklist signed off and space accepted"],
  },
  design_split: {
    id: "design_split",
    releaseStrategy: "milestone_based",
    milestoneCount: 2,
    percentages: [50, 50],
    stageLabels: ["Concept approval", "Final delivery"],
    triggers: ["Approved concept or draft assets", "Final source files delivered"],
  },
  software_phased: {
    id: "software_phased",
    releaseStrategy: "milestone_based",
    milestoneCount: 4,
    percentages: [25, 25, 25, 25],
    stageLabels: ["Discovery", "Build phase 1", "Build phase 2", "Launch handover"],
    triggers: [
      "Requirements and wireframes approved",
      "Core features demo accepted",
      "Admin dashboard and integrations verified",
      "Production deployment and handover complete",
    ],
  },
  construction_multi: {
    id: "construction_multi",
    releaseStrategy: "multi_stage",
    milestoneCount: 3,
    percentages: [30, 40, 30],
    stageLabels: ["Site assessment", "Work in progress", "Completion sign-off"],
    triggers: [
      "Diagnosis and parts list approved",
      "Primary repair or installation completed",
      "Safety checks passed and area restored",
    ],
  },
  consulting_phased: {
    id: "consulting_phased",
    releaseStrategy: "milestone_based",
    milestoneCount: 2,
    percentages: [40, 60],
    stageLabels: ["Discovery delivery", "Final advisory report"],
    triggers: ["Discovery findings accepted", "Final report and recommendations delivered"],
  },
  events_phased: {
    id: "events_phased",
    releaseStrategy: "milestone_based",
    milestoneCount: 3,
    percentages: [30, 40, 30],
    stageLabels: ["Planning package", "Vendor lock-in", "Event execution"],
    triggers: ["Event plan approved", "Vendors confirmed", "Post-event summary delivered"],
  },
  education_phased: {
    id: "education_phased",
    releaseStrategy: "milestone_based",
    milestoneCount: 2,
    percentages: [50, 50],
    stageLabels: ["Program setup", "Session cycle complete"],
    triggers: ["Lesson plan and schedule agreed", "Sessions delivered and progress report shared"],
  },
  default_split: {
    id: "default_split",
    releaseStrategy: "milestone_based",
    milestoneCount: 2,
    percentages: [50, 50],
    stageLabels: ["Initial delivery", "Final acceptance"],
    triggers: ["Initial deliverables accepted", "Final deliverables accepted"],
  },
};

const CATEGORY_RULE_MAP: Record<ProfessionCategory, string> = {
  cleaning: "cleaning_single",
  design: "design_split",
  software: "software_phased",
  construction: "construction_multi",
  consulting: "consulting_phased",
  events: "events_phased",
  education: "education_phased",
  general: "default_split",
};

const ACTION_CODE_RULE_OVERRIDES: Array<{ codes: string[]; ruleId: string }> = [
  { codes: ["A.4.2"], ruleId: "cleaning_single" },
  { codes: ["E.1.1"], ruleId: "design_split" },
  { codes: ["E.3.1", "B.3.3"], ruleId: "software_phased" },
  { codes: ["B.1.2", "B.2.1", "A.2.1"], ruleId: "construction_multi" },
  { codes: ["C.1.1", "C.1.2"], ruleId: "consulting_phased" },
  { codes: ["F.1.2"], ruleId: "events_phased" },
  { codes: ["G.1.1"], ruleId: "education_phased" },
];

export function getEscrowRule(
  category: ProfessionCategory,
  actionCodes: string[]
): EscrowRule {
  for (const override of ACTION_CODE_RULE_OVERRIDES) {
    if (actionCodes.some((code) => override.codes.includes(code))) {
      return ESCROW_RULES[override.ruleId];
    }
  }

  const ruleId = CATEGORY_RULE_MAP[category] ?? "default_split";
  return ESCROW_RULES[ruleId];
}

export function buildEscrowPlan(
  rule: EscrowRule,
  milestones: Array<{ title: string }>
): {
  recommended_structure: Array<{ label: string; percentage: number; trigger: string }>;
  release_strategy: EscrowReleaseStrategy;
} {
  const recommended_structure = rule.percentages.map((percentage, index) => ({
    label: milestones[index]?.title ?? rule.stageLabels[index] ?? `Milestone ${index + 1}`,
    percentage,
    trigger: rule.triggers[index] ?? "Milestone acceptance criteria met",
  }));

  return {
    recommended_structure,
    release_strategy: rule.releaseStrategy,
  };
}
