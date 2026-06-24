import { MVP_ACTION_TYPES, type ActionTypeDefinition } from "../../action/domain/action.js";
import { getTemplateByActionCode } from "../../contract/templates/registry.js";
import { BLUEPRINT_SCHEMA_VERSION } from "./blueprint-schema.js";
import type {
  ActionBlueprint,
  EvidenceRequirement,
  MilestonePatternRef,
  ProviderTier,
  TekrrBinding,
} from "./action-blueprint.js";

export interface TaxonomyBridgeEntry {
  action_code: string;
  action_name: string;
  domain: string;
  blueprint_id: string;
  seed_title: string;
  seed_summary: string;
  min_provider_tier: "T1" | "T2" | "T3";
  risk_level_default: 1 | 2 | 3 | 4 | 5;
  milestone_pattern: MilestonePatternRef[];
  evidence_requirements: EvidenceRequirement[];
}

const SEED_DEFINITIONS: Array<{
  actionCode: string;
  slug: string;
  seedTitle: string;
  seedSummary: string;
  riskLevel?: 1 | 2 | 3 | 4 | 5;
}> = [
  {
    actionCode: "A.2.1",
    slug: "surface-repair-standard",
    seedTitle: "Surface Repair — Standard Engagement",
    seedSummary: "Repair non-structural surfaces with documented before/after evidence.",
  },
  {
    actionCode: "A.4.1",
    slug: "routine-maintenance-scheduled",
    seedTitle: "Routine Maintenance — Scheduled Visit",
    seedSummary: "Scheduled upkeep visit preserving asset function with checklist completion.",
  },
  {
    actionCode: "A.4.2",
    slug: "cleaning-sanitization-residential",
    seedTitle: "Cleaning & Sanitization — Residential",
    seedSummary: "Residential cleaning and sanitization with checklist and timestamp evidence.",
    riskLevel: 2,
  },
  {
    actionCode: "B.1.2",
    slug: "plumbing-service-repair",
    seedTitle: "Plumbing Service — Repair Call",
    seedSummary: "Diagnose and repair plumbing systems with verification evidence.",
    riskLevel: 4,
  },
  {
    actionCode: "B.2.1",
    slug: "electrical-panel-upgrade",
    seedTitle: "Electrical Installation — Panel Upgrade",
    seedSummary: "Licensed electrical panel upgrade with test and credential verification.",
    riskLevel: 4,
  },
  {
    actionCode: "B.3.3",
    slug: "technical-troubleshooting-incident",
    seedTitle: "Technical Troubleshooting — Incident Response",
    seedSummary: "Incident diagnosis and remediation with documented test results.",
    riskLevel: 3,
  },
  {
    actionCode: "C.1.1",
    slug: "strategy-consulting-advisory",
    seedTitle: "Strategy Consulting — Advisory Engagement",
    seedSummary: "Strategy analysis and recommendation delivery with acceptance sign-off.",
    riskLevel: 3,
  },
  {
    actionCode: "C.1.2",
    slug: "operations-advisory-review",
    seedTitle: "Operations Advisory — Process Review",
    seedSummary: "Operational process review with deliverable documentation.",
    riskLevel: 3,
  },
  {
    actionCode: "D.1.1",
    slug: "personal-care-session",
    seedTitle: "Personal Care Assistance — Session",
    seedSummary: "Non-medical personal care session with responsibility-focused acceptance.",
    riskLevel: 4,
  },
  {
    actionCode: "D.3.1",
    slug: "household-management-weekly",
    seedTitle: "Household Management — Weekly Support",
    seedSummary: "Weekly household management support with session logs.",
    riskLevel: 3,
  },
  {
    actionCode: "E.1.1",
    slug: "graphic-design-deliverable",
    seedTitle: "Graphic Design — Deliverable Project",
    seedSummary: "Creative design deliverable project with iterative acceptance rounds.",
    riskLevel: 2,
  },
  {
    actionCode: "E.3.1",
    slug: "custom-software-build",
    seedTitle: "Custom Software Development — Build Engagement",
    seedSummary: "Custom software build engagement with phased deliverables and QA verification.",
    riskLevel: 3,
  },
  {
    actionCode: "F.1.2",
    slug: "event-coordination-single",
    seedTitle: "Event Coordination — Single Event",
    seedSummary: "Single-event coordination with checkpoint deliverables.",
    riskLevel: 2,
  },
  {
    actionCode: "G.1.1",
    slug: "one-to-one-tutoring-course",
    seedTitle: "One-to-One Tutoring — Course of Sessions",
    seedSummary: "Structured tutoring course with session verification and completion.",
    riskLevel: 2,
  },
  {
    actionCode: "H.1.1",
    slug: "property-condition-inspection",
    seedTitle: "Property Condition Assessment — Inspection Report",
    seedSummary: "Property condition inspection producing a formal assessment report.",
    riskLevel: 4,
  },
];

const DOMAIN_MILESTONE_PATTERNS: Record<string, MilestonePatternRef[]> = {
  A: [
    { milestoneCode: "M-ACCESS", sequenceOrder: 1, blocking: true },
    { milestoneCode: "M-WIP", sequenceOrder: 2, blocking: true },
    { milestoneCode: "M-VERIFY", sequenceOrder: 3, blocking: true },
    { milestoneCode: "M-ACCEPT", sequenceOrder: 4, blocking: true },
    { milestoneCode: "M-COMPLETE", sequenceOrder: 5, blocking: false },
  ],
  B: [
    { milestoneCode: "M-ACCESS", sequenceOrder: 1, blocking: true },
    { milestoneCode: "M-SCOPE", sequenceOrder: 2, blocking: true },
    { milestoneCode: "M-WIP", sequenceOrder: 3, blocking: true },
    { milestoneCode: "M-VERIFY", sequenceOrder: 4, blocking: true },
    { milestoneCode: "M-ACCEPT", sequenceOrder: 5, blocking: true },
    { milestoneCode: "M-COMPLETE", sequenceOrder: 6, blocking: false },
  ],
  C: [
    { milestoneCode: "M-SCOPE", sequenceOrder: 1, blocking: true },
    { milestoneCode: "M-DELIVER", sequenceOrder: 2, blocking: true },
    { milestoneCode: "M-ACCEPT", sequenceOrder: 3, blocking: true },
    { milestoneCode: "M-COMPLETE", sequenceOrder: 4, blocking: false },
  ],
  D: [
    { milestoneCode: "M-ACCESS", sequenceOrder: 1, blocking: true },
    { milestoneCode: "M-WIP", sequenceOrder: 2, blocking: true },
    { milestoneCode: "M-COMPLETE", sequenceOrder: 3, blocking: false },
  ],
  E: [
    { milestoneCode: "M-SCOPE", sequenceOrder: 1, blocking: true },
    { milestoneCode: "M-DELIVER", sequenceOrder: 2, blocking: true },
    { milestoneCode: "M-ACCEPT", sequenceOrder: 3, blocking: true },
    { milestoneCode: "M-COMPLETE", sequenceOrder: 4, blocking: false },
  ],
  F: [
    { milestoneCode: "M-SCOPE", sequenceOrder: 1, blocking: true },
    { milestoneCode: "M-WIP", sequenceOrder: 2, blocking: true },
    { milestoneCode: "M-DELIVER", sequenceOrder: 3, blocking: true },
    { milestoneCode: "M-COMPLETE", sequenceOrder: 4, blocking: false },
  ],
  G: [
    { milestoneCode: "M-SCOPE", sequenceOrder: 1, blocking: true },
    { milestoneCode: "M-WIP", sequenceOrder: 2, blocking: true },
    { milestoneCode: "M-VERIFY", sequenceOrder: 3, blocking: true },
    { milestoneCode: "M-COMPLETE", sequenceOrder: 4, blocking: false },
  ],
  H: [
    { milestoneCode: "M-ACCESS", sequenceOrder: 1, blocking: true },
    { milestoneCode: "M-WIP", sequenceOrder: 2, blocking: true },
    { milestoneCode: "M-DELIVER", sequenceOrder: 3, blocking: true },
    { milestoneCode: "M-COMPLETE", sequenceOrder: 4, blocking: false },
  ],
};

export function buildEvidenceRequirements(
  riskLevel: 1 | 2 | 3 | 4 | 5,
  milestoneCode: string
): EvidenceRequirement[] {
  if (milestoneCode !== "M-VERIFY" && milestoneCode !== "M-DELIVER") {
    if (milestoneCode === "M-ACCESS" || milestoneCode === "M-WIP" || milestoneCode === "M-COMPLETE") {
      return [{ evidenceType: "EV-TS", milestoneCode, required: true }];
    }
    if (milestoneCode === "M-ACCEPT" || milestoneCode === "M-SCOPE") {
      return [{ evidenceType: "EV-SIGN", milestoneCode, required: true }];
    }
    return [];
  }

  if (riskLevel <= 2) {
    return [
      { evidenceType: "EV-CHECK", milestoneCode, required: true },
      { evidenceType: "EV-TS", milestoneCode, required: false },
    ];
  }
  if (riskLevel === 3) {
    return [
      { evidenceType: "EV-PHOTO", milestoneCode, required: true },
      { evidenceType: "EV-CHECK", milestoneCode, required: true },
    ];
  }
  return [
    { evidenceType: "EV-PHOTO", milestoneCode, required: true },
    { evidenceType: "EV-DOC", milestoneCode, required: true },
    { evidenceType: "EV-CRED", milestoneCode, required: true },
  ];
}

export function buildTekrrBinding(actionCode: string): TekrrBinding {
  const template = getTemplateByActionCode(actionCode);
  return {
    templateId: template?.templateId ?? `CT-${actionCode}@v1`,
    requiredFields: (template?.requiredTekrrFields ?? []).map((field) => ({
      dimension: field.dimension,
      field: field.field,
    })),
    dimensions: template?.tekrrDimensions ?? ["T", "E", "K", "R", "S"],
  };
}

export function buildDomainMilestonePattern(domain: string): MilestonePatternRef[] {
  return DOMAIN_MILESTONE_PATTERNS[domain] ?? DOMAIN_MILESTONE_PATTERNS.B;
}

export function buildBlueprintId(actionCode: string, slug: string): string {
  return `blueprint://app13/${actionCode}/${slug}`;
}

function resolveActionType(actionCode: string): ActionTypeDefinition {
  const actionType = MVP_ACTION_TYPES.find((entry) => entry.actionCode === actionCode);
  if (!actionType) {
    throw new Error(`unknown MVP taxonomy code: ${actionCode}`);
  }
  return actionType;
}

export function buildSeedBlueprint(definition: (typeof SEED_DEFINITIONS)[number]): ActionBlueprint {
  const actionType = resolveActionType(definition.actionCode);
  const template = getTemplateByActionCode(definition.actionCode);
  const domain = actionType.domain;
  const milestonePattern = buildDomainMilestonePattern(domain);
  const riskLevel =
    definition.riskLevel ??
    ((template?.defaultRiskLevel ?? 3) as 1 | 2 | 3 | 4 | 5);
  const minProviderTier = (template?.minProviderTier ?? "T1") as ProviderTier;
  const evidenceRequirements = milestonePattern.flatMap((milestone) =>
    buildEvidenceRequirements(riskLevel, milestone.milestoneCode)
  );

  return {
    blueprintId: buildBlueprintId(definition.actionCode, definition.slug),
    version: "1.0.0",
    status: "published",
    primaryTaxonomyCode: definition.actionCode,
    domain,
    title: definition.seedTitle,
    summary: definition.seedSummary,
    intent: {
      verb: "execute",
      object: actionType.actionName,
      beneficiary: "customer",
      outcome: definition.seedSummary,
    },
    scope: {
      inclusions: [`Standard ${actionType.actionName} scope per APP13 taxonomy`],
      exclusions: ["Out-of-scope work requires a separate blueprint instance"],
      assumptions: ["Provider meets minimum verification tier"],
      jurisdictionHints: [],
    },
    actorRequirements: {
      providerRole: "service_provider",
      requiredCredentials: minProviderTier === "T2" ? ["trade_or_professional_credential"] : [],
      minProviderTier,
      partyCount: 2,
    },
    tekrrBinding: buildTekrrBinding(definition.actionCode),
    milestonePattern,
    evidenceRequirements,
    composition: { kind: "atomic" },
    sourceChannel: "registry",
    transformationTrace: [
      {
        step: "seed_registry",
        ruleId: "taxonomy-bridge.seed",
        detail: `Seed blueprint for MVP taxonomy code ${definition.actionCode}`,
        score: 1,
      },
    ],
    minProviderTier,
    riskLevelDefault: riskLevel,
    schemaVersion: BLUEPRINT_SCHEMA_VERSION,
  };
}

export function buildSeedRegistry(): ActionBlueprint[] {
  return SEED_DEFINITIONS.map(buildSeedBlueprint);
}

export function buildTaxonomyBridge(): TaxonomyBridgeEntry[] {
  return SEED_DEFINITIONS.map((definition) => {
    const blueprint = buildSeedBlueprint(definition);
    return {
      action_code: blueprint.primaryTaxonomyCode,
      action_name: resolveActionType(definition.actionCode).actionName,
      domain: blueprint.domain,
      blueprint_id: blueprint.blueprintId,
      seed_title: blueprint.title,
      seed_summary: blueprint.summary,
      min_provider_tier: blueprint.minProviderTier,
      risk_level_default: blueprint.riskLevelDefault,
      milestone_pattern: blueprint.milestonePattern,
      evidence_requirements: blueprint.evidenceRequirements,
    };
  });
}

export function getTaxonomyBridgeEntry(actionCode: string): TaxonomyBridgeEntry | undefined {
  return buildTaxonomyBridge().find((entry) => entry.action_code === actionCode);
}

export function getSeedBlueprintByTaxonomyCode(actionCode: string): ActionBlueprint | undefined {
  const definition = SEED_DEFINITIONS.find((entry) => entry.actionCode === actionCode);
  return definition ? buildSeedBlueprint(definition) : undefined;
}

export function getSeedBlueprintById(blueprintId: string): ActionBlueprint | undefined {
  const definition = SEED_DEFINITIONS.find(
    (entry) => buildBlueprintId(entry.actionCode, entry.slug) === blueprintId
  );
  return definition ? buildSeedBlueprint(definition) : undefined;
}

export const SERVICE_DESCRIPTION_KEYWORDS: Array<{
  actionCode: string;
  keywords: string[];
  ruleId: string;
}> = [
  { actionCode: "A.2.1", keywords: ["surface repair", "drywall", "patch wall", "wall repair"], ruleId: "service.surface_repair" },
  { actionCode: "A.4.1", keywords: ["routine maintenance", "maintenance visit", "upkeep"], ruleId: "service.maintenance" },
  { actionCode: "A.4.2", keywords: ["clean", "cleaning", "sanitize", "sanitization", "housekeeping"], ruleId: "service.cleaning" },
  { actionCode: "B.1.2", keywords: ["plumb", "plumbing", "pipe", "leak", "drain", "kitchen pipe"], ruleId: "service.plumbing" },
  { actionCode: "B.2.1", keywords: ["electric", "electrical", "wiring", "panel", "circuit"], ruleId: "service.electrical" },
  { actionCode: "B.3.3", keywords: ["troubleshoot", "debug", "incident", "technical issue", "it support"], ruleId: "service.troubleshooting" },
  { actionCode: "C.1.1", keywords: ["strategy consulting", "strategy advisory", "business strategy"], ruleId: "service.strategy" },
  { actionCode: "C.1.2", keywords: ["operations advisory", "process review", "operational improvement"], ruleId: "service.operations" },
  { actionCode: "D.1.1", keywords: ["personal care", "care assistant", "care session"], ruleId: "service.personal_care" },
  { actionCode: "D.3.1", keywords: ["household management", "home management", "weekly support"], ruleId: "service.household" },
  { actionCode: "E.1.1", keywords: ["graphic design", "logo design", "branding design"], ruleId: "service.graphic_design" },
  { actionCode: "E.3.1", keywords: ["software development", "custom software", "build application", "build app"], ruleId: "service.software" },
  { actionCode: "F.1.2", keywords: ["event coordination", "plan event", "coordinate event"], ruleId: "service.event" },
  { actionCode: "G.1.1", keywords: ["tutor", "tutoring", "one-to-one tutoring", "lesson"], ruleId: "service.tutoring" },
  { actionCode: "H.1.1", keywords: ["property inspection", "condition assessment", "home inspection"], ruleId: "service.inspection" },
];

export const PROJECT_INTENT_RULES: Array<{
  id: string;
  keywords: string[];
  actionCode: string;
}> = [
  { id: "company-website", keywords: ["build company website", "website project", "build website"], actionCode: "E.3.1" },
  { id: "office-move", keywords: ["office move", "relocation project", "move office"], actionCode: "F.1.2" },
  { id: "home-renovation", keywords: ["home renovation", "renovation project", "remodel"], actionCode: "A.2.1" },
  { id: "care-program", keywords: ["care program", "care plan project", "elder care program"], actionCode: "D.1.1" },
  { id: "learning-program", keywords: ["learning program", "training program", "course of study"], actionCode: "G.1.1" },
  { id: "annual-maintenance-program", keywords: ["annual maintenance", "maintenance program"], actionCode: "A.4.1" },
];
