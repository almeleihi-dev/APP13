import type { ContractTemplate, MilestoneTemplate, TekrrFieldRequirement } from "./types.js";
import { MVP_ACTION_TYPES } from "../../action/domain/action.js";

const DEFAULT_MILESTONES: MilestoneTemplate[] = [
  { sequenceOrder: 1, milestoneCode: "M-ACCESS", name: "Access / Kickoff", responsibleParty: "provider", tekrrDimension: "T", blocking: true },
  { sequenceOrder: 2, milestoneCode: "M-SCOPE", name: "Scope Confirmed", responsibleParty: "both", tekrrDimension: "E", blocking: true },
  { sequenceOrder: 3, milestoneCode: "M-WIP", name: "Work In Progress", responsibleParty: "provider", tekrrDimension: "E", blocking: true },
  { sequenceOrder: 4, milestoneCode: "M-VERIFY", name: "Verification", responsibleParty: "provider", tekrrDimension: "K", blocking: true },
  { sequenceOrder: 5, milestoneCode: "M-ACCEPT", name: "Customer Acceptance", responsibleParty: "customer", tekrrDimension: "S", blocking: true },
  { sequenceOrder: 6, milestoneCode: "M-COMPLETE", name: "Complete", responsibleParty: "system", tekrrDimension: "S", blocking: true },
];

const BASE_REQUIRED_FIELDS: TekrrFieldRequirement[] = [
  { dimension: "T", field: "scheduled_start" },
  { dimension: "T", field: "completion_deadline" },
  { dimension: "E", field: "deliverables" },
  { dimension: "K", field: "standard_of_care" },
  { dimension: "R", field: "risk_level" },
  { dimension: "S", field: "acceptance_criteria" },
];

function buildTemplate(
  actionCode: string,
  actionName: string,
  domain: string,
  minProviderTier: "T1" | "T2" = "T1"
): ContractTemplate {
  return {
    templateId: `CT-${actionCode}@v1`,
    actionCode,
    actionName,
    domain,
    version: "1.0.0",
    minCustomerTier: "T1",
    minProviderTier,
    defaultRiskLevel: 3,
    clauseModules: [
      "CL-CORE-001",
      "CL-CORE-002",
      "CL-CORE-003",
      "CL-TIME-001",
      "CL-EFFORT-001",
      "CL-RESP-001",
    ],
    jurisdictionPack: "US-GENERIC-v1",
    contractTermType: "fixed",
    milestones: DEFAULT_MILESTONES,
    tekrrDimensions: ["T", "E", "K", "R", "S"],
    requiredTekrrFields: [...BASE_REQUIRED_FIELDS],
    filingWindowDays: 30,
  };
}

const T2_PROVIDER_CODES = new Set(["B.1.2", "B.2.1", "B.3.3", "H.1.1"]);

export const TEMPLATE_REGISTRY: Record<string, ContractTemplate> = Object.fromEntries(
  MVP_ACTION_TYPES.map((t) => [
    t.actionCode,
    buildTemplate(
      t.actionCode,
      t.actionName,
      t.domain,
      T2_PROVIDER_CODES.has(t.actionCode) ? "T2" : "T1"
    ),
  ])
);

export function getTemplateByActionCode(actionCode: string): ContractTemplate | undefined {
  return TEMPLATE_REGISTRY[actionCode];
}

export function getTemplateById(templateId: string): ContractTemplate | undefined {
  return Object.values(TEMPLATE_REGISTRY).find((t) => t.templateId === templateId);
}

export function listTemplates(): ContractTemplate[] {
  return Object.values(TEMPLATE_REGISTRY);
}
